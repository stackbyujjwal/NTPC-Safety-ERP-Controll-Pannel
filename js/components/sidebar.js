/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Left Sidebar Component (12 Enterprise Modules navigation)
 */

import { APP_CONFIG } from '../config/constants.js';

export class SidebarComponent {
    constructor(appController) {
        this.app = appController;
    }

    render(activeModule = 'dashboard') {
        const modules = [
            { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', category: 'Overview' },
            { id: 'inspections', label: 'Inspections', icon: 'fas fa-clipboard-check', category: 'Safety Operations' },
            { id: 'tbt', label: 'Daily TBT Register', icon: 'fas fa-users', category: 'Safety Operations' },
            { id: 'training', label: 'Module Training (4/Mo)', icon: 'fas fa-graduation-cap', category: 'Safety Operations' },
            { id: 'incidents', label: 'Incident Recall (4/Mo)', icon: 'fas fa-exclamation-triangle', category: 'Safety Operations' },
            { id: 'reports', label: 'Safety Reports', icon: 'fas fa-file-alt', category: 'Analytics & Compliance' },
            { id: 'calendar', label: 'Safety Calendar', icon: 'fas fa-calendar-check', category: 'Analytics & Compliance' },
            { id: 'analytics', label: 'Advanced Analytics', icon: 'fas fa-chart-line', category: 'Analytics & Compliance' },
            { id: 'gallery', label: 'Photo Repository', icon: 'fas fa-images', category: 'Digital Library' },
            { id: 'documents', label: 'Document Library', icon: 'fas fa-folder-open', category: 'Digital Library' },
            { id: 'notifications', label: 'Notification System', icon: 'fas fa-bell', category: 'System Governance' },
            { id: 'admin', label: 'Admin Panel & RBAC', icon: 'fas fa-cogs', category: 'System Governance' },
            { id: 'settings', label: 'Settings & Theme', icon: 'fas fa-sliders-h', category: 'System Governance' }
        ];

        let navHtml = '';
        const disabledMods = JSON.parse(localStorage.getItem('ntpc_erp_disabled_modules') || '[]');

        modules.forEach(mod => {
            if (disabledMods.includes(mod.id) && mod.id !== 'admin') return;
            const isActive = activeModule === mod.id ? 'active' : '';
            navHtml += `
                <li class="sidebar-nav-item">
                    <a href="#" class="sidebar-nav-link ${isActive}" title="${mod.label}" onclick="app.navigateTo('${mod.id}'); return false;">
                        <i class="${mod.icon}"></i>
                        <span>${mod.label}</span>
                    </a>
                </li>
            `;
        });

        return `
            <aside id="erpSidebar" class="erp-sidebar">
                <div class="sidebar-header d-flex align-items-center gap-2 px-3">
                    <button id="sidebarToggleBtn" class="btn btn-sm text-white d-flex align-items-center justify-content-center flex-shrink-0 p-0 shadow-sm" onclick="window.app && window.app.toggleSidebar ? window.app.toggleSidebar() : null" title="Toggle Sidebar" style="width:34px; height:34px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.22); border-radius: 6px;">
                        <i class="fas fa-bars fs-6"></i>
                    </button>
                    <div class="sidebar-brand-wrapper overflow-hidden">
                        <div class="sidebar-brand-text text-truncate" style="font-size:17px; font-weight:800; letter-spacing:0.8px; color:#fff; line-height: 1.2;">NTPC</div>
                        <div class="sidebar-brand-subtext text-truncate" style="color:#94A3B8; font-size:10px; font-weight:500; line-height: 1.1;">powered by Abhinaw Mishra</div>
                    </div>
                </div>
                <div class="sidebar-menu-container">
                    <ul class="p-0 m-0">
                        ${navHtml}
                    </ul>
                </div>
                <div class="sidebar-footer">
                    <span>© ${APP_CONFIG.YEAR} NTPC Ltd.</span>
                    <a href="#" onclick="app.logout()" class="text-danger text-decoration-none" title="Logout"><i class="fas fa-power-off"></i></a>
                </div>
            </aside>
        `;
    }
}
