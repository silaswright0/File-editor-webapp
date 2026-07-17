export class PdfViewer {
    constructor(containerId){
        this.container = document.getElementById(containerId);
        this.currentDocument = null;
        this.isDrawingMode = false;
        this.isDrawing = false;
        this.paths = [];
        this.currentPath = null;
        this.scale = 1.5;
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }

    async loadPdf(data){
        console.log(`[PdfViewer] Loading... `);
        this.container.innerHTML = `<p style="color: #2563eb;">Rendering Document...</p>`;
        
        try {
            let objectUrl;
            if (data instanceof Blob || data instanceof File) {
                objectUrl = URL.createObjectURL(data);
            } else {
                const blob = new Blob([data], { type: 'application/pdf' });
                objectUrl = URL.createObjectURL(blob);
            }
        
            const loadingTask = window.pdfjsLib.getDocument({url: objectUrl});
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

        this.canvas = canvas;
        this.context = this.context;
        this.canvas.addEventListener('mousedown', this.startDrawing.bind(this));
        this.canvas.addEventListener('mousemove', this.isDrawing.bind(this));
        this.canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
        this.canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
    }

    toggleDrawingMode(){
        this.isDrawingMode = !this.isDrawingMode;
        this.canvas.style.cursor = this.isDrawingMode ? 'crosshiar' : 'default';
        console.log(`[PdfViewer] Drawing mode: ${this.isDrawingMode}`);
    }

    startDrawing(e){
        if (!this.isDrawingMode) return;
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        this.currentPath = [{x,y}];
        this.context.beginPath();
        this.context.moveTo(x,y);
        this.context.stokeStyle = 'red';
        this.context.lineWidth = 2;
        this.context.lineCap = 'round';
    }

    draw(e){
        if (!this.isDrawing || this.isDrawingMode) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.currentPath.push({x,y});
        this.context.lineTo(x,y);
        this.context.stoke();
    }

    stopDrawing(){
        if (!this.isDrawing || !this.isDrawingMode) return;
        this.isDrawing = false;
        if (this.currentPath && this.currentPath.length > 0){
            this.paths.push(this.currentPath);
        }
        this.currentPath;
    }

    getPathsForExport(){
        return {paths: this.paths, scale: this.scale};
    }

    zoomIn(){
        console.log('[PdfViewer] Zooming in...')
    }
}