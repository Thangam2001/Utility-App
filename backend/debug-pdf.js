import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

console.log('Type:', typeof pdfParse);
console.log('Is default function?', typeof pdfParse.default === 'function');
console.log('Keys:', Object.keys(pdfParse));
try {
    console.log('String representation:', pdfParse.toString());
} catch (e) { }
