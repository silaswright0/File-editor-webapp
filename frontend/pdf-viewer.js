export class PdfViewer {
    constructor(containerId){
        this.container = document.getElementById(containerId);
        this.currentDocument = null;

        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    async loadPdf(file){
        console.log(`[PdfViewer] Loading ${file.name}...`);
        this.container.innerHTML = `<p style="color: #2563eb;">Rendering Document...</p>`;
        
        try {
            const rawBuffer = await file.arrayBuffer();
            const fileBuffer = new Uint8Array(rawBuffer);
            const loadingTask = window.pdfjsLib.getDocument({data: fileBuffer});
            this.currentDocument = await loadingTask.promise;

            const page = await this.currentDocument.getPage(1);
            const viewport = page.getViewport({scale: 1.5});
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            canvas.height = viewport.height;
            canvas.width = viewport.width;
            canvas.style.maxWidth = '100%';
            canvas.style.height = 'auto';
            canvas.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';

            this.container.innerHTML = '';
            this.container.appendChild(canvas);

            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            await page.render(renderContext).promise;

            console.log('[PdfViewer] Render complete!');
        } catch (error) {
            console.error("Error rendering PDF:", error);
            this.container.innerHTML = `<p style="color: red;">Failed to render PDF.</p>`;
        }

        this.currentDocument = file;
    }

    zoomIn(){
        console.log('[PdfViewer] Zooming in...')
    }
}