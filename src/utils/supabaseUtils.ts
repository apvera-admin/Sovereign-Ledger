import { supabase } from '@/lib/supabase';
import { addStampToDocument } from './documentStamping';

interface UploadParams {
  file?: File;
  title: string;
  submitterName?: string;
  fileName?: string;
  fileData?: string;
  clientName?: string;
  clientEmail?: string;
  privateNote?: string;
  isTrusteeUpload?: boolean;
  trusteeId?: string;
  trusteeName?: string;
  folderId?: string;
  isPublic?: boolean;
}

let uploadInProgress = false;

const base64ToUint8Array = (base64: string) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const sanitizeFileName = (fileName: string) => {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const generateRecordNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SR-${year}${month}${day}-${randomPart}`;
};

const performDirectUpload = async (
  params: UploadParams,
  fileBytes: Uint8Array,
  fileName: string,
  contentType: string
) => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('Unable to identify authenticated user for upload.');
  }

  const userId = authData.user.id;
  const normalizedFolderId = params.folderId === 'no-folder' ? null : (params.folderId || null);
  const safeFileName = sanitizeFileName(fileName || `${params.title}.pdf`);
  const storagePath = `${userId}/${Date.now()}-${safeFileName}`;

  const fileBlob = new Blob([fileBytes], { type: contentType || 'application/octet-stream' });
  const { error: storageError } = await supabase.storage
    .from('documents')
    .upload(storagePath, fileBlob, {
      contentType: contentType || 'application/octet-stream',
      upsert: false
    });

  if (storageError) {
    throw new Error(`Storage upload failed: ${storageError.message}`);
  }

  const submitterName = params.isTrusteeUpload
    ? (params.clientName || 'Unknown Client')
    : (params.submitterName || params.trusteeName || authData.user.email || 'Unknown');

  const uploadDate = new Date().toISOString();
  const recordNumber = generateRecordNumber();
  const insertPayload: Record<string, any> = {
    user_id: userId,
    title: params.title,
    submitter_name: submitterName,
    file_path: storagePath,
    file_name: fileName,
    is_public: params.isPublic ?? false,
    upload_date: uploadDate,
    record_number: recordNumber
  };

  if (params.isTrusteeUpload) {
    insertPayload.is_trustee_upload = true;
    insertPayload.trustee_id = params.trusteeId || userId;
    if (params.trusteeName) insertPayload.trustee_name = params.trusteeName;
    if (params.clientName) insertPayload.client_name = params.clientName;
    if (params.clientEmail) insertPayload.client_email = params.clientEmail;
    if (params.privateNote) insertPayload.private_note = params.privateNote;
  }

  if (normalizedFolderId) {
    insertPayload.folder_id = normalizedFolderId;
  }

  const { data: documentData, error: insertError } = await supabase
    .from('documents')
    .insert(insertPayload)
    .select('*')
    .single();

  if (insertError) {
    // Best-effort cleanup if DB insert fails after storage upload
    await supabase.storage.from('documents').remove([storagePath]);
    throw new Error(`Database insert failed: ${insertError.message}`);
  }

  return {
    ...documentData,
    upload_date: documentData.upload_date || documentData.created_at || uploadDate,
    record_number: documentData.record_number || recordNumber
  };
};

export const uploadDocument = async (params: UploadParams) => {
  // Prevent multiple simultaneous uploads
  if (uploadInProgress) {
    console.warn('Upload already in progress, ignoring duplicate request');
    return { success: false, error: 'Upload already in progress' };
  }

  uploadInProgress = true;

  try {
    console.log('Starting upload with params:', { ...params, fileData: params.fileData ? '[FILE_DATA]' : 'none' });

    const fileName = params.file?.name || params.fileName || `${params.title}.pdf`;
    const contentType = params.file?.type || 'application/pdf';

    // Resolve the bytes we are going to store. PDFs get the recording stamp applied.
    let fileBytes: Uint8Array;
    if (params.file) {
      const arrayBuffer = await params.file.arrayBuffer();
      let bytes = new Uint8Array(arrayBuffer);

      if (params.file.type === 'application/pdf') {
        console.log('Stamping PDF:', params.file.name, 'Size:', params.file.size);
        const stampOptions = {
          submitterName: params.submitterName || '',
          isTrusteeUpload: params.isTrusteeUpload,
          trusteeName: params.trusteeName,
          clientName: params.clientName
        };
        bytes = await addStampToDocument(bytes, stampOptions);
      }

      fileBytes = bytes;
    } else if (params.fileData) {
      fileBytes = base64ToUint8Array(params.fileData);
    } else {
      throw new Error('No file provided for upload');
    }

    // Upload directly from the client using the user's own session. This bypasses
    // the legacy `upload-document` edge function, which returns HTTP 500 and does
    // not persist the is_public flag. The direct path writes to Storage and inserts
    // the row (with is_public, folder, and trustee fields) in one shot under RLS.
    const document = await performDirectUpload(params, fileBytes, fileName, contentType);
    console.log('Upload complete:', document?.record_number);

    return { success: true, document };
  } catch (error) {
    console.error('Upload error in supabaseUtils:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
  } finally {
    uploadInProgress = false;
  }
};

export const createUserProfile = async (userId: string, email: string, fullName: string, userRole: string = 'individual') => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        email,
        full_name: fullName,
        display_name: fullName,
        user_role: userRole,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, profile: data };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create profile' };
  }
};

export const searchDocuments = async (params: { recordNumber?: string; title?: string; name?: string }) => {
  try {
    let query = supabase.from('documents').select('*');
    
    // Only return public documents in search results
    query = query.eq('is_public', true);
    
    if (params.recordNumber) {
      query = query.ilike('record_number', `%${params.recordNumber}%`);
    }
    
    if (params.title) {
      query = query.ilike('title', `%${params.title}%`);
    }
    
    if (params.name) {
      query = query.or(`submitter_name.ilike.%${params.name}%,client_name.ilike.%${params.name}%`);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

export const getDocumentUrl = (filePath: string) => {
  const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
  return data.publicUrl;
};

export const getViewableDocumentUrl = (filePath: string) => {
  const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
  return `${data.publicUrl}#view=FitH`;
};

export const getShareableLink = (recordNumber: string) => {
  return `${window.location.origin}/document/${recordNumber}`;
};
