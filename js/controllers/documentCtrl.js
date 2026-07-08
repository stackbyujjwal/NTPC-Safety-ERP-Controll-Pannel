/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Document Management Controller (Safety Manuals, Checklists, Circulars)
 */

import { dataService } from '../services/dataService.js';

export class DocumentController {
    constructor(app) {
        this.app = app;
        this.searchTerm = '';
        this.selectedCategory = 'all';
    }

    async render() {
        let docs = await dataService.getAll('documents');
        if (this.selectedCategory !== 'all') {
            docs = docs.filter(d => d.category === this.selectedCategory);
        }
        if (this.searchTerm) {
            const low = this.searchTerm.toLowerCase();
            docs = docs.filter(d => d.title.toLowerCase().includes(low) || d.author.toLowerCase().includes(low));
        }

        const categories = ['Manual', 'Checklist', 'Circular'];

        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-folder-open me-2"></i>Digital Safety Document Library</h3>
                    <div class="text-muted" style="font-size:12px;">Standard operating procedures (SOPs), inspection checklists, and circulars</div>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-erp-primary btn-sm" onclick="app.getController('documents').openUploadModal()">
                        <i class="fas fa-cloud-upload-alt"></i> Upload New Document
                    </button>
                </div>
            </div>

            <!-- Search & Filter Bar -->
            <div class="filter-bar">
                <div class="d-flex align-items-center gap-2 flex-grow-1">
                    <i class="fas fa-search text-muted"></i>
                    <input type="text" class="form-control form-control-sm" placeholder="Search document titles or issuing authority..." value="${this.searchTerm}" oninput="app.getController('documents').handleSearch(this.value)">
                </div>
                <div class="d-flex align-items-center gap-1 ms-2">
                    <button class="btn btn-sm ${this.selectedCategory === 'all' ? 'btn-erp-primary' : 'btn-erp-outline'}" onclick="app.getController('documents').filterCategory('all')">All Files</button>
                    ${categories.map(c => `
                        <button class="btn btn-sm ${this.selectedCategory === c ? 'btn-erp-primary' : 'btn-erp-outline'}" onclick="app.getController('documents').filterCategory('${c}')">${c}s</button>
                    `).join('')}
                </div>
            </div>

            <!-- Document Cards List -->
            <div class="row g-3">
                ${docs.length > 0 ? docs.map(d => {
            const iconClass = d.title && (d.title.toLowerCase().endsWith('.xlsx') || d.title.toLowerCase().endsWith('.xls') || d.category === 'Checklist') ? 'fa-file-excel text-success' : 'fa-file-pdf text-danger';
            return `
                        <div class="col-md-6 col-xl-4">
                            <div class="erp-card h-100 mb-0">
                                <div class="erp-card-body d-flex align-items-start gap-3">
                                    <div class="fs-1 ${iconClass} p-2 bg-light rounded text-center" style="width:60px;"></div>
                                    <div class="flex-grow-1 overflow-hidden">
                                        <span class="badge bg-secondary mb-1" style="font-size:9.5px;">${d.category}</span>
                                        <h6 class="fw-bold text-primary text-truncate mb-1" title="${d.title}">${d.title}</h6>
                                        <div class="text-muted" style="font-size:11px;">Author: <strong>${d.author}</strong></div>
                                        <div class="text-muted" style="font-size:10.5px;">Uploaded: ${d.uploadDate || new Date().toISOString().split('T')[0]} | Size: ${d.size || '1.2 MB'}</div>
                                        <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                                            ${d.fileData || d.url ? `<button type="button" onclick="app.getController('documents').downloadDoc('${d.id}')" class="btn btn-sm btn-erp-primary py-1 px-2"><i class="fas fa-download me-1"></i> Download File</button>` : `<button type="button" onclick="Swal.fire('Info', 'No file attached. Please upload a real PDF or XLSX file.', 'info')" class="btn btn-sm btn-erp-outline py-1 px-2"><i class="fas fa-download me-1"></i> Download</button>`}
                                            <button class="btn btn-sm text-danger border-0 bg-transparent" onclick="app.getController('documents').deleteDoc('${d.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
        }).join('') : `
                    <div class="col-12 text-center py-5 text-muted">No safety documents found matching search criteria.</div>
                `}
            </div>
        `;
    }

    async downloadDoc(idOrUrl, encodedTitle) {
        try {
            let base64Data = null;
            let fileName = 'document';
            if (idOrUrl && (idOrUrl.startsWith('DOC-') || !idOrUrl.includes('//') && !idOrUrl.startsWith('data:'))) {
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        title: 'Retrieving Document...',
                        text: 'Please wait while we fetch the document from Firestore.',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });
                }
                const doc = await dataService.getById('documents', idOrUrl);
                if (!doc) {
                    if (typeof Swal !== 'undefined') Swal.close();
                    Swal.fire('Error', 'Document not found.', 'error');
                    return;
                }
                base64Data = doc.fileData || doc.url;
                fileName = doc.fileName || doc.title || 'document';
            } else {
                base64Data = decodeURIComponent(idOrUrl);
                fileName = decodeURIComponent(encodedTitle || 'document');
            }
            if (!base64Data) {
                if (typeof Swal !== 'undefined') Swal.close();
                Swal.fire('Error', 'No file attachment found for this document.', 'error');
                return;
            }
            const a = document.createElement('a');
            a.href = base64Data;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            if (typeof Swal !== 'undefined') Swal.close();
        } catch (e) {
            console.error("Download error:", e);
            if (typeof Swal !== 'undefined') {
                Swal.fire('Error', 'Failed to download document.', 'error');
            }
        }
    }

    handleSearch(val) {
        this.searchTerm = val;
        this.app.renderCurrentModule();
    }

    filterCategory(cat) {
        this.selectedCategory = cat;
        this.app.renderCurrentModule();
    }

    async openUploadModal() {
        const { value: formValues } = await Swal.fire({
            title: '<strong style="color:#0A2647;">Upload Safety Document</strong>',
            html: `
                <div style="text-align:left; font-size:13px;">
                    <label class="fw-bold mt-2">Document Title</label>
                    <input id="docTitle" type="text" class="form-control" placeholder="e.g. CHP Coal Conveyor Emergency SOP">

                    <label class="fw-bold mt-2">Category</label>
                    <select id="docCategory" class="form-select">
                        <option value="Manual">Safety Manual / SOP (.PDF)</option>
                        <option value="Checklist">Inspection Checklist Form (.XLSX Excel)</option>
                        <option value="Circular">Executive Safety Circular (.PDF)</option>
                    </select>

                    <label class="fw-bold mt-2">Issuing Authority / Author</label>
                    <input id="docAuthor" type="text" class="form-control" value="Safety & Fire Services">

                    <label class="fw-bold mt-2 text-primary"><i class="fas fa-file-upload me-1"></i>Select File Attachment (.PDF / .XLSX)</label>
                    <input id="docFile" type="file" accept=".pdf,.xlsx,.xls" class="form-control mt-1">
                    <small class="text-danger d-block mt-1 fw-bold"><i class="fas fa-exclamation-triangle me-1"></i>Warning: Please upload file less than 1 MB</small>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#0A2647',
            confirmButtonText: '<i class="fas fa-cloud-upload-alt me-1"></i> Upload Document',
            preConfirm: async () => {
                const title = document.getElementById('docTitle').value || 'Standard Safety SOP';
                const fileInput = document.getElementById('docFile');
                let fileData = null;
                let docSize = (Math.random() * 2 + 0.5).toFixed(1) + ' MB';
                let fileName = null;
                let fileType = null;
                if (fileInput && fileInput.files && fileInput.files[0]) {
                    const file = fileInput.files[0];
                    if (file.size > 1024 * 1024) {
                        Swal.showValidationMessage('<i class="fas fa-exclamation-circle me-1"></i> File size exceeds 1 MB limit! Please upload less than 1 MB.');
                        return false;
                    }
                    if (typeof Swal !== 'undefined') {
                        Swal.showLoading();
                        const btn = Swal.getConfirmButton();
                        if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Uploading...';
                    }
                    docSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
                    fileName = file.name;
                    fileType = file.type;
                    fileData = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = e => resolve(e.target.result);
                        reader.onerror = err => reject(err);
                        reader.readAsDataURL(file);
                    });
                }
                return {
                    title,
                    category: document.getElementById('docCategory').value,
                    author: document.getElementById('docAuthor').value,
                    size: docSize,
                    fileData: fileData,
                    url: fileData,
                    fileName: fileName || title,
                    fileType: fileType || ''
                };
            }
        });

        if (formValues && formValues.title) {
            const newItem = {
                id: `DOC-${Math.floor(10 + Math.random() * 90)}`,
                title: formValues.title,
                category: formValues.category,
                author: formValues.author,
                size: formValues.size,
                fileData: formValues.fileData || null,
                url: formValues.url || null,
                fileName: formValues.fileName || formValues.title,
                fileType: formValues.fileType || '',
                uploadDate: new Date().toISOString().split('T')[0]
            };
            await dataService.create('documents', newItem);
            Swal.fire({ title: 'Uploaded!', text: 'Document added to library.', icon: 'success', timer: 1500, showConfirmButton: false });
            this.app.renderCurrentModule();
        }
    }

    async deleteDoc(id) {
        await dataService.delete('documents', id);
        this.app.renderCurrentModule();
    }
}
