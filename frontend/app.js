import {PdfViewer} from './pdf-viewer.js';
import {PdfEditor} from './pdf-editor.js';

document.addEventListener('DOMContentLoaded'), () => {
    const viewer = new PdfViewer('pdf-render-area');
    const editor = new PdfEditor('editor-tools');
    editor.initTools();
}