import {PdfViewer} from './pdf-viewer.js';
import {PdfEditor} from './pdf-editor.js';

document.addEventListener('DOMContentLoaded', () => {
    const viewer = new PdfViewer('pdf-render-area');
    const editor = new PdfEditor('editor-tools');
    editor.initTools();

    editor.onEdit = async (modifiedBytes) => {
        await viewer.loadPdfBytes(modifiedBytes);
    };
    document.getElementById('upload-btn').addEventListener('click', async () => {
        const fileInput = document.getElementById('pdf-file-input');
        const statusMessage = document.getElementById('status-message');

        if  (fileInput.files.length === 0){
            statusMessage.innerText = "Please upload a PDF file first";
            statusMessage.style.color = "red";
            return;
        }

        const file = fileInput.files[0];//take only one file

        console.log(`[App] Original file size: ${file.size} bytes`);
        if (file.size === 0) {
            alert("This file is 0 bytes! It might be a corrupted file or an iCloud/OneDrive cloud stub. Please try a different PDF.");
            return;
        }
        const arrayBuffer = await file.arrayBuffer();
        console.log(`[App] Buffer size extracted: ${arrayBuffer.byteLength} bytes`);

        const formData = new FormData();
        formData.append('file', file);

        statusMessage.innerText = "Uploading...";
        statusMessage.style.color = "blue";

        try {
            const response = await fetch('http://localhost:5000/api/pdf/upload', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                statusMessage.innerText = `Success! Saved as: ${data.filename}`;
                statusMessage.style.color = "green";

                const arraybuffer = await file.arraybuffer;
                await viewer.loadPdfBytes(arraybuffer);

                if (editor.setPdfBytes){
                    editor.setPdfBytes(arraybuffer,file.name);
                }

                //viewer.loadPdf(file);
            } else {
                statusMessage.innerText = `Upload failed: ${data.error}`;
                statusMessage.style.color = "red";
            }
        }catch (error){
            console.error("error uploading file:", error);
            statusMessage.innerText = "server error, is your python backend configured and running?";
            statusMessage.style.color = "red";
        }
    });
});