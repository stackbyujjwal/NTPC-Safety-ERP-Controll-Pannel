/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Chart.js Enterprise Visualizations (Dashboard & Analytics)
 */

import { THEME_COLORS } from '../config/constants.js';

export class ChartComponent {
    static chartInstances = {};

    static destroyChart(canvasId) {
        if (this.chartInstances[canvasId]) {
            this.chartInstances[canvasId].destroy();
            delete this.chartInstances[canvasId];
        }
    }

    static renderMonthlyProgress(canvasId, dataLabels, dataCompleted, dataPending) {
        this.destroyChart(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dataLabels || ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                datasets: [
                    {
                        label: 'Completed Inspections',
                        data: dataCompleted || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: '#2E7D32',
                        borderRadius: 4
                    },
                    {
                        label: 'Pending Action',
                        data: dataPending || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                        backgroundColor: '#F9A825',
                        borderRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top', labels: { font: { family: 'Inter', size: 11 } } }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    static renderAreaWiseChart(canvasId, mainPlantVal, chpVal, switchyardVal) {
        this.destroyChart(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Main Plant', 'CHP', 'Switchyard'],
                datasets: [{
                    data: [mainPlantVal ?? 0, chpVal ?? 0, switchyardVal ?? 0],
                    backgroundColor: ['#0A2647', '#2C74B3', '#144272'],
                    borderWidth: 2,
                    borderColor: '#FFFFFF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { font: { family: 'Inter', size: 11 } } }
                },
                cutout: '68%'
            }
        });
    }

    static renderStatusChart(canvasId, completed, pending, overdue) {
        this.destroyChart(canvasId);
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        this.chartInstances[canvasId] = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Completed', 'Pending Action', 'Overdue'],
                datasets: [{
                    data: [completed || 72, pending || 18, overdue || 10],
                    backgroundColor: ['#2E7D32', '#F9A825', '#C62828'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right', labels: { font: { family: 'Inter', size: 11 } } }
                }
            }
        });
    }
}
