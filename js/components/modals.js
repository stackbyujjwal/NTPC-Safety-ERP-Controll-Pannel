/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Modal Components (Inspection Form Modal, Signature Pad Modal, Photo Lightbox)
 */

export class ModalComponent {
    static getInspectionFormModalHTML(categories, areas, fy, month) {
        return `
            <div class="modal fade" id="inspectionModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-centered">
                    <div class="modal-content erp-card border-0">
                        <div class="modal-header erp-card-header bg-primary text-white">
                            <h5 class="modal-title m-0 text-white"><i class="fas fa-plus-circle me-2"></i>Create New Safety Inspection</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body p-4">
                            <form id="inspectionCreateForm">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold">Inspection Type / Category <span class="text-danger">*</span></label>
                                        <select class="form-select" id="insCategory" required onchange="const opt = this.options[this.selectedIndex]; if(opt && opt.dataset.freq) { const fe = document.getElementById('insFrequency'); if(fe) fe.value = opt.dataset.freq; }">
                                            ${categories.map(c => `<option value="${c.id}" data-freq="${c.frequency || 'Monthly'}">${c.name}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold">Plant Area <span class="text-danger">*</span></label>
                                        <select class="form-select" id="insArea" required>
                                            ${areas.map(a => `<option value="${a.name}">${a.name}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-bold">Financial Year</label>
                                        <input type="text" class="form-control bg-light text-primary fw-bold" id="insFy" value="${fy || getSmartDateMemory().fy}" readonly>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-bold">Inspection Month</label>
                                        <select class="form-select fw-bold text-success" id="insMonth">
                                            ${['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'].map(m => `<option value="${m}" ${m === month || m.startsWith(month) || month?.startsWith(m.substring(0,3)) ? 'selected' : ''}>${m}</option>`).join('')}
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-bold">Inspection Date <span class="text-danger">*</span></label>
                                        <input type="date" class="form-control" id="insDate" value="${new Date().toISOString().split('T')[0]}" required onchange="if(window.app) window.app.syncDateMemory(this, 'insMonth', 'insFy')">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold">Responsible Person / Engineer <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="insResponsible" placeholder="e.g. S. K. Verma (Mech)" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label fw-bold">Current Status <span class="text-danger">*</span></label>
                                        <select class="form-select" id="insStatus">
                                            <option value="Pending">Pending Action</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Overdue">Overdue</option>
                                        </select>
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label fw-bold">Inspection Findings / Remarks <span class="text-danger">*</span></label>
                                        <textarea class="form-control" id="insRemarks" rows="2" placeholder="Detail the physical condition, equipment serial numbers, or location observations..." required></textarea>
                                    </div>
                                    <div class="col-md-8">
                                        <label class="form-label fw-bold">Corrective Action Required</label>
                                        <input type="text" class="form-control" id="insAction" placeholder="Action needed to close compliance gap">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label fw-bold">Target Closure Date</label>
                                        <input type="date" class="form-control" id="insTargetDate">
                                    </div>
                                    <div class="col-12">
                                        <label class="form-label fw-bold">Verification Photo Attachment</label>
                                        <div class="dropzone-box" onclick="document.getElementById('insPhotoFile').click()">
                                            <i class="fas fa-cloud-upload-alt text-accent fs-3 mb-2"></i>
                                            <div class="fw-bold">Click or Drag & Drop site photo here</div>
                                            <div class="text-muted" style="font-size:11px;">Supports JPG, PNG (Max 5MB)</div>
                                            <input type="file" id="insPhotoFile" class="d-none" accept="image/*" onchange="ModalComponent.handlePreview(this)">
                                            <div id="photoPreviewContainer" class="mt-2 d-none">
                                                <img id="photoPreviewImg" src="" class="img-thumbnail" style="max-height:80px;">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer bg-light">
                            <button type="button" class="btn btn-erp-outline" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-erp-primary" onclick="app.getController('inspections').saveInspection()">
                                <i class="fas fa-save me-1"></i> Submit Record
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static handlePreview(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.getElementById('photoPreviewImg');
                const cont = document.getElementById('photoPreviewContainer');
                if (img && cont) {
                    img.src = e.target.result;
                    cont.classList.remove('d-none');
                }
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    static getLightboxModalHTML() {
        return `
            <div class="modal fade" id="lightboxModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-xl modal-dialog-centered">
                    <div class="modal-content bg-transparent border-0 shadow-none">
                        <div class="modal-body text-center p-0 position-relative">
                            <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3 p-2 bg-dark rounded-circle" data-bs-dismiss="modal"></button>
                            <img id="lightboxImage" src="" class="img-fluid rounded shadow-lg" style="max-height: 85vh;">
                            <div id="lightboxCaption" class="bg-dark text-white p-3 rounded-bottom text-start mt-1"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}
