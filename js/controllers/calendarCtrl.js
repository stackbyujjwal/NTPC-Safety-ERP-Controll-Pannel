/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Calendar Controller (Monthly schedule, Quarterly compliance deadlines, plant events)
 */

import { dataService } from '../services/dataService.js';
import { authService } from '../services/authService.js';

export class CalendarController {
    constructor(app) {
        this.app = app;
    }

    async render() {
        const user = authService.getCurrentUser();
        const isViewer = user?.role === 'viewer';
        const calItems = dataService.getDatabase().calendarItems || [];

        return `
            <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                <div>
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-calendar-check me-2"></i>Plant Safety Calendar & Deadlines</h3>
                    <div class="text-muted" style="font-size:12px;">Quarterly compliance targets, statutory cutoffs, and safety briefing schedule</div>
                </div>
                <div class="d-flex gap-2">
                    ${!isViewer ? `<button class="btn btn-erp-primary btn-sm" onclick="window.app.controllers.calendar.openAdd()"><i class="fas fa-plus me-1"></i> Add Deadline</button>` : ''}
                    <button class="btn btn-erp-outline btn-sm" onclick="window.app.printReport('Safety Deadlines Matrix')"><i class="fas fa-print me-1"></i> Print PDF</button>
                </div>
            </div>
            <div class="erp-card mb-0">
                <div class="erp-card-header d-flex justify-content-between align-items-center">
                    <span>Compliance Matrix (${calItems.length} active items)</span>
                </div>
                <div class="table-responsive">
                    <table class="table-erp mb-0">
                        <thead>
                            <tr><th>Date Slot</th><th>Category</th><th>Description</th><th>Area</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            ${calItems.length ? calItems.map(item => `
                                <tr>
                                    <td class="fw-bold">${item.dateRange}</td>
                                    <td><span class="badge ${item.type.includes('Quarterly') ? 'bg-warning text-dark' : 'bg-danger'}">${item.type}</span></td>
                                    <td class="fw-bold">${item.desc}</td>
                                    <td>${item.area}</td>
                                    <td><span class="badge-erp ${item.status.includes('Active') ? 'badge-warning' : 'badge-danger'}">${item.status}</span></td>
                                    <td>
                                        ${!isViewer ? `<button class="btn btn-sm btn-erp-outline text-danger p-1 px-2" onclick="window.app.controllers.calendar.del('${item.id}')"><i class="fas fa-trash"></i></button>` : ''}
                                    </td>
                                </tr>
                            `).join('') : '<tr><td colspan="6" class="text-center py-4 text-muted">No deadlines or events scheduled yet. Click "Add Deadline" to create one.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async openAdd() {
        if (authService.getCurrentUser()?.role === 'viewer') return;
        const { value: vals } = await Swal.fire({
            title: '<strong style="color:#0A2647;">Add Safety Deadline</strong>',
            html: `
                <div style="text-align:left; font-size:13px;">
                    <label class="fw-bold mt-2">Date / Slot</label>
                    <input id="calDate" class="form-control" placeholder="e.g. July 25 - July 30">
                    <label class="fw-bold mt-2">Type</label>
                    <select id="calType" class="form-select"><option value="Quarterly Due">Quarterly Due</option><option value="Cutoff">Cutoff</option><option value="Statutory Audit">Statutory Audit</option></select>
                    <label class="fw-bold mt-2">Activity Description</label>
                    <input id="calDesc" class="form-control" placeholder="e.g. CHP Conveyor Roller Guard Audit">
                    <label class="fw-bold mt-2">Area / Dept</label>
                    <input id="calArea" class="form-control" value="All Plant Departments">
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#0A2647',
            preConfirm: () => ({
                id: "CAL-" + Math.floor(100 + Math.random() * 900),
                dateRange: document.getElementById('calDate').value || 'Immediate',
                type: document.getElementById('calType').value,
                desc: document.getElementById('calDesc').value,
                area: document.getElementById('calArea').value,
                status: "Scheduled"
            })
        });
        if (vals) {
            const db = dataService.getDatabase();
            if (!db.calendarItems) db.calendarItems = [];
            db.calendarItems.push(vals);
            dataService.saveDatabase(db);
            this.app.renderCurrentModule();
        }
    }

    del(id) {
        if (authService.getCurrentUser()?.role === 'viewer') return;
        if (confirm("Delete deadline?")) {
            const db = dataService.getDatabase();
            db.calendarItems = (db.calendarItems || []).filter(c => c.id !== id);
            dataService.saveDatabase(db);
            this.app.renderCurrentModule();
        }
    }
}
