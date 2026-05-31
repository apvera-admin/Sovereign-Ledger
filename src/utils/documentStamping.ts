import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export interface StampOptions {
  submitterName: string;
  isTrusteeUpload?: boolean;
  trusteeName?: string;
  clientName?: string;
}

// Helper function to stamp a single page
const stampPage = (
  page: any, 
  font: any, 
  submitterText: string, 
  timestamp: string
): void => {
  const { width } = page.getSize();
  
  // Position stamp in bottom right corner
  const stampX = width - 250;
  const stampY = 35;
  
  // Add "Recorded by: Name" on one line in red
  page.drawText(`Recorded by: ${submitterText}`, {
    x: stampX,
    y: stampY + 12,
    size: 10,
    font,
    color: rgb(0.8, 0, 0),
  });
  
  // Add "Recorded on: Date" on one line in red
  page.drawText(`Recorded on: ${timestamp}`, {
    x: stampX,
    y: stampY - 5,
    size: 10,
    font,
    color: rgb(0.8, 0, 0),
  });
};

export const addStampToDocument = async (pdfBytes: Uint8Array, options: StampOptions): Promise<Uint8Array> => {
  try {
    console.log('Loading PDF document...');
    const pdfDoc = await PDFDocument.load(pdfBytes, { 
      ignoreEncryption: true,
      updateMetadata: false 
    });
    const pages = pdfDoc.getPages();
    const totalPages = pages.length;
    console.log(`PDF loaded with ${totalPages} pages, embedding font...`);
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Create stamp text based on account type
    let submitterText: string;
    if (options.isTrusteeUpload && options.trusteeName && options.clientName) {
      submitterText = `${options.trusteeName} on behalf of ${options.clientName}`;
    } else {
      submitterText = options.submitterName || 'Unknown';
    }
    
    const timestamp = new Date().toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    console.log(`Stamping all ${totalPages} pages with: "${submitterText}"...`);
    
    // Process pages in batches (pagination style) to avoid memory issues
    const BATCH_SIZE = 10;
    for (let batchStart = 0; batchStart < totalPages; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, totalPages);
      console.log(`Processing pages ${batchStart + 1} to ${batchEnd}...`);
      
      for (let pageIndex = batchStart; pageIndex < batchEnd; pageIndex++) {
        try {
          stampPage(pages[pageIndex], font, submitterText, timestamp);
        } catch (pageError) {
          console.error(`Error stamping page ${pageIndex + 1}:`, pageError);
          // Continue with other pages even if one fails
        }
      }
    }
    
    console.log('All pages stamped, saving PDF...');
    const savedPdf = await pdfDoc.save({ useObjectStreams: false });
    console.log(`PDF saved successfully, size: ${savedPdf.length} bytes`);
    return savedPdf;
  } catch (error) {
    console.error('Error adding stamp to document:', error);
    throw error;
  }
};