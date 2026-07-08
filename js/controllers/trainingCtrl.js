/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Module Training Controller (4 Trainings Every Month: Week 1 to Week 4)
 */

import { dataService } from '../services/dataService.js';
import { DEPARTMENTS } from '../config/constants.js';

export class TrainingController {
    constructor(app) {
        this.app = app;
    }

    async render() {
        const filters = { fy: this.app.state.fy, month: this.app.state.month };
        const trainings = await dataService.getAll('trainings', filters);

        const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-graduation-cap me-2"></i>Safety Module Training (4 Sessions / Month)</h3>
                    <div class="text-muted" style="font-size:12px;">Mandatory weekly competency building schedule for ${this.app.state.month === 'all' ? 'FY ' + this.app.state.fy : this.app.state.month}</div>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-erp-primary btn-sm" onclick="app.getController('training').openScheduleModal()">
                        <i class="fas fa-calendar-plus"></i> Schedule Training Session
                    </button>
                </div>
            </div>

            <!-- 4 Weeks Grid Display -->
            <div class="row g-4 mb-4">
                ${weeks.map((weekName, idx) => {
                    const session = trainings.find(t => t.week === weekName) || null;
                    return `
                        <div class="col-md-6 col-xl-3">
                            <div class="erp-card h-100 mb-0 border-top border-4 ${session ? 'border-success' : 'border-warning'}">
                                <div class="erp-card-header bg-transparent d-flex justify-content-between">
                                    <span class="fw-bold text-primary">${weekName}</span>
                                    <span class="badge ${session ? 'bg-success' : 'bg-warning text-dark'}">${session ? 'Completed' : 'Scheduled / Pending'}</span>
                                </div>
                                <div class="erp-card-body d-flex flex-column justify-content-between">
                                    ${session ? `
                                        <div>
                                            <h6 class="fw-bold text-primary mb-2">${session.name}</h6>
                                            <div class="text-muted mb-1" style="font-size:11.5px;"><i class="fas fa-user-tie me-1"></i> Trainer: <strong>${session.trainer}</strong></div>
                                            <div class="text-muted mb-1" style="font-size:11.5px;"><i class="fas fa-building me-1"></i> Dept: <strong>${session.department}</strong></div>
                                            <div class="text-muted mb-2" style="font-size:11.5px;"><i class="fas fa-users me-1"></i> Attendance: <strong class="text-success">${session.attendance} Personnel</strong></div>
                                            <p class="text-muted bg-light p-2 rounded" style="font-size:11px;">${session.remarks}</p>
                                        </div>
                                        <div class="mt-3 pt-2 border-top d-flex justify-content-between align-items-center">
                                            ${session.certificate ? `<span class="badge bg-info text-white"><i class="fas fa-certificate me-1"></i> Certificate Attached</span>` : `<span class="text-muted" style="font-size:10px;">No cert file</span>`}
                                            <button class="btn btn-sm btn-erp-outline p-1 px-2 text-danger" onclick="app.getController('training').deleteTraining('${session.id}')"><i class="fas fa-trash"></i></button>
                                        </div>
                                    ` : `
                                        <div class="text-center py-4 text-muted">
                                            <i class="fas fa-chalkboard-teacher fs-2 mb-2 text-warning"></i>
                                            <div style="font-size:12px;">No weekly training logged for ${weekName}.</div>
                                        </div>
                                        <button class="btn btn-sm btn-erp-primary w-100 mt-2" onclick="app.getController('training').openScheduleModal('${weekName}')">
                                            <i class="fas fa-plus me-1"></i> Assign ${weekName}
                                        </button>
                                    `}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Complete Training Register Table -->
            <div class="erp-table-container">
                <div class="erp-card-header">Annual Safety Training Master Register</div>
                <div class="table-responsive">
                    <table class="table-erp mb-0">
                        <thead>
                            <tr>
                                <th>Session ID</th>
                                <th>Month & Week</th>
                                <th>Training Module Title</th>
                                <th>Trainer Name</th>
                                <th>Target Department</th>
                                <th>Attendance Count</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${trainings.map(t => `
                                <tr>
                                    <td class="fw-bold font-mono text-primary">${t.id}</td>
                                    <td><span class="badge bg-secondary">${t.month} - ${t.week}</span></td>
                                    <td class="fw-bold">${t.name}</td>
                                    <td>${t.trainer}</td>
                                    <td>${t.department}</td>
                                    <td><span class="badge bg-success">${t.attendance}</span></td>
                                    <td><span class="badge-erp badge-success">Completed</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async openScheduleModal(defaultWeek = 'Week 1') {
        const { value: formValues } = await Swal.fire({
            title: '<strong style="color:#0A2647;">Schedule Monthly Module Training</strong>',
            html: `
                <div style="text-align:left; font-size:13px;">
                    <label class="fw-bold mt-2">Week Slot (4 Weeks/Month)</label>
                    <select id="trgWeek" class="form-select">
                        <option value="Week 1" ${defaultWeek === 'Week 1' ? 'selected' : ''}>Week 1</option>
                        <option value="Week 2" ${defaultWeek === 'Week 2' ? 'selected' : ''}>Week 2</option>
                        <option value="Week 3" ${defaultWeek === 'Week 3' ? 'selected' : ''}>Week 3</option>
                        <option value="Week 4" ${defaultWeek === 'Week 4' ? 'selected' : ''}>Week 4</option>
                    </select>

                    <label class="fw-bold mt-2">Training Name / Module Title</label>
                    <input id="trgName" type="text" class="form-control" placeholder="e.g. Confined Space Safety Protocol">

                    <label class="fw-bold mt-2">Trainer</label>
                    <input id="trgTrainer" type="text" class="form-control" placeholder="e.g. Dr. Rajeshwar Rao">

                    <label class="fw-bold mt-2">Target Department</label>
                    <select id="trgDept" class="form-select">
                        ${DEPARTMENTS.map(d => `<option value="${d}">${d}</option>`).join('')}
                    </select>

                    <label class="fw-bold mt-2">Attendance Personnel Count</label>
                    <input id="trgAttendance" type="number" class="form-control" value="30">

                    <label class="fw-bold mt-2">Remarks / Certification note</label>
                    <input id="trgRemarks" type="text" class="form-control" placeholder="Issued certificate NTPC_2026">
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#0A2647',
            confirmButtonText: 'Record Session',
            preConfirm: () => {
                return {
                    week: document.getElementById('trgWeek').value,
                    name: document.getElementById('trgName').value,
                    trainer: document.getElementById('trgTrainer').value,
                    department: document.getElementById('trgDept').value,
                    attendance: parseInt(document.getElementById('trgAttendance').value) || 0,
                    remarks: document.getElementById('trgRemarks').value,
                    certificate: 'NTPC_CERT_' + Math.floor(Math.random()*900+100) + '.pdf'
                };
            }
        });

        if (formValues && formValues.name) {
            const newItem = {
                id: `TRG-2026-${formValues.week.replace(' ', '')}`,
                fy: this.app.state.fy,
                month: this.app.state.month === 'all' ? 'July' : this.app.state.month,
                ...formValues
            };
            await dataService.create('trainings', newItem);
            this.app.renderCurrentModule();
        }
    }

    async deleteTraining(id) {
        await dataService.delete('trainings', id);
        this.app.renderCurrentModule();
    }
}
