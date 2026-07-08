/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Top Navbar Component (FY Selector, Live Clock, Notifications, Theme Toggle)
 */

import { FINANCIAL_YEARS, PLANT_AREAS, MONTHS } from '../config/constants.js';
import { authService } from '../services/authService.js';
import { dataService } from '../services/dataService.js';

export class NavbarComponent {
    constructor(appController) {
        this.app = appController;
    }

    render() {
        const currentUser = authService.getCurrentUser() || { name: "System Admin", role: "admin", department: "Safety" };
        const notifs = dataService.getDatabase().notifications || [];
        const unreadCount = notifs.filter(n => !n.read).length;

        return `
            <header class="erp-navbar">
                <div class="navbar-left d-flex align-items-center gap-2 overflow-hidden me-2">
                    <div class="d-flex align-items-center gap-2 border-end pe-3 me-1 flex-shrink-1 overflow-hidden">
                        <img src="https://careers.ntpc.co.in/recruitment/images/logo50yr.png" alt="NTPC 50 Years Logo" style="height:36px; object-fit:contain; flex-shrink:0;">
                        <i class="fas fa-industry text-primary fs-5 flex-shrink-0"></i>
                        <div class="overflow-hidden">
                            <div class="fw-bold text-primary text-truncate" style="font-size:13px; letter-spacing:0.3px;">NORTH KARANPURA THERMAL POWER STATION</div>
                            <div class="text-muted text-truncate" style="font-size:9.5px;">NTPC LIMITED • SAFETY & FIRE SERVICES MANAGEMENT</div>
                        </div>
                    </div>
                    
                    <!-- Financial Year Selector -->
                    <div class="erp-selector-group">
                        <span class="selector-label"><i class="fas fa-calendar-alt me-1"></i> FY:</span>
                        <select id="globalFySelect" class="selector-dropdown">
                            ${FINANCIAL_YEARS.map(fy => `<option value="${fy}" ${this.app.state.fy === fy ? 'selected' : ''}>${fy}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Month Selector -->
                    <div class="erp-selector-group">
                        <span class="selector-label">Month:</span>
                        <select id="globalMonthSelect" class="selector-dropdown">
                            <option value="all">All Months</option>
                            ${MONTHS.map(m => `<option value="${m.name}" ${this.app.state.month === m.name ? 'selected' : ''}>${m.name} (${m.quarter})</option>`).join('')}
                        </select>
                    </div>

                    <!-- Plant Area Selector -->
                    <div class="erp-selector-group">
                        <span class="selector-label"><i class="fas fa-industry me-1"></i> Area:</span>
                        <select id="globalAreaSelect" class="selector-dropdown">
                            <option value="all">All Plant Areas</option>
                            ${PLANT_AREAS.map(a => `<option value="${a.name}" ${this.app.state.area === a.name ? 'selected' : ''}>${a.name}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="navbar-right">
                    <!-- Live Clock -->
                    <div class="live-clock-pill d-none d-md-flex align-items-center gap-2">
                        <i class="far fa-clock text-accent"></i>
                        <span id="liveClockDisplay">Loading...</span>
                    </div>

                    <!-- Dark / Light Theme Toggle -->
                    <button id="themeToggleBtn" class="btn btn-erp-outline btn-sm" title="Switch Theme">
                        <i class="fas fa-moon id-theme-icon"></i>
                    </button>

                    <!-- Notifications Dropdown -->
                    <div class="dropdown">
                        <button class="btn btn-erp-outline btn-sm position-relative" type="button" data-bs-toggle="dropdown">
                            <i class="fas fa-bell"></i>
                            ${unreadCount > 0 ? `<span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size:9px;">${unreadCount}</span>` : ''}
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0" style="width: 320px; max-height: 400px; overflow-y: auto;">
                            <li class="dropdown-header d-flex justify-content-between align-items-center bg-light py-2">
                                <span class="fw-bold text-primary" style="font-size:12px;">System Notifications</span>
                                <span class="badge bg-primary rounded-pill">${unreadCount} New</span>
                            </li>
                            <li><hr class="dropdown-divider my-0"></li>
                            ${notifs.slice(0, 5).map(n => `
                                <li>
                                    <a class="dropdown-item py-2 px-3 border-bottom" href="#" onclick="app.navigateTo('notifications')">
                                        <div class="d-flex align-items-center gap-2">
                                            <span class="badge bg-${n.type === 'danger' ? 'danger' : n.type === 'warning' ? 'warning' : 'success'} p-1"><i class="fas fa-exclamation-circle"></i></span>
                                            <div class="text-truncate">
                                                <div class="fw-bold" style="font-size:12px;">${n.title}</div>
                                                <div class="text-muted text-truncate" style="font-size:11px;">${n.message}</div>
                                                <div class="text-muted" style="font-size:10px;">${n.time}</div>
                                            </div>
                                        </div>
                                    </a>
                                </li>
                            `).join('')}
                            <li class="text-center py-2">
                                <a href="#" class="text-decoration-none fw-bold" style="font-size:11.5px;" onclick="app.navigateTo('notifications')">View All Notifications &rarr;</a>
                            </li>
                        </ul>
                    </div>

                    <!-- User Profile Badge & Logout -->
                    <div class="dropdown">
                        <button class="btn btn-sm d-flex align-items-center gap-2 border-0 bg-transparent p-1 px-2 rounded shadow-sm" type="button" onclick="window.app && window.app.openProfileEditModal ? window.app.openProfileEditModal() : null" title="Tap to view & edit profile details, photo and password" style="background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(10, 38, 71, 0.15);">
                            ${currentUser.photo && currentUser.photo !== 'assets/power-plant-bg.svg' ? `<img src="${currentUser.photo}" class="rounded-circle shadow-sm" style="width:34px; height:34px; object-fit:cover; border:2px solid #0A2647;">` : `<div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width:34px; height:34px; font-size:13px;">${currentUser.name ? currentUser.name.charAt(0) : 'U'}</div>`}
                            <div class="text-start d-none d-lg-block">
                                <div class="fw-bold text-truncate d-flex align-items-center gap-1" style="max-width:140px; font-size:12.5px; line-height:1.2; color:#0A2647;">${currentUser.name} <i class="fas fa-edit text-muted" style="font-size:10px;"></i></div>
                                <div class="text-muted" style="font-size:10.5px; text-transform:capitalize;">${currentUser.role}</div>
                            </div>
                        </button>
                    </div>
                </div>
            </header>
        `;
    }

    startClock() {
        const updateClock = () => {
            const clockEl = document.getElementById('liveClockDisplay');
            if (clockEl) {
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                clockEl.textContent = `${dateStr} ${timeStr} | ACTIVE SHIFT`;
            }
        };
        updateClock();
        setInterval(updateClock, 1000);
    }
}
