import { convertDocumentBuffer } from './src/services/documentProcessor.js';
import fs from 'fs';
import path from 'path';

// Create a dummy PDF buffer (header only)
const pdfBuffer = Buffer.from('%PDF-1.7\n%EOF');

async function run() {
    try {
        console.log('Attempting conversion...');
        // We can't easily modify the imported module's internal logs from here, 
        // but we can rely on the logs we added to documentProcessor.js
        await convertDocumentBuffer({
            buffer: pdfBuffer,
            targetFormat: 'txt',
            originalMimetype: 'application/pdf'
        });
    } catch (error) {
        console.error('Caught error:', error.message);
    }
}

run();
