import { supabase } from '@/lib/supabase';
import { addStampToDocument } from './documentStamping';

const UPLOAD_FUNCTION_URL = 'https://pcsxikfvpunrkhfnauqr.supabase.co/functions/v1/833fa4d1-a392-48cd-8f21-6b2c2785ff92';

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
const DIRECT_UPLOAD_THRESHOLD_BYTES = 8 * 1024 * 1024; // 8 MB

const uint8ArrayToBase64 = (bytes: Uint8Array): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Converting ${bytes.length} bytes to base64...`);
      const blob = new Blob([bytes], { type: 'application/octet-stream' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        console.log(`Conversion complete, base64 length: ${base64.length}`);
        resolve(base64);
      };
      reader.onerror = () => {
        console.error('FileReader error:', reader.error);
        reject(reader.error);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error in uint8ArrayToBase64:', error);
      reject(error);
    }
  });
};

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

const attemptDirectUploadFallback = async (
  params: UploadParams,
  fileBytes: Uint8Array,
  fileName: string,
  contentType: string
) => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    throw new Error('Unable to identify authenticated user for fallback upload.');
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
    
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    let fileDataToUpload: string;
    let bytesForFallback: Uint8Array | null = null;
    const fileName = params.file?.name || params.fileName || `${params.title}.pdf`;
    const contentType = params.file?.type || 'application/pdf';

    if (params.file) {
      if (params.file.type === 'application/pdf') {
        console.log('Processing PDF file:', params.file.name, 'Size:', params.file.size);
        const arrayBuffer = await params.file.arrayBuffer();
        const pdfBytes = new Uint8Array(arrayBuffer);
        console.log('PDF loaded, starting stamping process...');
        const stampOptions = {
          submitterName: params.submitterName || '',
          isTrusteeUpload: params.isTrusteeUpload,
          trusteeName: params.trusteeName,
          clientName: params.clientName
        };
        const stampedPdfBytes = await addStampToDocument(pdfBytes, stampOptions);
        bytesForFallback = stampedPdfBytes;

        const shouldUseDirectUploadFirst =
          (params.file.size || 0) > DIRECT_UPLOAD_THRESHOLD_BYTES ||
          stampedPdfBytes.length > DIRECT_UPLOAD_THRESHOLD_BYTES;
        if (shouldUseDirectUploadFirst) {
          console.log('Large file detected. Using direct upload path first.');
          const fallbackDocument = await attemptDirectUploadFallback(
            params,
            stampedPdfBytes,
            fileName,
            contentType
          );
          return { success: true, document: fallbackDocument };
        }

        console.log('Stamping complete, converting to base64...');
        fileDataToUpload = await uint8ArrayToBase64(stampedPdfBytes);
      } else {
        console.log('Processing non-PDF file:', params.file.name);
        const arrayBuffer = await params.file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        bytesForFallback = bytes;

        const shouldUseDirectUploadFirst =
          (params.file.size || 0) > DIRECT_UPLOAD_THRESHOLD_BYTES ||
          bytes.length > DIRECT_UPLOAD_THRESHOLD_BYTES;
        if (shouldUseDirectUploadFirst) {
          console.log('Large file detected. Using direct upload path first.');
          const fallbackDocument = await attemptDirectUploadFallback(
            params,
            bytes,
            fileName,
            contentType
          );
          return { success: true, document: fallbackDocument };
        }

        fileDataToUpload = await uint8ArrayToBase64(bytes);
      }
    } else {
      fileDataToUpload = params.fileData || '';
      bytesForFallback = fileDataToUpload ? base64ToUint8Array(fileDataToUpload) : null;
    }
    
    const requestBody = {
      title: params.title,
      submitterName: params.isTrusteeUpload ? params.clientName : (params.submitterName || params.trusteeName),
      fileName,
      fileData: fileDataToUpload,
      clientName: params.clientName,
      clientEmail: params.clientEmail,
      privateNote: params.privateNote,
      isTrusteeUpload: params.isTrusteeUpload,
      trusteeId: params.trusteeId,
      trusteeName: params.trusteeName,
      folderId: params.folderId === 'no-folder' ? null : params.folderId,
      isPublic: params.isPublic ?? false
    };
    
    console.log('Making request to:', UPLOAD_FUNCTION_URL);
    console.log('Request body isPublic:', requestBody.isPublic, 'from params.isPublic:', params.isPublic);
    let response: Response;
    try {
      response = await fetch(UPLOAD_FUNCTION_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });
    } catch (fetchError) {
      if (bytesForFallback) {
        console.warn('Edge request failed before response. Attempting direct upload fallback...');
        const fallbackDocument = await attemptDirectUploadFallback(
          params,
          bytesForFallback,
          fileName,
          contentType
        );
        return { success: true, document: fallbackDocument };
      }

      throw fetchError;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload response error:', errorText);

      const shouldFallback =
        response.status >= 500 ||
        response.status === 413 ||
        errorText.toLowerCase().includes('file upload failed');
      if (shouldFallback && bytesForFallback) {
        console.warn('Edge upload failed. Attempting direct upload fallback...');
        const fallbackDocument = await attemptDirectUploadFallback(
          params,
          bytesForFallback,
          fileName,
          contentType
        );
        return { success: true, document: fallbackDocument };
      }

      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Upload response:', result);
    
    if (!result.success) {
      const errorMessage = String(result.error || 'Upload failed');
      const shouldFallback = errorMessage.toLowerCase().includes('file upload failed');
      if (shouldFallback && bytesForFallback) {
        console.warn('Edge upload returned failure. Attempting direct upload fallback...');
        const fallbackDocument = await attemptDirectUploadFallback(
          params,
          bytesForFallback,
          fileName,
          contentType
        );
        return { success: true, document: fallbackDocument };
      }
      throw new Error(result.error || 'Upload failed');
    }

    // WORKAROUND: Edge Function doesn't properly handle isPublic, so update it directly
    if (result.document && params.isPublic !== undefined && result.document.is_public !== params.isPublic) {
      console.log(`Fixing is_public field: Edge Function returned ${result.document.is_public}, but should be ${params.isPublic}`);
      
      const { error: updateError } = await supabase
        .from('documents')
        .update({ is_public: params.isPublic })
        .eq('id', result.document.id);
      
      if (updateError) {
        console.error('Failed to update is_public field:', updateError);
      } else {
        result.document.is_public = params.isPublic;
        console.log('Successfully updated is_public to:', params.isPublic);
      }
    }

    return { success: true, document: result.document };
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
