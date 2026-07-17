export class PdfEditor {
    constructor(toolsContainerId) {
        this.toolsContainer = document.getElementById(toolsContainerId);
        this.currentPdfBytes = null;
        this.currentFilename = 'document.pdf';
        this.onEdit = null;
    }

    setPdfBytes(bytes, filename){
        this.currentPdfBytes = bytes;
        this.currentFilename = filename;
    }

    initTools() {
        this.toolsContainer.innerHTML = `
            <div style="display: flex; gap: 12px; justify-content: center; padding: 10px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                
                <button id="add-text-btn" title="Add Text" style="padding: 8px; cursor: pointer; border: none; background: transparent; color: #4b5563;">
                    <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 20V4m-7 4V4h14v4"></path>
                    </svg>
                </button>

                <button id="highlight-btn" title="Highlight" style="padding: 8px; cursor: pointer; border: none; background: transparent; color: #4b5563;">
                    <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                </button>

                <button id="color-btn" title="Coloring Tool" style="padding: 8px; cursor: pointer; border: none; background: transparent; color: #4b5563;">
                    <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
                    </svg>
                </button>

                <button id="save-btn" title="Save & Export" style="padding: 8px; cursor: pointer; border: none; background: transparent; color: #10b981; margin-left: auto;">
                    <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                    </svg>
                </button>

            </div>
        `;

        this.attachListeners();
    }

    attachListeners(){
        document.getElementById('add-text-btn').addEventListener('click', async () => {
            if(!this.currentPdfBytes){
                alert('Please upload a file first');
                return;
            }
            console.log('[PdfEditor] Add text tool activated');

            const {PDFDocument, rgb} = window.PDFLib;
            const pdfDoc = await PDFDocument.load(this.currentPdfBytes);
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            firstPage.drawText('edited via webapp', {
                x: 50,
                y: firstPage.getHeight() -100,
                size: 24,
                color: rgb(0.95,0.1,0.1)
            });
            this.currentPdfBytes = await pdfDoc.save();
            if(this.onEdit){
                this.onEdit(this.currentPdfBytes);
            }
        });

        document.getElementById('highlight-btn').addEventListener('click', () => {
            console.log('[PdfEditor] Highlight tool activated');
        });

        document.getElementById('color-btn').addEventListener('click', () => {
            console.log('[PdfEdtior] Colour tool activated');
            if (this.onDrawToggle) this.onDrawToggle();
        });

        document.getElementById('save-btn').addEventListener('click', async () => {
            console.log('[PdfEditor] Initiating save process...');
            await this.applyDrawings();
            this.saveToServer();
        });
    }

    async applyDrawings(){
        if(!this.getDrawingPaths || !this.currentPdfBytes) return;
        const {paths,scale} = this.getDrawingPaths();
        if (!paths || paths.length ===0) return;
        const{PDFDocument,rgb} = window.PDFLib;
        const pdfDoc = await PDFDocument.load(this.currentPdfBytes);
        const pages = pdfDoc.getPages();
        const firstPage = pages[0];
        const pageHeight = firstPage.getHeight();

        paths.forEach( path => {
            if (path.length < 2) return;
            const startX = path[0].x / scale;
            const startY = pageHeight - (path[0].y / scale);
            let svgPath = `M ${startX} ${startY}`;

            for (let i=1; i<path.length;i++){
                const px = path[i].x / scale;
                const py = pageHeight - (path[i].y / scale);
                svgPath += ` L ${px} ${py}`;
            }

            firstPage.drawSvgPath(svgPath, {
                borderColor: rgb(1,0,0),
                borderWidth: 2 / scale,
            });
        });

        this.currentPdfBytes = await pdfDoc.save();
    }

    async saveToServer() {
        if(!this.currentPdfBytes){
            alert("no pdf uploaded");
            return;
        }
        console.log('Sending data to /api/pdf/upload...');
        const blobData = new Blob([this.currentPdfBytes], {type: 'application/pdf'});
        const exportFilename = `edited_${this.currentFilename}`;
        const downloadUrl = URL.createObjectURL(blobData);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = exportFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(downloadUrl);

        const formData = new FormData();
        formData.append('file', blobData, exportFilename);

        try{
            const response = await fetch ('http://localhost:5000/api/pdf/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok){
                console.log("[PdfEditor] Success! Saved to server as", exportFilename);
            }else{
                console.log("[PdfEditor] Server rejected the save");
            }
        }catch(error){
            console.error("[PdfEditor] Network error saving to server");
        }
    }
}
