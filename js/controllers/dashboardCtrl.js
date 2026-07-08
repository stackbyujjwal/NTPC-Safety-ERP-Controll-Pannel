/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Dashboard Controller (KPI Metrics, Analytical Charts, Recent Activity Feed)
 */

import { dataService } from '../services/dataService.js';
import { ChartComponent } from '../components/charts.js';

export class DashboardController {
    constructor(app) {
        this.app = app;
    }

    async render() {
        const filters = {
            fy: this.app.state.fy,
            month: this.app.state.month,
            area: this.app.state.area
        };

        const inspections = await dataService.getAll('inspections', filters);
        const tbts = await dataService.getAll('tbts', filters);
        const trainings = await dataService.getAll('trainings', filters);

        // Calculate KPI Statistics
        const completedCount = inspections.filter(i => i.status === 'Completed').length;
        const pendingCount = inspections.filter(i => i.status === 'Pending').length;
        const overdueCount = inspections.filter(i => i.status === 'Overdue').length;
        const totalCount = inspections.length || 1;
        const completionRate = Math.round((completedCount / totalCount) * 100);

        // Calculate area breakdown
        const mainPlantCount = inspections.filter(i => i.area === 'Main Plant').length;
        const chpCount = inspections.filter(i => i.area === 'CHP').length;
        const swyCount = inspections.filter(i => i.area === 'Switchyard').length;

        const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
        const smMap = { 'Apr': 'April', 'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August', 'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December', 'Jan': 'January', 'Feb': 'February', 'Mar': 'March' };
        this._chartLabels = months;
        this._chartCompleted = months.map(m => inspections.filter(i => (i.month === smMap[m] || (i.month || '').startsWith(m)) && i.status === 'Completed').length);
        this._chartPending = months.map(m => inspections.filter(i => (i.month === smMap[m] || (i.month || '').startsWith(m)) && i.status !== 'Completed').length);
        this._chartMainPlant = mainPlantCount;
        this._chartChp = chpCount;
        this._chartSwitchyard = swyCount;

        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-tachometer-alt me-2"></i>Executive Safety Dashboard</h3>
                    <div class="text-muted" style="font-size:12px;">Financial Year: <strong>${this.app.state.fy}</strong> | Active Period: <strong>${this.app.state.month === 'all' ? 'Annual Overview' : this.app.state.month}</strong></div>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-erp-outline btn-sm" onclick="app.refreshCurrentModule()">
                        <i class="fas fa-sync-alt"></i> Refresh Data
                    </button>
                </div>
            </div>

            <!-- KPI Metric Scorecards -->
            <div class="row g-3 mb-4">
                <div class="col-xl-3 col-md-6">
                    <div class="kpi-card kpi-accent">
                        <div class="kpi-info">
                            <h6>Today's Active Safety Tasks</h6>
                            <div class="kpi-value">${inspections.length + tbts.length}</div>
                            <div class="text-muted mt-1" style="font-size:11px;">${inspections.length + tbts.length ? 'Live tasks logged' : 'No active tasks'}</div>
                        </div>
                        <div class="kpi-icon"><i class="fas fa-clipboard-list"></i></div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="kpi-card kpi-success">
                        <div class="kpi-info">
                            <h6>Completed Inspections</h6>
                            <div class="kpi-value">${completedCount}</div>
                            <div class="text-muted mt-1" style="font-size:11px;"><strong class="text-success">${inspections.length ? completionRate + '%' : '0%'}</strong> completion rate</div>
                        </div>
                        <div class="kpi-icon"><i class="fas fa-check-circle"></i></div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="kpi-card kpi-warning">
                        <div class="kpi-info">
                            <h6>Pending Action Items</h6>
                            <div class="kpi-value">${pendingCount}</div>
                            <div class="text-muted mt-1" style="font-size:11px;">${pendingCount ? 'Action required' : 'All items cleared'}</div>
                        </div>
                        <div class="kpi-icon"><i class="fas fa-exclamation-circle"></i></div>
                    </div>
                </div>
                <div class="col-xl-3 col-md-6">
                    <div class="kpi-card kpi-danger">
                        <div class="kpi-info">
                            <h6>Overdue Safety Work</h6>
                            <div class="kpi-value">${overdueCount}</div>
                            <div class="text-muted mt-1" style="font-size:11px;">${overdueCount ? '<span class="text-danger fw-bold">Critical action required</span>' : '<span class="text-success fw-bold">No overdue items</span>'}</div>
                        </div>
                        <div class="kpi-icon"><i class="fas fa-bell"></i></div>
                    </div>
                </div>
            </div>

            <!-- Analytical Charts Section -->
            <div class="row g-3 mb-4">
                <div class="col-lg-8">
                    <div class="erp-card h-100 mb-0">
                        <div class="erp-card-header">
                            <span><i class="fas fa-chart-bar me-2"></i>Monthly Safety Inspection Progress Comparison</span>
                            <span class="badge bg-primary">FY ${this.app.state.fy}</span>
                        </div>
                        <div class="erp-card-body" style="height: 310px;">
                            <canvas id="dashMonthlyChart"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-lg-4">
                    <div class="erp-card h-100 mb-0">
                        <div class="erp-card-header">
                            <span><i class="fas fa-chart-pie me-2"></i>Plant Area Compliance Ratio</span>
                            <span class="badge bg-secondary">Distribution</span>
                        </div>
                        <div class="erp-card-body d-flex flex-column justify-content-center" style="height: 310px;">
                            <canvas id="dashAreaChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Recent Activity Table -->
            <div class="erp-card mb-0">
                <div class="erp-card-header d-flex justify-content-between align-items-center">
                    <span><i class="fas fa-history me-2"></i>Recent Safety Activities & Inspection Records</span>
                    <a href="#" onclick="app.navigateTo('inspections'); return false;" class="text-decoration-none fw-bold" style="font-size:12px;">View Full Register &rarr;</a>
                </div>
                <div class="table-responsive">
                    <table class="table-erp mb-0">
                        <thead>
                            <tr>
                                <th>Sl / Record ID</th>
                                <th>Activity Type</th>
                                <th>Target Area</th>
                                <th>Responsible Engineer</th>
                                <th>Inspection Date</th>
                                <th>Compliance Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${inspections.length ? inspections.slice(0, 5).map(i => `
                                <tr>
                                    <td class="fw-bold text-primary font-mono">${i.id}</td>
                                    <td class="text-capitalize">${(i.category || '').replace('_', ' ')}</td>
                                    <td><span class="badge bg-secondary p-1">${i.area || 'General'}</span></td>
                                    <td class="fw-semibold">${i.responsiblePerson || 'Unassigned'}</td>
                                    <td>${i.date}</td>
                                    <td>
                                        <span class="badge-erp ${i.status === 'Completed' ? 'badge-success' : i.status === 'Overdue' ? 'badge-danger' : 'badge-warning'}">
                                            <i class="fas ${i.status === 'Completed' ? 'fa-check' : 'fa-clock'}"></i> ${i.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-erp-outline p-1 px-2" onclick="app.getController('inspections').viewDetails('${i.id}')" title="View Details">
                                            <i class="fas fa-eye"></i> View
                                        </button>
                                    </td>
                                </tr>
                            `).join('') : `
                                <tr><td colspan="7" class="text-center py-4 text-muted">No safety activities recorded for the selected filter period.</td></tr>
                            `}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    }

    afterRender() {
        // Render Chart.js instances
        setTimeout(() => {
            ChartComponent.renderMonthlyProgress('dashMonthlyChart', this._chartLabels, this._chartCompleted, this._chartPending);
            ChartComponent.renderAreaWiseChart('dashAreaChart', this._chartMainPlant, this._chartChp, this._chartSwitchyard);
        }, 100);
    }
}
