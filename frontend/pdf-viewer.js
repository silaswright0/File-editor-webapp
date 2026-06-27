export class PdfViewer {
    constructor(containerId){
        this.container = document.getElementById(containerId);
        this.currentDocument = null;
    }

    loadPdf(file){
        console.log(`[PdfViewer] Loading ${file.name}...`);

        // Placeholder for actual rendering logic (e.g., using PDF.js)
        this.container.innerHTML = `
            <div class="text-center">
                <svg class="mx-auto h-12 w-12 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p class="text-blue-600 font-medium">Rendering: ${file.name}</p>
            </div>
        `;

        this.currentDocument = file;
    }

    zoomIn(){
        console.log('[PdfViewer] Zooming in...')
    }
}