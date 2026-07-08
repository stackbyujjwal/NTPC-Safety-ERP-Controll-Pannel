/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Incident Recall Controller (4 Recalls Every Month, Week Wise, RCA & Learnings)
 */

import { dataService } from '../services/dataService.js';
import { DEPARTMENTS } from '../config/constants.js';

export class IncidentController {
    constructor(app) {
        this.app = app;
    }

    async render() {
        const filters = { fy: this.app.state.fy, month: this.app.state.month };
        const incidents = await dataService.getAll('incidents', filters);
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-exclamation-triangle me-2"></i>Monthly Incident Recall & Learning Repository</h3>
                    <div class="text-muted" style="font-size:12px;">Logging and tracking safety incident recall sessions & training records</div>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-erp-primary btn-sm" onclick="app.getController('incidents').openCreateModal()">
                        <i class="fas fa-plus"></i> Log Incident Recall
                    </button>
                </div>
            </div>

            <!-- Incident Recall Grid -->
            <div class="row g-4 mb-4">
                ${incidents.length ? incidents.map(inc => `
                    <div class="col-md-6">
                        <div class="erp-card h-100 mb-0 border-0 shadow-sm position-relative transition-all" style="border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 20px rgba(10, 38, 71, 0.08); border: 1px solid rgba(10, 38, 71, 0.1) !important;">
                            <!-- Top Sleek Gradient Bar -->
                            <div style="height: 5px; background: linear-gradient(90deg, #0A2647 0%, #2C74B3 50%, #00d2ff 100%);"></div>
                            
                            <!-- Card Header -->
                            <div class="px-3 py-2.5 d-flex justify-content-between align-items-center" style="background: rgba(10, 38, 71, 0.02); border-bottom: 1px solid rgba(10, 38, 71, 0.08);">
                                <div class="d-flex align-items-center gap-2 flex-wrap">
                                    <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 fw-bold" style="font-size: 11.5px; border-radius: 6px;">
                                        <i class="fas fa-calendar-alt me-1"></i> Date: ${inc.date || inc.week || 'N/A'}
                                    </span>
                                    <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1 fw-bold font-mono" style="font-size: 11.5px; border-radius: 6px;">
                                        Order No: ${inc.orderNo || inc.id || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <button class="btn btn-sm btn-light text-danger d-flex align-items-center justify-content-center shadow-sm" style="width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);" onclick="app.getController('incidents').deleteIncident('${inc.id}')" title="Delete"><i class="fas fa-trash" style="font-size: 13px;"></i></button>
                                </div>
                            </div>

                            <!-- Card Body -->
                            <div class="p-3 pt-3 d-flex flex-column justify-content-between" style="flex: 1; padding: 18px !important;">
                                <div class="mb-3">
                                    <div class="text-uppercase fw-bold mb-1" style="font-size: 11px; color: #64748B; letter-spacing: 0.5px;">Incident Topic</div>
                                    <h5 class="fw-bold mb-0" style="font-size: 16px; line-height: 1.4; color: #0A2647;">
                                        <i class="fas fa-bookmark text-warning me-2"></i>${inc.topic || inc.name || 'Safety Recall Analysis'}
                                    </h5>
                                </div>

                                <!-- Footer Info Box -->
                                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-auto p-2.5" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px;">
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm" style="width: 32px; height: 32px; background: linear-gradient(135deg, #0A2647, #2C74B3); font-size: 13px;">
                                            <i class="fas fa-user-tie"></i>
                                        </div>
                                        <div>
                                            <div style="font-size: 10px; color: #64748B; text-transform: uppercase; font-weight: 700; line-height: 1.1;">Conducted By</div>
                                            <div class="fw-bold text-dark mt-0.5" style="font-size: 13px;">${inc.conductedBy || 'Safety Department'}</div>
                                        </div>
                                    </div>
                                    <div class="text-end">
                                        <div style="font-size: 10px; color: #64748B; text-transform: uppercase; font-weight: 700; line-height: 1.1;">Attendance</div>
                                        <div class="mt-1">
                                            <span class="badge px-2.5 py-1 shadow-sm d-inline-flex align-items-center gap-1 fw-bold" style="background: #10B981; color: #fff; font-size: 12px; border-radius: 6px;">
                                                <i class="fas fa-users" style="font-size: 11px;"></i> ${inc.attendance || '0'} Attendees
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('') : '<div class="col-12"><div class="erp-card p-5 text-center text-muted"><i class="fas fa-exclamation-triangle fs-2 mb-2 d-block text-secondary"></i>No incident recall entries logged yet. Click "Log Incident Recall" above to add a record.</div></div>'}
            </div>
        `;
    }

    async openCreateModal() {
        const today = new Date().toISOString().split('T')[0];
        const { value: formValues } = await Swal.fire({
            title: '<strong style="color:#0A2647;">Log Monthly Incident Recall</strong>',
            html: `
                <div style="text-align:left; font-size:13px;">
                    <label class="fw-bold mt-2">Date <span class="text-danger">*</span></label>
                    <input id="incDate" type="date" class="form-control" value="${today}">

                    <label class="fw-bold mt-2">Order No. <span class="text-danger">*</span></label>
                    <input id="incOrderNo" type="text" class="form-control font-mono" placeholder="e.g. ORD-2026-001">

                    <label class="fw-bold mt-2">Topic <span class="text-danger">*</span></label>
                    <input id="incTopic" type="text" class="form-control" placeholder="e.g. Near-Miss Steam Pipe Gasket Leakage">

                    <label class="fw-bold mt-2">Conducted By <span class="text-danger">*</span></label>
                    <input id="incConductedBy" type="text" class="form-control" placeholder="e.g. Dr. Rajeshwar Rao / Lead Safety Officer">

                    <label class="fw-bold mt-2">Attendance <span class="text-danger">*</span></label>
                    <input id="incAttendance" type="text" class="form-control" placeholder="e.g. 45 Participants">
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#0A2647',
            confirmButtonText: 'Save Recall',
            preConfirm: () => {
                const topic = document.getElementById('incTopic').value.trim();
                const date = document.getElementById('incDate').value;
                const orderNo = document.getElementById('incOrderNo').value.trim();
                const conductedBy = document.getElementById('incConductedBy').value.trim();
                const attendance = document.getElementById('incAttendance').value.trim();
                if (!topic || !date || !orderNo) {
                    Swal.showValidationMessage('Please fill in Date, Order No. and Topic');
                    return false;
                }
                return {
                    date,
                    orderNo,
                    topic,
                    name: topic,
                    conductedBy: conductedBy || 'Safety Officer',
                    attendance: attendance || '0'
                };
            }
        });

        if (formValues) {
            const newItem = {
                id: dataService.getNextSerialId('incidents', 'INC', { date: formValues.date }),
                fy: this.app.state.fy,
                month: this.app.state.month === 'all' ? 'July' : this.app.state.month,
                ...formValues
            };
            await dataService.create('incidents', newItem);
            Swal.fire('Logged & Synced', 'Incident recall entry saved and synced to Firebase.', 'success');
            this.app.renderCurrentModule();
        }
    }

    async deleteIncident(id) {
        await dataService.delete('incidents', id);
        this.app.renderCurrentModule();
    }
}
