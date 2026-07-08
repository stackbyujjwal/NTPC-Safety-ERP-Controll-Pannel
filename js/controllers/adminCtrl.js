/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Advanced Admin Panel Controller (RBAC, Password Management, CRUD over Users/Departments/Areas/Checklists)
 */

import { dataService } from '../services/dataService.js';
import { authService } from '../services/authService.js';
import { PLANT_AREAS, INSPECTION_CATEGORIES } from '../config/constants.js';

export class AdminController {
    constructor(app) {
        this.app = app;
        this.activeTab = 'modules';
    }

    async render() {
        const currentUser = authService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            return `
                <div class="erp-card p-5 text-center my-5">
                    <i class="fas fa-lock fs-1 text-danger mb-3"></i>
                    <h3 class="text-danger fw-bold">Restricted Admin Control Access</h3>
                    <p class="text-muted mb-4" style="max-width:500px; margin:auto;">Only System Administrators are authorized to view user passwords, provision roles, modify master departments, and manage plant configuration.</p>
                    <button class="btn btn-erp-primary" onclick="window.app.navigateTo('dashboard')">Return to Executive Dashboard</button>
                </div>
            `;
        }

        const dbData = dataService.getDatabase();
        const users = dbData.users || [];
        const departments = dbData.departments || [];
        const logs = dbData.logs || [];

        return `
            <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                <div>
                    <h3 class="m-0 text-dark fw-bold" style="font-family: var(--font-heading); letter-spacing: -0.5px;">
                        <i class="fas fa-sliders-h text-primary me-2"></i>Admin Control Panel
                    </h3>
                    <div class="text-muted mt-1" style="font-size: 13px;">
                        Deep master control over Left Navigation Modules, User RBAC Accounts, Departments, Plant Areas & System Schemas.
                    </div>
                </div>
            </div>

            <div class="row g-4">
                <!-- Left Master Navigation Box -->
                <div class="col-12 col-lg-3">
                    <div class="erp-card p-2" style="border: 1px solid #CBD5E1; border-radius: 8px; background: #FFFFFF;">
                        <div class="p-3 pb-2 text-uppercase text-muted fw-bold" style="font-size: 11px; letter-spacing: 0.8px;">
                            System Control Sections
                        </div>
                        <div class="list-group list-group-flush" style="gap: 2px;">
                            <a href="#" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between rounded ${this.activeTab === 'modules' ? 'active bg-primary text-white fw-bold' : 'border-0 text-dark'}" onclick="window.app.controllers.admin.switchTab('modules'); return false;" style="padding: 10px 14px; font-size: 13.5px;">
                                <span class="d-flex align-items-center gap-2">
                                    <i class="fas fa-bars width-20 text-center"></i> Left Sidebar Modules
                                </span>
                                <span class="badge ${this.activeTab === 'modules' ? 'bg-white text-primary' : 'bg-light text-dark border'} rounded-pill" style="font-size: 11px;">10</span>
                            </a>
                            <a href="#" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between rounded ${this.activeTab === 'approvals' ? 'active bg-primary text-white fw-bold' : 'border-0 text-dark'}" onclick="window.app.controllers.admin.switchTab('approvals'); return false;" style="padding: 10px 14px; font-size: 13.5px;">
                                <span class="d-flex align-items-center gap-2">
                                    <i class="fas fa-user-clock width-20 text-center ${users.filter(u => u.role !== 'admin' && (u.approved === false || u.status === 'Pending')).length > 0 && this.activeTab !== 'approvals' ? 'text-warning' : ''}"></i> Pending Approvals
                                </span>
                                <span class="badge ${users.filter(u => u.role !== 'admin' && (u.approved === false || u.status === 'Pending')).length > 0 ? 'bg-warning text-dark fw-bold' : 'bg-light text-dark border'} rounded-pill" style="font-size: 11px;">${users.filter(u => u.role !== 'admin' && (u.approved === false || u.status === 'Pending')).length}</span>
                            </a>
                            <a href="#" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between rounded ${this.activeTab === 'users' ? 'active bg-primary text-white fw-bold' : 'border-0 text-dark'}" onclick="window.app.controllers.admin.switchTab('users'); return false;" style="padding: 10px 14px; font-size: 13.5px;">
                                <span class="d-flex align-items-center gap-2">
                                    <i class="fas fa-users-cog width-20 text-center"></i> Users & Passwords
                                </span>
                                <span class="badge ${this.activeTab === 'users' ? 'bg-white text-primary' : 'bg-light text-dark border'} rounded-pill" style="font-size: 11px;">${users.length}</span>
                            </a>
                            <a href="#" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between rounded ${this.activeTab === 'departments' ? 'active bg-primary text-white fw-bold' : 'border-0 text-dark'}" onclick="window.app.controllers.admin.switchTab('departments'); return false;" style="padding: 10px 14px; font-size: 13.5px;">
                                <span class="d-flex align-items-center gap-2">
                                    <i class="fas fa-building width-20 text-center"></i> Manage Departments
                                </span>
                                <span class="badge ${this.activeTab === 'departments' ? 'bg-white text-primary' : 'bg-light text-dark border'} rounded-pill" style="font-size: 11px;">${departments.length}</span>
                            </a>
                            <a href="#" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between rounded ${this.activeTab === 'areas' ? 'active bg-primary text-white fw-bold' : 'border-0 text-dark'}" onclick="window.app.controllers.admin.switchTab('areas'); return false;" style="padding: 10px 14px; font-size: 13.5px;">
                                <span class="d-flex align-items-center gap-2">
                                    <i class="fas fa-industry width-20 text-center"></i> Plant Areas & Units
                                </span>
                                <span class="badge ${this.activeTab === 'areas' ? 'bg-white text-primary' : 'bg-light text-dark border'} rounded-pill" style="font-size: 11px;">${PLANT_AREAS.length}</span>
                            </a>
                            <a href="#" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between rounded ${this.activeTab === 'categories' ? 'active bg-primary text-white fw-bold' : 'border-0 text-dark'}" onclick="window.app.controllers.admin.switchTab('categories'); return false;" style="padding: 10px 14px; font-size: 13.5px;">
                                <span class="d-flex align-items-center gap-2">
                                    <i class="fas fa-clipboard-list width-20 text-center"></i> Inspection Categories
                                </span>
                                <span class="badge ${this.activeTab === 'categories' ? 'bg-white text-primary' : 'bg-light text-dark border'} rounded-pill" style="font-size: 11px;">${INSPECTION_CATEGORIES.length}</span>
                            </a>
                            <a href="#" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between rounded ${this.activeTab === 'logs' ? 'active bg-primary text-white fw-bold' : 'border-0 text-dark'}" onclick="window.app.controllers.admin.switchTab('logs'); return false;" style="padding: 10px 14px; font-size: 13.5px;">
                                <span class="d-flex align-items-center gap-2">
                                    <i class="fas fa-history width-20 text-center"></i> System Activity Trail
                                </span>
                                <span class="badge ${this.activeTab === 'logs' ? 'bg-white text-primary' : 'bg-light text-dark border'} rounded-pill" style="font-size: 11px;">${logs.length}</span>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Right Detail Panel -->
                <div class="col-12 col-lg-9">
                    ${this.renderTabContent(users, departments, logs)}
                </div>
            </div>
        `;
    }

    renderTabContent(users, departments, logs) {
        if (this.activeTab === 'modules') {
            const disabledMods = JSON.parse(localStorage.getItem('ntpc_erp_disabled_modules') || '[]');
            const allModules = [
                { id: 'dashboard', label: 'Executive Dashboard', icon: 'fas fa-tachometer-alt', desc: 'Real-time KPI metrics, safety audit overview, and analytics charts.' },
                { id: 'inspections', label: 'Safety Inspections Register', icon: 'fas fa-clipboard-check', desc: 'Core site inspection workflow, observations, and corrective action records.' },
                { id: 'tbt', label: 'Daily TBT Register', icon: 'fas fa-users', desc: 'Tool Box Talk daily shift meeting register and employee attendance.' },
                { id: 'training', label: 'Module Training Register', icon: 'fas fa-graduation-cap', desc: 'Safety training compliance, monthly goals, and completion logs.' },
                { id: 'incidents', label: 'Incident Recall & Near-Miss', icon: 'fas fa-exclamation-triangle', desc: 'Record and investigate accidents, near-misses, and safety deviations.' },
                { id: 'reports', label: 'Safety Reports Engine', icon: 'fas fa-file-alt', desc: 'Generate exportable PDF/Excel compliance summaries and regulatory audits.' },
                { id: 'calendar', label: 'Safety Compliance Calendar', icon: 'fas fa-calendar-check', desc: 'Interactive schedule for upcoming safety drills and mandatory inspections.' },
                { id: 'gallery', label: 'Photo Repository Gallery', icon: 'fas fa-images', desc: 'Digital library of site safety photos, hazard evidence, and good practices.' },
                { id: 'documents', label: 'Document Library', icon: 'fas fa-folder-open', desc: 'Safety policies, SOPs, manuals, and downloadable templates.' }
            ];
            return `
                <div class="erp-table-container">
                    <div class="erp-card-header d-flex justify-content-between align-items-center">
                        <div>
                            <span class="fw-bold fs-6">Left Sidebar Navigation Control Panel</span>
                            <div class="text-muted fw-normal" style="font-size: 12px;">Deep visibility control: enable/disable or hide/show left sidebar items across the platform.</div>
                        </div>
                        <button class="btn btn-sm btn-erp-outline" onclick="window.app.controllers.admin.resetAllModules()">
                            <i class="fas fa-undo me-1"></i> Show All Modules
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table-erp mb-0">
                            <thead>
                                <tr>
                                    <th>Module Name</th>
                                    <th>Description</th>
                                    <th>Sidebar Status</th>
                                    <th class="text-end">Deep Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${allModules.map(mod => {
                                    const isEnabled = !disabledMods.includes(mod.id);
                                    return `
                                        <tr style="${isEnabled ? '' : 'background-color:#F8FAFC; opacity:0.75;'}">
                                            <td>
                                                <div class="d-flex align-items-center gap-2">
                                                    <div class="rounded p-2 text-center ${isEnabled ? 'bg-primary text-white' : 'bg-secondary text-white'}" style="width:34px; height:34px;">
                                                        <i class="${mod.icon}"></i>
                                                    </div>
                                                    <div>
                                                        <div class="fw-bold text-dark">${mod.label}</div>
                                                        <div class="font-mono text-muted" style="font-size:11px;">ID: ${mod.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style="font-size: 13px;">${mod.desc}</td>
                                            <td>
                                                <span class="badge ${isEnabled ? 'bg-success' : 'bg-secondary'}">
                                                    <i class="fas ${isEnabled ? 'fa-check-circle' : 'fa-eye-slash'} me-1"></i> ${isEnabled ? 'Active & Visible' : 'Disabled & Hidden'}
                                                </span>
                                            </td>
                                            <td class="text-end">
                                                <button class="btn btn-sm ${isEnabled ? 'btn-outline-danger' : 'btn-erp-primary'}" onclick="window.app.controllers.admin.toggleModuleVisibility('${mod.id}')">
                                                    <i class="fas ${isEnabled ? 'fa-eye-slash' : 'fa-eye'} me-1"></i> ${isEnabled ? 'Disable & Hide' : 'Enable & Show'}
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                                }).join('')}
                                <tr>
                                    <td>
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="rounded p-2 text-center bg-dark text-white" style="width:34px; height:34px;">
                                                <i class="fas fa-cogs"></i>
                                            </div>
                                            <div>
                                                <div class="fw-bold text-dark">Admin Panel & RBAC</div>
                                                <div class="font-mono text-muted" style="font-size:11px;">ID: admin</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="font-size: 13px;">Master settings and access control suite.</td>
                                    <td>
                                        <span class="badge bg-primary">
                                            <i class="fas fa-lock me-1"></i> Always Active
                                        </span>
                                    </td>
                                    <td class="text-end">
                                        <span class="text-muted font-mono" style="font-size: 12px;">Protected</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (this.activeTab === 'approvals' || this.activeTab === 'users') {
            const pendingUsers = users.filter(u => u.role !== 'admin' && (u.approved === false || u.status === 'Pending'));
            
            const renderPendingShowcase = () => {
                if (pendingUsers.length === 0 && this.activeTab === 'approvals') {
                    return `
                        <div class="erp-card p-5 text-center mb-4 border-0 shadow-sm" style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 16px;">
                            <div class="d-inline-block p-4 rounded-circle bg-success text-white mb-3 shadow" style="width: 70px; height: 70px; font-size: 28px;">
                                <i class="fas fa-check-double"></i>
                            </div>
                            <h4 class="fw-bold text-success mb-2">All Registrations Approved & Active!</h4>
                            <p class="text-muted mb-0" style="font-size: 14px; max-width: 500px; margin: auto;">There are currently no employee accounts in the pending activation queue. New registration submissions will appear here automatically.</p>
                        </div>
                    `;
                }
                if (pendingUsers.length === 0) return '';
                
                return `
                    <div class="card border-0 shadow-lg mb-4" style="border-radius: 16px; overflow: hidden; background: linear-gradient(135deg, #0A2647 0%, #144272 100%);">
                        <div class="card-header border-0 bg-transparent p-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <div>
                                <span class="badge bg-warning text-dark fw-bold px-3 py-1 mb-2 rounded-pill text-uppercase shadow-sm" style="font-size: 11px; letter-spacing: 1px;"><i class="fas fa-bell me-1"></i> Action Required</span>
                                <h4 class="text-white fw-bold m-0 d-flex align-items-center gap-2"><i class="fas fa-user-clock text-warning"></i>Pending Account Approvals Queue (${pendingUsers.length})</h4>
                                <p class="text-light mb-0 mt-1" style="font-size: 13px; opacity: 0.85;">Review new registration requests, assign appropriate safety roles, and activate account access.</p>
                            </div>
                            <button class="btn btn-sm btn-outline-light fw-bold" onclick="window.app.controllers.admin.approveAllPending()"><i class="fas fa-check-double me-1"></i> Approve All (${pendingUsers.length})</button>
                        </div>
                        <div class="card-body p-4 pt-3">
                            <div class="row g-3">
                                ${pendingUsers.map(u => `
                                    <div class="col-12 col-md-6">
                                        <div class="card border-0 shadow h-100" style="border-radius: 14px; background: rgba(255, 255, 255, 0.98); transition: transform 0.2s, box-shadow 0.2s;">
                                            <div class="card-body p-4 d-flex flex-column justify-content-between">
                                                <div>
                                                    <div class="d-flex align-items-center gap-3 mb-3 border-bottom pb-3">
                                                        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width: 56px; height: 56px; font-size: 22px; flex-shrink: 0; border: 2px solid #CBD5E1;">
                                                            ${u.name ? u.name.charAt(0).toUpperCase() : '<i class="fas fa-user"></i>'}
                                                        </div>
                                                        <div class="overflow-hidden">
                                                            <h6 class="fw-bold text-dark m-0 text-truncate" style="font-size: 16px;">${u.name || u.username}</h6>
                                                            <div class="text-muted text-truncate" style="font-size: 13px;"><i class="fas fa-envelope me-1 text-primary"></i>${u.email || 'No email provided'}</div>
                                                            <div class="font-mono text-primary fw-bold" style="font-size: 11.5px;">@${u.username} • ID: ${u.id}</div>
                                                        </div>
                                                    </div>
                                                    <div class="mb-3" style="font-size: 13px;">
                                                        <div class="d-flex justify-content-between mb-1">
                                                            <span class="text-muted"><i class="fas fa-building me-1"></i>Department:</span>
                                                            <span class="fw-bold text-dark">${u.department || 'Safety & Fire Services'}</span>
                                                        </div>
                                                        <div class="d-flex justify-content-between mb-2">
                                                            <span class="text-muted"><i class="fas fa-calendar-alt me-1"></i>Status:</span>
                                                            <span class="badge bg-warning-subtle text-warning-emphasis border border-warning px-2 py-1"><i class="fas fa-clock me-1"></i>Awaiting Admin Activation</span>
                                                        </div>
                                                        <div class="mt-3 pt-2 border-top">
                                                            <label class="fw-bold text-dark mb-1 d-block" style="font-size: 12px;"><i class="fas fa-user-shield me-1 text-primary"></i>Assign Permission Role:</label>
                                                            <select id="role_select_${u.id}" class="form-select form-select-sm border-primary shadow-sm fw-semibold text-primary" style="font-size: 13px; border-radius: 8px; padding: 8px 12px;">
                                                                <option value="viewer" ${u.role === 'viewer' ? 'selected' : ''}>Plant Executive (Viewer - Read Only)</option>
                                                                <option value="safety_officer" ${u.role === 'safety_officer' ? 'selected' : ''}>Safety Officer (Create & Edit Records)</option>
                                                                <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>System Administrator (Master Control)</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="d-flex gap-2 pt-2 border-top">
                                                    <button class="btn btn-success btn-sm w-100 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2 py-2" style="border-radius: 8px;" onclick="window.app.controllers.admin.approveAccount('${u.id}')">
                                                        <i class="fas fa-check-circle fs-6"></i> Approve & Activate Account
                                                    </button>
                                                    <button class="btn btn-outline-danger btn-sm px-3 fw-bold d-flex align-items-center justify-content-center" style="border-radius: 8px;" onclick="window.app.controllers.admin.rejectAccount('${u.id}')" title="Reject / Delete Request">
                                                        <i class="fas fa-times fs-6"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                `;
            };

            if (this.activeTab === 'approvals') {
                return renderPendingShowcase();
            }

            return `
                ${renderPendingShowcase()}
                <div class="erp-table-container">
                    <div class="erp-card-header d-flex justify-content-between align-items-center">
                        <span>User Register & Password Controller</span>
                        <button class="btn btn-sm btn-erp-primary" onclick="window.app.controllers.admin.openCreateUserModal()">
                            <i class="fas fa-user-plus me-1"></i> Create New User Account
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table-erp mb-0">
                            <thead>
                                <tr>
                                    <th>ID & SAP ID</th>
                                    <th>Username</th>
                                    <th>Full Name & Contact</th>
                                    <th>Assigned Role</th>
                                    <th>Department & Plant</th>
                                    <th>Current Password</th>
                                    <th>Status</th>
                                    <th>Master Controls</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${users.map(u => `
                                    <tr style="${u.approved === false || u.status === 'Pending' ? 'background-color: #fffef0;' : ''}">
                                        <td class="align-middle">
                                            <div class="font-mono text-primary fw-bold">${u.id}</div>
                                            <small class="text-muted d-block font-mono" style="font-size:10px;">SAP: ${u.employeeId || 'N/A'}</small>
                                        </td>
                                        <td class="fw-bold align-middle">${u.username}</td>
                                        <td class="align-middle">
                                            <div class="fw-bold">${u.name}</div>
                                            <small class="text-muted d-block" style="font-size:11px;"><i class="fas fa-envelope me-1"></i>${u.email || 'No email'}</small>
                                            <small class="text-muted d-block" style="font-size:11px;"><i class="fas fa-phone me-1"></i>${u.phone || 'No phone'}</small>
                                        </td>
                                        <td class="align-middle">
                                            <span class="badge ${u.role === 'admin' ? 'bg-danger' : u.role === 'safety_officer' ? 'bg-primary' : 'bg-secondary'} text-uppercase">
                                                ${u.role.replace('_', ' ')}
                                            </span>
                                            ${u.designation ? `<small class="text-muted d-block mt-1" style="font-size:10.5px;">${u.designation}</small>` : ''}
                                        </td>
                                        <td class="align-middle">
                                            <div class="fw-semibold">${u.department || 'Safety & Fire Services'}</div>
                                            <small class="text-muted d-block" style="font-size:11px;"><i class="fas fa-map-marker-alt me-1"></i>${u.plantLocation || 'North Karanpura'}</small>
                                        </td>
                                        <td class="align-middle">
                                            <div class="d-flex align-items-center gap-1">
                                                <span data-pass="${u.password || 'ntpc@2026'}" data-hidden="true" class="font-mono bg-light px-2 py-1 rounded text-danger border d-inline-block text-center" style="font-size:12px; min-width: 80px; letter-spacing: 2px;">••••••••</span>
                                                <button class="btn btn-sm btn-outline-secondary py-0 px-1" type="button" onclick="const s = this.previousElementSibling; const isHidden = s.getAttribute('data-hidden') === 'true'; if(isHidden){ s.textContent = s.getAttribute('data-pass'); s.style.letterSpacing = 'normal'; s.setAttribute('data-hidden', 'false'); this.querySelector('i').className = 'fas fa-eye-slash'; } else { s.textContent = '••••••••'; s.style.letterSpacing = '2px'; s.setAttribute('data-hidden', 'true'); this.querySelector('i').className = 'fas fa-eye'; }" title="Toggle Password Visibility">
                                                    <i class="fas fa-eye" style="font-size:10px;"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger py-0 px-1" onclick="window.app.controllers.admin.changePasswordModal('${u.id}')" title="Set New Password">
                                                    <i class="fas fa-key" style="font-size:10px;"></i>
                                                </button>
                                            </div>
                                        </td>
                                        <td class="align-middle">
                                            <div class="d-flex flex-column gap-1">
                                                <span class="badge ${u.active !== false ? 'bg-success' : 'bg-danger'} cursor-pointer" style="cursor: pointer !important;" onclick="window.app.controllers.admin.toggleUserStatus('${u.id}')" title="Click to enable/disable">
                                                    ${u.active !== false ? 'Active' : 'Disabled'}
                                                </span>
                                                ${u.role !== 'admin' ? `
                                                    <span class="badge ${u.approved !== false && u.status !== 'Pending' ? 'bg-success-subtle text-success border border-success' : 'bg-warning-subtle text-warning-emphasis border border-warning'} cursor-pointer px-2 py-1" style="cursor: pointer !important;" onclick="window.app.controllers.admin.toggleUserApproval('${u.id}')" title="Click to Toggle Approval">
                                                        ${u.approved !== false && u.status !== 'Pending' ? '<i class="fas fa-check-circle me-1"></i> Approved' : '<i class="fas fa-clock me-1"></i> Pending'}
                                                    </span>
                                                ` : '<span class="badge bg-primary px-2 py-1"><i class="fas fa-shield-alt me-1"></i> Master Admin</span>'}
                                            </div>
                                        </td>
                                        <td class="align-middle">
                                            <div class="d-flex flex-wrap gap-1">
                                                ${u.role !== 'admin' && (u.approved === false || u.status === 'Pending') ? `
                                                    <button class="btn btn-sm btn-success fw-bold py-1 px-2 shadow-sm" onclick="window.app.controllers.admin.approveAccount('${u.id}')" title="Approve Account">
                                                        <i class="fas fa-check"></i> Approve
                                                    </button>
                                                ` : ''}
                                                <button class="btn btn-sm btn-erp-outline py-1 px-2 text-primary" onclick="window.app.controllers.admin.editUserModal('${u.id}')" title="Edit Full Profile & Role">
                                                    <i class="fas fa-id-card"></i> Profile & Role
                                                </button>
                                                <button class="btn btn-sm btn-erp-outline py-1 px-2 text-danger" onclick="window.app.controllers.admin.deleteUser('${u.id}')" title="Delete User">
                                                    <i class="fas fa-trash"></i> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (this.activeTab === 'departments') {
            return `
                <div class="erp-table-container">
                    <div class="erp-card-header d-flex justify-content-between align-items-center">
                        <span>Plant Departments Register</span>
                        <button class="btn btn-sm btn-erp-primary" onclick="window.app.controllers.admin.openCreateDeptModal()">
                            <i class="fas fa-plus me-1"></i> Add Department
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table-erp mb-0">
                            <thead>
                                <tr><th>Dept ID</th><th>Department Name</th><th>Head of Department (HOD)</th><th>Workforce Headcount</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                ${departments.map(d => `
                                    <tr>
                                        <td class="font-mono text-primary fw-bold">${d.id}</td>
                                        <td class="fw-bold">${d.name}</td>
                                        <td>${d.head}</td>
                                        <td><span class="badge bg-info text-dark">${d.headcount} Personnel</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-erp-outline py-1 px-2 text-primary" onclick="window.app.controllers.admin.editDeptModal('${d.id}')"><i class="fas fa-edit"></i> Edit</button>
                                            <button class="btn btn-sm btn-erp-outline py-1 px-2 text-danger" onclick="window.app.controllers.admin.deleteDept('${d.id}')"><i class="fas fa-trash"></i> Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (this.activeTab === 'areas') {
            return `
                <div class="erp-table-container">
                    <div class="erp-card-header d-flex justify-content-between align-items-center">
                        <span>Designated Plant Areas Register</span>
                        <button class="btn btn-sm btn-erp-primary" onclick="window.app.controllers.admin.openCreateAreaModal()">
                            <i class="fas fa-plus me-1"></i> Add Plant Area
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table-erp mb-0">
                            <thead>
                                <tr><th>Area Code</th><th>Plant Area Designation</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                ${PLANT_AREAS.map(a => `
                                    <tr>
                                        <td class="font-mono text-primary fw-bold">${a.code}</td>
                                        <td class="fw-bold">${a.name}</td>
                                        <td><span class="badge bg-success">Operational</span></td>
                                        <td>
                                            <button class="btn btn-sm btn-erp-outline py-1 px-2 text-danger" onclick="window.app.controllers.admin.deleteArea('${a.id || a.code}')"><i class="fas fa-trash"></i> Remove</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (this.activeTab === 'categories') {
            return `
                <div class="erp-table-container">
                    <div class="erp-card-header d-flex justify-content-between align-items-center">
                        <span>Safety Inspection Categories & Frequencies</span>
                        <button class="btn btn-sm btn-erp-primary" onclick="window.app.controllers.admin.openCreateCategoryModal()">
                            <i class="fas fa-plus me-1"></i> Add Category
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table class="table-erp mb-0">
                            <thead>
                                <tr><th>Category Identifier</th><th>Category Title</th><th>Audit Frequency</th><th>Applicable Areas</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                ${INSPECTION_CATEGORIES.map(c => `
                                    <tr>
                                        <td class="font-mono text-primary fw-bold">${c.id}</td>
                                        <td class="fw-bold">${c.name}</td>
                                        <td><span class="badge ${c.frequency === 'Monthly' ? 'bg-primary' : 'bg-warning text-dark'}">${c.frequency}</span></td>
                                        <td>${(c.areas || ['Main Plant', 'CHP', 'Switchyard']).join(', ')}</td>
                                        <td>
                                            <button class="btn btn-sm btn-erp-outline py-1 px-2 text-danger" onclick="window.app.controllers.admin.deleteCategory('${c.id}')"><i class="fas fa-trash"></i> Delete</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } else if (this.activeTab === 'logs') {
            return `
                <div class="erp-table-container">
                    <div class="erp-card-header">System Security & Audit Trail</div>
                    <div class="table-responsive">
                        <table class="table-erp mb-0">
                            <thead><tr><th>Log ID</th><th>Timestamp</th><th>Username</th><th>Action Type</th><th>Detailed Activity</th></tr></thead>
                            <tbody>
                                ${logs.map(l => `<tr><td class="font-mono text-muted">${l.id}</td><td class="font-mono">${l.timestamp}</td><td class="fw-bold text-primary">${l.user}</td><td><span class="badge bg-light text-dark border font-mono">${l.action}</span></td><td style="font-size:12px;">${l.details}</td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
    }

    switchTab(tab) {
        this.activeTab = tab;
        this.app.renderCurrentModule();
    }

    toggleModuleVisibility(modId) {
        let disabledMods = JSON.parse(localStorage.getItem('ntpc_erp_disabled_modules') || '[]');
        if (disabledMods.includes(modId)) {
            disabledMods = disabledMods.filter(id => id !== modId);
        } else {
            disabledMods.push(modId);
        }
        localStorage.setItem('ntpc_erp_disabled_modules', JSON.stringify(disabledMods));
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: disabledMods.includes(modId) ? `Module '${modId}' disabled & hidden.` : `Module '${modId}' enabled & shown.`,
            showConfirmButton: false,
            timer: 2500
        });
        window.app.render();
    }

    resetAllModules() {
        localStorage.removeItem('ntpc_erp_disabled_modules');
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: 'All modules restored!',
            showConfirmButton: false,
            timer: 2500
        });
        window.app.render();
    }

    async openCreateUserModal() {
        const { value: formValues } = await Swal.fire({
            title: '<strong style="color:#0A2647;">Create New User Account</strong>',
            html: `
                <div style="text-align:left; font-size:13px;">
                    <label class="fw-bold mt-2">Login Username</label>
                    <input id="newUsrName" type="text" class="form-control" placeholder="e.g. rohit_sharma">
                    
                    <label class="fw-bold mt-2">Account Password</label>
                    <input id="newUsrPass" type="text" class="form-control" value="ntpc@2026">
                    
                    <label class="fw-bold mt-2">Full Employee Name</label>
                    <input id="newUsrFullName" type="text" class="form-control" placeholder="e.g. Rohit Sharma">
                    
                    <label class="fw-bold mt-2">Role Assignment (Permission Level)</label>
                    <select id="newUsrRole" class="form-select">
                        <option value="viewer">Plant Executive (Viewer - Read Only)</option>
                        <option value="safety_officer">Safety Officer (Create & Edit Inspections/TBT)</option>
                        <option value="admin">System Administrator (Full Master Control)</option>
                    </select>
                    
                    <label class="fw-bold mt-2">Department</label>
                    <input id="newUsrDept" type="text" class="form-control" value="Safety & Fire Services" readonly>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#0A2647',
            confirmButtonText: 'Provision Account',
            preConfirm: () => {
                return {
                    username: document.getElementById('newUsrName').value,
                    password: document.getElementById('newUsrPass').value,
                    name: document.getElementById('newUsrFullName').value,
                    role: document.getElementById('newUsrRole').value,
                    department: document.getElementById('newUsrDept').value
                };
            }
        });

        if (formValues && formValues.username) {
            const dbData = dataService.getDatabase();
            if (!dbData.users) dbData.users = [];
            dbData.users.push({
                id: `USR-${Math.floor(100 + Math.random() * 900)}`,
                ...formValues,
                active: true
            });
            dataService.saveDatabase(dbData);
            Swal.fire({ title: 'Account Created!', text: `User ${formValues.username} provisioned with role ${formValues.role.toUpperCase()}.`, icon: 'success' });
            this.app.renderCurrentModule();
        }
    }

    async editUserModal(userId) {
        const dbData = dataService.getDatabase();
        const user = dbData.users.find(u => u.id === userId);
        if (!user) return;

        const { value: formValues } = await Swal.fire({
            title: `<strong style="color:#0A2647;">User Profile & Role Controls: ${user.username}</strong>`,
            html: `
                <div style="text-align:left; font-size:13px; max-height: 450px; overflow-y: auto; padding-right: 5px;">
                    <div class="row g-2">
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Username <span class="text-danger">*</span></label>
                            <input id="editUsrName" type="text" class="form-control form-control-sm" value="${user.username}">
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Full Employee Name <span class="text-danger">*</span></label>
                            <input id="editUsrFullName" type="text" class="form-control form-control-sm" value="${user.name || ''}">
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1 text-primary">Assigned System Role</label>
                            <select id="editUsrRole" class="form-select form-select-sm fw-bold border-primary">
                                <option value="viewer" ${user.role === 'viewer' ? 'selected' : ''}>Plant Executive (Viewer - Read Only)</option>
                                <option value="safety_officer" ${user.role === 'safety_officer' ? 'selected' : ''}>Safety Officer (Create/Edit)</option>
                                <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>System Administrator (Master Control)</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Designation / Title</label>
                            <input id="editUsrDesignation" type="text" class="form-control form-control-sm" value="${user.designation || ''}" placeholder="e.g. Lead Safety Officer">
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Official Email</label>
                            <input id="editUsrEmail" type="email" class="form-control form-control-sm" value="${user.email || ''}">
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Contact Phone</label>
                            <input id="editUsrPhone" type="text" class="form-control form-control-sm" value="${user.phone || ''}">
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Employee Code / SAP ID</label>
                            <input id="editUsrEmpId" type="text" class="form-control form-control-sm font-mono" value="${user.employeeId || ''}">
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Department</label>
                            <input id="editUsrDept" type="text" class="form-control form-control-sm" value="${user.department || ''}">
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Plant Location / Area</label>
                            <input id="editUsrPlant" type="text" class="form-control form-control-sm" value="${user.plantLocation || ''}">
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Emergency Contact (SOS)</label>
                            <input id="editUsrSos" type="text" class="form-control form-control-sm" value="${user.emergencyContact || ''}">
                        </div>
                        <div class="col-12">
                            <label class="fw-bold mt-1">Certifications & Qualifications</label>
                            <input id="editUsrQual" type="text" class="form-control form-control-sm" value="${user.qualifications || ''}">
                        </div>
                        <div class="col-12">
                            <label class="fw-bold mt-1">Professional Bio & Notes</label>
                            <textarea id="editUsrBio" class="form-control form-control-sm" rows="2">${user.bio || ''}</textarea>
                        </div>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#0A2647',
            confirmButtonText: 'Save All Profile Changes',
            width: '650px',
            preConfirm: () => {
                return {
                    username: document.getElementById('editUsrName').value.trim(),
                    name: document.getElementById('editUsrFullName').value.trim(),
                    role: document.getElementById('editUsrRole').value,
                    designation: document.getElementById('editUsrDesignation').value.trim(),
                    email: document.getElementById('editUsrEmail').value.trim(),
                    phone: document.getElementById('editUsrPhone').value.trim(),
                    employeeId: document.getElementById('editUsrEmpId').value.trim(),
                    department: document.getElementById('editUsrDept').value.trim(),
                    plantLocation: document.getElementById('editUsrPlant').value.trim(),
                    emergencyContact: document.getElementById('editUsrSos').value.trim(),
                    qualifications: document.getElementById('editUsrQual').value.trim(),
                    bio: document.getElementById('editUsrBio').value.trim()
                };
            }
        });

        if (formValues && formValues.username) {
            user.username = formValues.username;
            user.name = formValues.name;
            user.role = formValues.role;
            user.designation = formValues.designation;
            user.email = formValues.email;
            user.phone = formValues.phone;
            user.employeeId = formValues.employeeId;
            user.department = formValues.department;
            user.plantLocation = formValues.plantLocation;
            user.emergencyContact = formValues.emergencyContact;
            user.qualifications = formValues.qualifications;
            user.bio = formValues.bio;
            dataService.saveDatabase(dbData);
            Swal.fire({ title: 'Profile Updated', text: 'Full user profile and role details have been updated.', icon: 'success' });
            this.app.renderCurrentModule();
        }
    }

    async changePasswordModal(userId) {
        const dbData = dataService.getDatabase();
        const user = dbData.users.find(u => u.id === userId);
        if (!user) return;

        const { value: newPass } = await Swal.fire({
            title: `<strong style="color:#C62828;">Change Password for ${user.username}</strong>`,
            input: 'text',
            inputLabel: 'Enter New Password',
            inputValue: user.password || 'ntpc@2026',
            showCancelButton: true,
            confirmButtonColor: '#C62828',
            confirmButtonText: 'Update Password'
        });

        if (newPass) {
            user.password = newPass;
            dataService.saveDatabase(dbData);
            Swal.fire({ title: 'Password Changed!', text: `Password for ${user.username} is now: ${newPass}`, icon: 'success' });
            this.app.renderCurrentModule();
        }
    }

    toggleUserApproval(userId) {
        const dbData = dataService.getDatabase();
        const user = dbData.users.find(u => u.id === userId);
        if (user) {
            user.approved = (user.approved === false || user.status === 'Pending') ? true : false;
            user.status = user.approved ? 'Approved' : 'Pending';
            dataService.saveDatabase(dbData);
            Swal.fire({
                icon: user.approved ? 'success' : 'warning',
                title: user.approved ? 'User Approved!' : 'Approval Revoked!',
                text: `Account for ${user.name} (${user.username}) is now ${user.approved ? 'Approved and can log into ERP' : 'Pending Approval'}.`,
                timer: 1800,
                showConfirmButton: false
            });
            this.app.renderCurrentModule();
        }
    }

    toggleUserStatus(userId) {
        const dbData = dataService.getDatabase();
        const user = dbData.users.find(u => u.id === userId);
        if (user) {
            user.active = (user.active === false) ? true : false;
            dataService.saveDatabase(dbData);
            this.app.renderCurrentModule();
        }
    }

    deleteUser(userId) {
        if (confirm(`Are you sure you want to permanently delete user account ${userId}?`)) {
            const dbData = dataService.getDatabase();
            dbData.users = dbData.users.filter(u => u.id !== userId);
            dataService.saveDatabase(dbData);
            this.app.renderCurrentModule();
        }
    }

    async approveAccount(userId) {
        const dbData = dataService.getDatabase();
        const user = dbData.users.find(u => u.id === userId);
        if (!user) return;

        const roleSelectEl = document.getElementById(`role_select_${userId}`);
        const selectedRole = roleSelectEl ? roleSelectEl.value : (user.role || 'viewer');

        const res = await Swal.fire({
            title: '<strong style="color:#0A2647;">Confirm Account Approval</strong>',
            html: `You are about to approve and activate safety portal access for:<br><br><b>${user.name || user.username}</b> (${user.email || 'No email provided'})<br><br>Assigned Permission Level: <span class="badge bg-primary text-uppercase px-2 py-1 font-mono">${selectedRole.replace('_', ' ')}</span>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2E7D32',
            cancelButtonColor: '#6c757d',
            confirmButtonText: '<i class="fas fa-check-circle me-1"></i> Yes, Activate Account!'
        });

        if (res.isConfirmed) {
            user.role = selectedRole;
            user.approved = true;
            user.status = 'Approved';
            user.active = true;
            dataService.saveDatabase(dbData);

            Swal.fire({
                icon: 'success',
                title: 'Account Activated!',
                text: `User ${user.name || user.username} has been approved with role ${selectedRole.toUpperCase()} and can now log into NTPC Safety Portal.`,
                timer: 2200,
                showConfirmButton: false
            });
            this.app.renderCurrentModule();
        }
    }

    async approveAllPending() {
        const dbData = dataService.getDatabase();
        const pendingUsers = dbData.users.filter(u => u.role !== 'admin' && (u.approved === false || u.status === 'Pending'));
        if (pendingUsers.length === 0) return;

        const res = await Swal.fire({
            title: '<strong style="color:#0A2647;">Approve All Pending Users?</strong>',
            text: `You are about to activate safety portal access for all ${pendingUsers.length} pending user accounts with their currently selected roles.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2E7D32',
            confirmButtonText: `<i class="fas fa-check-double me-1"></i> Yes, Approve All (${pendingUsers.length})!`
        });

        if (res.isConfirmed) {
            pendingUsers.forEach(u => {
                const roleSelectEl = document.getElementById(`role_select_${u.id}`);
                if (roleSelectEl) u.role = roleSelectEl.value;
                u.approved = true;
                u.status = 'Approved';
                u.active = true;
            });
            dataService.saveDatabase(dbData);

            Swal.fire({
                icon: 'success',
                title: 'All Accounts Activated!',
                text: `Successfully approved ${pendingUsers.length} employee accounts.`,
                timer: 2200,
                showConfirmButton: false
            });
            this.app.renderCurrentModule();
        }
    }

    async rejectAccount(userId) {
        const dbData = dataService.getDatabase();
        const user = dbData.users.find(u => u.id === userId);
        if (!user) return;

        const res = await Swal.fire({
            title: '<strong style="color:#C62828;">Reject Registration?</strong>',
            text: `Are you sure you want to reject and permanently remove the registration request for ${user.name || user.username}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C62828',
            confirmButtonText: 'Yes, Reject & Remove'
        });

        if (res.isConfirmed) {
            dbData.users = dbData.users.filter(u => u.id !== userId);
            dataService.saveDatabase(dbData);
            Swal.fire({
                icon: 'info',
                title: 'Request Removed',
                text: `Registration request for @${user.username} has been removed.`,
                timer: 1800,
                showConfirmButton: false
            });
            this.app.renderCurrentModule();
        }
    }

    async openCreateDeptModal() {
        const { value: vals } = await Swal.fire({
            title: 'Add Plant Department',
            html: `
                <div style="text-align:left; font-size:13px;">
                    <label class="fw-bold mt-2">Department Code / ID</label>
                    <input id="newDeptId" class="form-control" placeholder="e.g. DEPT-07">
                    <label class="fw-bold mt-2">Department Name</label>
                    <input id="newDeptName" class="form-control" placeholder="e.g. Solar Energy Division">
                    <label class="fw-bold mt-2">Head of Department (HOD)</label>
                    <input id="newDeptHead" class="form-control" placeholder="e.g. V. K. Gupta">
                    <label class="fw-bold mt-2">Workforce Headcount</label>
                    <input id="newDeptCount" type="number" class="form-control" value="50">
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: '#0A2647',
            preConfirm: () => ({ id: document.getElementById('newDeptId').value || `DEPT-${Math.floor(10+Math.random()*89)}`, name: document.getElementById('newDeptName').value, head: document.getElementById('newDeptHead').value || 'TBD', headcount: document.getElementById('newDeptCount').value || 0 })
        });
        if (vals && vals.name) {
            const dbData = dataService.getDatabase();
            if (!dbData.departments) dbData.departments = [];
            dbData.departments.push(vals);
            dataService.saveDatabase(dbData);
            this.app.renderCurrentModule();
        }
    }

    async editDeptModal(deptId) {
        const dbData = dataService.getDatabase();
        const dept = dbData.departments.find(d => d.id === deptId);
        if (!dept) return;
        const { value: vals } = await Swal.fire({
            title: `Edit ${dept.name}`,
            html: `
                <div style="text-align:left; font-size:13px;">
                    <label class="fw-bold mt-2">Department Name</label>
                    <input id="edDeptName" class="form-control" value="${dept.name}">
                    <label class="fw-bold mt-2">Head of Department (HOD)</label>
                    <input id="edDeptHead" class="form-control" value="${dept.head}">
                    <label class="fw-bold mt-2">Headcount</label>
                    <input id="edDeptCount" type="number" class="form-control" value="${dept.headcount}">
                </div>
            `,
            showCancelButton: true, confirmButtonColor: '#0A2647',
            preConfirm: () => ({ name: document.getElementById('edDeptName').value, head: document.getElementById('edDeptHead').value, headcount: document.getElementById('edDeptCount').value })
        });
        if (vals) {
            dept.name = vals.name; dept.head = vals.head; dept.headcount = vals.headcount;
            dataService.saveDatabase(dbData);
            this.app.renderCurrentModule();
        }
    }

    deleteDept(deptId) {
        if (confirm(`Remove department ${deptId}?`)) {
            const dbData = dataService.getDatabase();
            dbData.departments = dbData.departments.filter(d => d.id !== deptId);
            dataService.saveDatabase(dbData);
            this.app.renderCurrentModule();
        }
    }

    async openCreateAreaModal() {
        const name = prompt("Enter New Plant Area Designation (e.g. Solar Plant Bay):");
        const code = prompt("Enter Area Short Code (e.g. SPB):");
        if (name && code) {
            PLANT_AREAS.push({ id: code.toLowerCase(), name: name, code: code.toUpperCase() });
            this.app.renderCurrentModule();
        }
    }

    deleteArea(idOrCode) {
        if (confirm(`Remove plant area ${idOrCode}?`)) {
            const idx = PLANT_AREAS.findIndex(a => a.id === idOrCode || a.code === idOrCode);
            if (idx !== -1) PLANT_AREAS.splice(idx, 1);
            this.app.renderCurrentModule();
        }
    }

    async openCreateCategoryModal() {
        const name = prompt("Enter New Safety Inspection Category Name:");
        const freq = confirm("Is this a Monthly Inspection? (Click OK for Monthly, Cancel for Quarterly)") ? "Monthly" : "Quarterly";
        if (name) {
            INSPECTION_CATEGORIES.push({ id: name.toLowerCase().replace(/\s+/g, '_'), name: name, frequency: freq, areas: ["Main Plant", "CHP", "Switchyard"] });
            this.app.renderCurrentModule();
        }
    }

    deleteCategory(catId) {
        if (confirm(`Remove inspection category ${catId}?`)) {
            const idx = INSPECTION_CATEGORIES.findIndex(c => c.id === catId);
            if (idx !== -1) INSPECTION_CATEGORIES.splice(idx, 1);
            this.app.renderCurrentModule();
        }
    }

    handleRestore(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const res = dataService.importRestoreJSON(e.target.result);
                if (res.success) {
                    Swal.fire({ title: 'Restore Complete!', text: 'Database updated from snapshot.', icon: 'success' });
                    location.reload();
                } else {
                    Swal.fire({ title: 'Restore Failed', text: res.message, icon: 'error' });
                }
            };
            reader.readAsText(input.files[0]);
        }
    }
}
