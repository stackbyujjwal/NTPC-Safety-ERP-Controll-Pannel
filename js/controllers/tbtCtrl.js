/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Daily TBT (Toolbox Talk) Controller
 */

import { dataService } from '../services/dataService.js';
import { DEPARTMENTS } from '../config/constants.js';

export class TBTController {
    constructor(app) {
        this.app = app;
        this.searchTerm = '';
    }

    async render() {
        let tbts = await dataService.getAll('tbts');
        if (this.searchTerm) {
            const low = this.searchTerm.toLowerCase();
            tbts = tbts.filter(t => t.topic.toLowerCase().includes(low) || t.department.toLowerCase().includes(low) || t.trainer.toLowerCase().includes(low));
        }

        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-users me-2"></i>Daily TBT Register (Toolbox Talk)</h3>
                    <div class="text-muted" style="font-size:12px;">Mandatory shift pre-job safety briefing logs across plant departments</div>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-erp-primary btn-sm" onclick="app.getController('tbt').openCreateModal()">
                        <i class="fas fa-plus"></i> Log Today's TBT
                    </button>
                    <button class="btn btn-erp-outline btn-sm" onclick="app.exportCSV('tbts')">
                        <i class="fas fa-print"></i> Export Log
                    </button>
                </div>
            </div>

            <!-- Search & Department Filter -->
            <div class="filter-bar">
                <div class="d-flex align-items-center gap-2 flex-grow-1">
                    <i class="fas fa-search text-muted"></i>
                    <input type="text" class="form-control form-control-sm" placeholder="Search TBT topics, departments or trainers..." value="${this.searchTerm}" oninput="app.getController('tbt').handleSearch(this.value)">
                </div>
            </div>

            <!-- TBT Data Table -->
            <div class="erp-table-container">
                <div class="erp-card-header">
                    <span>Recorded TBT Sessions (${tbts.length} sessions)</span>
                </div>
                <div class="table-responsive">
                    <table class="table-erp mb-0">
                        <thead>
                            <tr>
                                <th>TBT ID</th>
                                <th>Date</th>
                                <th>Department</th>
                                <th>Safety Discussion Topic</th>
                                <th>Trainer / Engineer</th>
                                <th>Attendance Count</th>
                                <th>Remarks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tbts.length > 0 ? tbts.map(t => `
                                <tr>
                                    <td class="fw-bold text-primary font-mono">${t.id}</td>
                                    <td>${t.date}</td>
                                    <td><span class="badge bg-secondary p-1">${t.department}</span></td>
                                    <td class="fw-bold">${t.topic}</td>
                                    <td>${t.trainer}</td>
                                    <td><span class="badge bg-success p-1 px-2">${t.attendance} Workers</span></td>
                                    <td class="text-muted text-truncate" style="max-width:200px;">${t.remarks}</td>
                                    <td>
                                        <button class="btn btn-sm btn-erp-outline text-danger p-1 px-2" onclick="app.getController('tbt').deleteTBT('${t.id}')">
                                            <i class="fas fa-trash-alt"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr><td colspan="8" class="text-center py-5 text-muted">No Daily TBT logs found. Click 'Log Today's TBT' to add a shift register.</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    handleSearch(val) {
        this.searchTerm = val;
        this.app.renderCurrentModule();
    }

    async openCreateModal() {
        const { value: formValues } = await Swal.fire({
            title: '<strong style="color:#0A2647;">Log Shift Toolbox Talk (TBT)</strong>',
            html: `
                <div style="text-align:left; font-size:13px;">
                    <label class="fw-bold mt-2">Date</label>
                    <input id="tbtDate" type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                    
                    <label class="fw-bold mt-2">Department</label>
                    <select id="tbtDept" class="form-select">
                        ${DEPARTMENTS.map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>

                    <label class="fw-bold mt-2">Safety Topic Discussed</label>
                    <input id="tbtTopic" type="text" class="form-control" placeholder="e.g., Working at Height & Lanyard Usage">

                    <label class="fw-bold mt-2">Trainer Signature / Name</label>
                    <input id="tbtTrainer" type="text" class="form-control" placeholder="e.g., Vikramaditya Singh">

                    <label class="fw-bold mt-2">Worker Attendance Count</label>
                    <input id="tbtAttendance" type="number" class="form-control" value="25">

                    <label class="fw-bold mt-2">Remarks</label>
                    <textarea id="tbtRemarks" class="form-control" rows="2" placeholder="Brief summary of worker queries or hazards noted"></textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#0A2647',
            confirmButtonText: 'Submit TBT Log',
            preConfirm: () => {
                return {
                    date: document.getElementById('tbtDate').value,
                    department: document.getElementById('tbtDept').value,
                    topic: document.getElementById('tbtTopic').value,
                    trainer: document.getElementById('tbtTrainer').value,
                    attendance: parseInt(document.getElementById('tbtAttendance').value) || 0,
                    remarks: document.getElementById('tbtRemarks').value
                };
            }
        });

        if (formValues && formValues.topic) {
            const newItem = {
                id: `TBT-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                ...formValues
            };
            await dataService.create('tbts', newItem);
            Swal.fire({ title: 'Logged!', text: 'Daily TBT register updated.', icon: 'success', timer: 1500, showConfirmButton: false });
            this.app.renderCurrentModule();
        }
    }

    async deleteTBT(id) {
        await dataService.delete('tbts', id);
        this.app.renderCurrentModule();
    }
}
