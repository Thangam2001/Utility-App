import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testPdfConversion() {
    const textContent = 'Hello World → This is a test with special characters: → ← ↑ ↓';
    const filePath = path.join(__dirname, 'test_special_chars.txt');

    fs.writeFileSync(filePath, textContent);

    const formData = new FormData();
    const blob = new Blob([fs.readFileSync(filePath)], { type: 'text/plain' });
    formData.append('file', blob, 'test_special_chars.txt');
    formData.append('targetFormat', 'pdf');

    try {
        const response = await fetch('http://localhost:4000/api/convert', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('Error response:', response.status, text);
            return;
        }

        const buffer = await response.arrayBuffer();
        const outputPath = path.join(__dirname, 'output_special_chars.pdf');
        fs.writeFileSync(outputPath, Buffer.from(buffer));
        console.log('Success! PDF saved to:', outputPath);
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testPdfConversion();
