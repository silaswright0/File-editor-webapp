export class PdfEditor {
    constructor(toolsContainerId) {
        this.toolsContainer = document.getElementById(toolsContainerId);
    }

    initTools() {
        this.toolsContainer.innerHTML = `
            <button id="add-text-btn" class="w-full bg-blue-50px text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white transition-colors p-2 rounded">
                Add Text Box
            </button>
            <button id="highlight-btn" class="w-full bg-yellow-50 text-yellow-600 border border-yellow-600 hover:bg-yellow-500 hover:text-white transition-colors p-2 rounded">
                Highlight Tool
            </button>
            <div class="flex-grow"></div>
            <button id="save-btn" class="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 shadow-md">
                Save & Export
            </button>
        `;

        this.attachListeners();
    }

    attachListeners(){
        document.getElementById('add-text-btn').addEventListener('click', () => {
            console.log('[PdfEditor] Add text tool activated');
        });

        document.getElementById('save-btn').addEventListener('click', () => {
            console.log('[PdfEditor] Initiating save process...');
            this.saveToServer();
        });
    }

    async saveToServer() {
        console.log('Sending data to /api/pdf/upload...');
        /*
        const formData = new FormData();
        formData.append('file', blobData);
        
        const response = await fetch('/api/pdf/upload', {
            method: 'POST',
            body: formData
        });
        */
    }
}
