/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Enterprise Reports Controller (Multi-dimensional Report Generation, Excel/CSV Export, Printable PDF Views)
 */

import { dataService } from '../services/dataService.js';
import { exportService } from '../services/exportService.js';
import { PLANT_AREAS, DEPARTMENTS } from '../config/constants.js';

export class ReportsController {
    constructor(app) {
        this.app = app;
        this.reportType = 'inspections';
        this.filterStatus = 'all';
        this.filterArea = 'all';
    }

    async render() {
        const filters = { fy: this.app.state.fy, month: this.app.state.month };
        const inspections = await dataService.getAll('inspections', filters);
        const tbts = await dataService.getAll('tbts', filters);
        const trainings = await dataService.getAll('trainings', filters);

        let filteredInspections = inspections;
        if (this.filterStatus !== 'all') filteredInspections = filteredInspections.filter(i => i.status === this.filterStatus);
        if (this.filterArea !== 'all') filteredInspections = filteredInspections.filter(i => i.area === this.filterArea);

        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-file-alt me-2"></i>Safety Reports & Analytics Generator</h3>
                    <div class="text-muted" style="font-size:12px;">Generate compliance summaries, audit reports, and export raw data to CSV/Excel or Printable formats</div>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-erp-primary btn-sm" onclick="app.getController('reports').exportCurrentReport()">
                        <i class="fas fa-file-csv"></i> Export CSV / Excel
                    </button>
                    <button class="btn btn-erp-outline btn-sm" onclick="app.getController('reports').printCurrentReport()">
                        <i class="fas fa-print"></i> Generate Printable Report
                    </button>
                </div>
            </div>

            <!-- Report Type Selection Tabs -->
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <div class="erp-card h-100 mb-0 p-3 text-center cursor-pointer ${this.reportType === 'inspections' ? 'border-primary bg-light' : ''}" onclick="app.getController('reports').switchReport('inspections')">
                        <i class="fas fa-clipboard-check fs-3 text-primary mb-2"></i>
                        <h6 class="fw-bold mb-1">Inspection Master Report</h6>
                        <div class="text-muted" style="font-size:11px;">Monthly & Quarterly status</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="erp-card h-100 mb-0 p-3 text-center cursor-pointer ${this.reportType === 'pending' ? 'border-warning bg-light' : ''}" onclick="app.getController('reports').switchReport('pending')">
                        <i class="fas fa-exclamation-circle fs-3 text-warning mb-2"></i>
                        <h6 class="fw-bold mb-1">Pending Action Report</h6>
                        <div class="text-muted" style="font-size:11px;">Overdue & pending gaps</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="erp-card h-100 mb-0 p-3 text-center cursor-pointer ${this.reportType === 'tbt' ? 'border-success bg-light' : ''}" onclick="app.getController('reports').switchReport('tbt')">
                        <i class="fas fa-users fs-3 text-success mb-2"></i>
                        <h6 class="fw-bold mb-1">Daily TBT Register Report</h6>
                        <div class="text-muted" style="font-size:11px;">Department attendance summary</div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="erp-card h-100 mb-0 p-3 text-center cursor-pointer ${this.reportType === 'training' ? 'border-info bg-light' : ''}" onclick="app.getController('reports').switchReport('training')">
                        <i class="fas fa-graduation-cap fs-3 text-info mb-2"></i>
                        <h6 class="fw-bold mb-1">Module Training Report</h6>
                        <div class="text-muted" style="font-size:11px;">Weekly compliance tracking</div>
                    </div>
                </div>
            </div>

            <!-- Filter Matrix for Inspections -->
            ${this.reportType === 'inspections' || this.reportType === 'pending' ? `
                <div class="filter-bar">
                    <div class="d-flex align-items-center gap-2">
                        <span class="fw-bold text-primary"><i class="fas fa-filter"></i> Status:</span>
                        <select class="form-select form-select-sm w-auto" onchange="app.getController('reports').filterByStatus(this.value)">
                            <option value="all">All Statuses</option>
                            <option value="Completed" ${this.filterStatus === 'Completed' ? 'selected' : ''}>Completed</option>
                            <option value="Pending" ${this.filterStatus === 'Pending' ? 'selected' : ''}>Pending Action</option>
                            <option value="Overdue" ${this.filterStatus === 'Overdue' ? 'selected' : ''}>Overdue</option>
                        </select>
                    </div>
                    <div class="d-flex align-items-center gap-2 ms-3">
                        <span class="fw-bold text-primary"><i class="fas fa-industry"></i> Plant Area:</span>
                        <select class="form-select form-select-sm w-auto" onchange="app.getController('reports').filterByArea(this.value)">
                            <option value="all">All Plant Areas</option>
                            ${PLANT_AREAS.map(a => `<option value="${a.name}" ${this.filterArea === a.name ? 'selected' : ''}>${a.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
            ` : ''}

            <!-- Report Table Display -->
            <div id="printableReportArea" class="erp-table-container">
                <div class="erp-card-header d-flex justify-content-between">
                    <span>Generated Report: <strong class="text-uppercase">${this.reportType}</strong></span>
                    <span>Period: FY ${this.app.state.fy}</span>
                </div>
                <div class="table-responsive">
                    <table class="table-erp mb-0">
                        ${this.renderTableContent(filteredInspections, tbts, trainings)}
                    </table>
                </div>
            </div>
        `;
    }

    renderTableContent(inspections, tbts, trainings) {
        if (this.reportType === 'inspections' || this.reportType === 'pending') {
            const data = this.reportType === 'pending' ? inspections.filter(i => i.status !== 'Completed') : inspections;
            return `
                <thead>
                    <tr>
                        <th>Inspection ID</th>
                        <th>Category</th>
                        <th>Area</th>
                        <th>Responsible Engineer</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Findings & Corrective Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(i => `
                        <tr>
                            <td class="fw-bold font-mono text-primary">${i.id}</td>
                            <td class="text-capitalize">${i.category.replace('_', ' ')}</td>
                            <td>${i.area}</td>
                            <td>${i.responsiblePerson}</td>
                            <td>${i.date}</td>
                            <td><span class="badge-erp ${i.status === 'Completed' ? 'badge-success' : i.status === 'Overdue' ? 'badge-danger' : 'badge-warning'}">${i.status}</span></td>
                            <td style="font-size:11.5px;"><strong>Remarks:</strong> ${i.remarks}<br><strong>Action:</strong> <span class="text-primary">${i.correctiveAction}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
        } else if (this.reportType === 'tbt') {
            return `
                <thead>
                    <tr>
                        <th>TBT ID</th>
                        <th>Date</th>
                        <th>Department</th>
                        <th>Safety Topic Discussed</th>
                        <th>Trainer Name</th>
                        <th>Attendance Count</th>
                    </tr>
                </thead>
                <tbody>
                    ${tbts.map(t => `
                        <tr>
                            <td class="fw-bold font-mono text-primary">${t.id}</td>
                            <td>${t.date}</td>
                            <td>${t.department}</td>
                            <td class="fw-bold">${t.topic}</td>
                            <td>${t.trainer}</td>
                            <td><span class="badge bg-success">${t.attendance} Workers</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
        } else if (this.reportType === 'training') {
            return `
                <thead>
                    <tr>
                        <th>Session ID</th>
                        <th>Week & Month</th>
                        <th>Training Module Title</th>
                        <th>Trainer</th>
                        <th>Department</th>
                        <th>Attendance</th>
                    </tr>
                </thead>
                <tbody>
                    ${trainings.map(t => `
                        <tr>
                            <td class="fw-bold font-mono text-primary">${t.id}</td>
                            <td>${t.week} (${t.month})</td>
                            <td class="fw-bold">${t.name}</td>
                            <td>${t.trainer}</td>
                            <td>${t.department}</td>
                            <td><span class="badge bg-info text-white">${t.attendance} Personnel</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
        }
    }

    switchReport(type) {
        this.reportType = type;
        this.app.renderCurrentModule();
    }

    filterByStatus(val) {
        this.filterStatus = val;
        this.app.renderCurrentModule();
    }

    filterByArea(val) {
        this.filterArea = val;
        this.app.renderCurrentModule();
    }

    async exportCurrentReport() {
        if (this.reportType === 'inspections' || this.reportType === 'pending') {
            const items = await dataService.getAll('inspections', { fy: this.app.state.fy });
            const headers = ['Inspection ID', 'Category', 'Area', 'Responsible Person', 'Status', 'Date', 'Remarks', 'Corrective Action'];
            const rows = items.map(i => [i.id, i.category, i.area, i.responsiblePerson, i.status, i.date, i.remarks, i.correctiveAction]);
            exportService.exportToCSV(headers, rows, `NTPC_${this.reportType.toUpperCase()}_Report`);
        } else if (this.reportType === 'tbt') {
            const items = await dataService.getAll('tbts');
            const headers = ['TBT ID', 'Date', 'Department', 'Topic', 'Trainer', 'Attendance', 'Remarks'];
            const rows = items.map(t => [t.id, t.date, t.department, t.topic, t.trainer, t.attendance, t.remarks]);
            exportService.exportToCSV(headers, rows, `NTPC_TBT_Report`);
        } else {
            const items = await dataService.getAll('trainings');
            const headers = ['Session ID', 'Month', 'Week', 'Module Title', 'Trainer', 'Department', 'Attendance'];
            const rows = items.map(t => [t.id, t.month, t.week, t.name, t.trainer, t.department, t.attendance]);
            exportService.exportToCSV(headers, rows, `NTPC_Training_Report`);
        }
    }

    printCurrentReport() {
        const el = document.getElementById('printableReportArea');
        if (el) {
            exportService.printPrintableView(`Safety Master Report (${this.reportType.toUpperCase()})`, el.innerHTML);
        }
    }
}
