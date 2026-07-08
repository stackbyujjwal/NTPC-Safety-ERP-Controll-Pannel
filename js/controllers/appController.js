/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Central Application Controller & Router (Orchestrates all 12 modules)
 */

import { APP_CONFIG } from '../config/constants.js';
import { authService } from '../services/authService.js';
import { dataService } from '../services/dataService.js';
import { exportService } from '../services/exportService.js';

import { NavbarComponent } from '../components/navbar.js';
import { SidebarComponent } from '../components/sidebar.js';

import { DashboardController } from './dashboardCtrl.js';
import { InspectionController } from './inspectionCtrl.js';
import { TBTController } from './tbtCtrl.js';
import { TrainingController } from './trainingCtrl.js';
import { IncidentController } from './incidentCtrl.js';
import { ReportsController } from './reportsCtrl.js';
import { CalendarController } from './calendarCtrl.js';
import { GalleryController } from './galleryCtrl.js';
import { DocumentController } from './documentCtrl.js';
import { AdminController } from './adminCtrl.js';

export class AppController {
    constructor() {
        this.state = {
            activeModule: 'dashboard',
            fy: APP_CONFIG.DEFAULT_FY,
            month: 'all',
            area: 'all',
            theme: localStorage.getItem('ntpc_erp_theme') || 'light'
        };

        this.navbarComponent = new NavbarComponent(this);
        this.sidebarComponent = new SidebarComponent(this);

        this.controllers = {
            dashboard: new DashboardController(this),
            inspections: new InspectionController(this),
            tbt: new TBTController(this),
            training: new TrainingController(this),
            incidents: new IncidentController(this),
            reports: new ReportsController(this),
            calendar: new CalendarController(this),
            gallery: new GalleryController(this),
            documents: new DocumentController(this),
            admin: new AdminController(this)
        };
    }

    syncDateMemory(dateEl, monthSelectId, fyInputId) {
        if (!dateEl || !dateEl.value) return;
        const mem = getSmartDateMemory(dateEl.value);
        if (monthSelectId) {
            const mSel = document.getElementById(monthSelectId);
            if (mSel) mSel.value = mem.month;
        }
        if (fyInputId) {
            const fyInp = document.getElementById(fyInputId);
            if (fyInp) fyInp.value = mem.fy;
        }
        this.state.fy = mem.fy;
        const topFySel = document.getElementById('globalFySelect');
        if (topFySel) topFySel.value = mem.fy;
    }

    init() {
        this.applyTheme(this.state.theme);
        this.setupKeyboardShortcuts();
        this.render();
    }

    getController(name) {
        return this.controllers[name];
    }

    applyTheme(theme) {
        this.state.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('ntpc_erp_theme', theme);

        const iconEl = document.querySelector('.id-theme-icon');
        if (iconEl) {
            iconEl.className = theme === 'dark' ? 'fas fa-sun id-theme-icon text-warning' : 'fas fa-moon id-theme-icon text-primary';
        }
    }

    toggleTheme() {
        const nextTheme = this.state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(nextTheme);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Alt + D -> Dashboard, Alt + I -> Inspections, Alt + N -> New Inspection
            if (e.altKey && e.key.toLowerCase() === 'd') {
                e.preventDefault();
                this.navigateTo('dashboard');
            } else if (e.altKey && e.key.toLowerCase() === 'i') {
                e.preventDefault();
                this.navigateTo('inspections');
            } else if (e.altKey && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                if (authService.isAuthenticated()) {
                    this.navigateTo('inspections');
                    setTimeout(() => this.controllers.inspections.openCreateModal(), 300);
                }
            }
        });
    }

    login(username, password) {
        const result = authService.login(username, password);
        if (result.success) {
            Swal.fire({
                title: 'Login Successful',
                text: `Welcome back, ${result.user.name}`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            this.render();
        } else {
            const errEl = document.getElementById('loginErrorMessage');
            if (errEl) {
                errEl.innerHTML = result.message;
            } else {
                Swal.fire('Login Error', result.message, 'error');
            }
        }
    }

    logout() {
        Swal.fire({
            title: 'Logout of Safety Portal?',
            text: 'You will be returned to the safety login screen.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0A2647',
            confirmButtonText: 'Yes, Logout'
        }).then((res) => {
            if (res.isConfirmed) {
                authService.logout();
                this.render();
            }
        });
    }

    openProfileEditModal() {
        const user = authService.getCurrentUser();
        if (!user) return;
        
        let dbUser = user;
        try {
            const dbRaw = localStorage.getItem("ntpc_safety_erp_database_v4");
            if (dbRaw) {
                const parsed = JSON.parse(dbRaw);
                if (parsed && parsed.users) {
                    const match = parsed.users.find(u => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase());
                    if (match) dbUser = { ...user, ...match };
                }
            }
        } catch(e) {}

        let holder = document.getElementById('userProfileModalHolder');
        if (!holder) {
            holder = document.createElement('div');
            holder.id = 'userProfileModalHolder';
            document.body.appendChild(holder);
        }

        const photoUrl = dbUser.photo && dbUser.photo !== 'assets/power-plant-bg.svg' ? dbUser.photo : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

        holder.innerHTML = `
            <div class="modal fade" id="userProfileEditModal" tabindex="-1" aria-hidden="true" style="z-index: 1065;">
                <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content border-0 shadow-lg" style="border-radius: 16px; overflow: hidden;">
                        <div class="modal-header bg-primary text-white p-4 d-flex justify-content-between align-items-center" style="background: linear-gradient(135deg, #0A2647 0%, #144272 100%);">
                            <div class="d-flex align-items-center gap-3">
                                <div class="bg-white text-primary rounded-circle d-flex align-items-center justify-content-center shadow" style="width:48px; height:48px; font-size:22px;">
                                    <i class="fas fa-user-shield"></i>
                                </div>
                                <div>
                                    <h4 class="modal-title fw-bold m-0" style="color: #ffffff;">My Profile & Security Settings</h4>
                                    <div style="font-size: 12.5px; color: #93c5fd;">Manage your Basic & Advance NTPC Credentials, Photo & Security Password</div>
                                </div>
                            </div>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        
                        <div class="modal-body p-4 bg-light">
                            <form id="userProfileEditForm" onsubmit="event.preventDefault(); window.app.saveProfileDetails();">
                                
                                <!-- Profile Header & Photo Upload Area -->
                                <div class="card border-0 shadow-sm rounded-4 mb-4 p-4 bg-white">
                                    <div class="row align-items-center g-3">
                                        <div class="col-md-auto text-center">
                                            <div class="position-relative d-inline-block">
                                                <img id="profilePreviewImg" src="${photoUrl}" alt="${dbUser.name}" class="rounded-circle shadow" style="width: 105px; height: 105px; object-fit: cover; border: 3px solid #0A2647; background: #f8fafc;">
                                                <label for="profPhotoInput" class="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle shadow p-2 cursor-pointer d-flex align-items-center justify-content-center" style="width: 34px; height: 34px; cursor: pointer; transition: transform 0.2s;" title="Upload new profile picture">
                                                    <i class="fas fa-camera" style="font-size: 14px;"></i>
                                                </label>
                                                <input type="file" id="profPhotoInput" accept="image/*" class="d-none" onchange="window.app.handlePhotoSelect(event)">
                                            </div>
                                        </div>
                                        <div class="col-md">
                                            <h5 class="fw-bold text-primary mb-1 d-flex align-items-center flex-wrap gap-2">
                                                ${dbUser.name} 
                                                <span class="badge bg-primary" style="font-size: 11px;">${(dbUser.role || 'USER').toUpperCase()}</span>
                                            </h5>
                                            <div class="text-muted mb-3" style="font-size: 13px;">
                                                <i class="fas fa-id-badge me-1 text-primary"></i> User ID: <strong class="text-dark">${dbUser.id || 'USR-001'}</strong> | Username: <strong class="text-dark">${dbUser.username}</strong>
                                            </div>
                                            <div class="d-flex flex-wrap gap-2 align-items-center">
                                                <input type="text" id="profPhotoUrl" class="form-control form-control-sm border-secondary-subtle" placeholder="Or paste Photo URL (https://...)" value="${dbUser.photo && dbUser.photo !== 'assets/power-plant-bg.svg' ? dbUser.photo : ''}" style="max-width: 330px; font-size: 12px;" oninput="document.getElementById('profilePreviewImg').src = this.value || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'">
                                                <button type="button" class="btn btn-sm btn-outline-primary fw-bold" onclick="document.getElementById('profPhotoInput').click()"><i class="fas fa-upload me-1"></i> Upload Photo File</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Basic Personal & Professional Details -->
                                <div class="card border-0 shadow-sm rounded-4 mb-4 p-4 bg-white">
                                    <h6 class="fw-bold text-primary mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                                        <i class="fas fa-id-card"></i> Basic Personal & Professional Details
                                    </h6>
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold text-dark" style="font-size: 12px;">Full Employee Name <span class="text-danger">*</span></label>
                                            <input type="text" id="profName" class="form-control form-control-sm fw-semibold" value="${dbUser.name || ''}" required>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold text-dark" style="font-size: 12px;">Official Email Address</label>
                                            <input type="email" id="profEmail" class="form-control form-control-sm" value="${dbUser.email || ''}" placeholder="employee@ntpc.co.in">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold text-dark d-flex justify-content-between align-items-center" style="font-size: 12px;"><span>Designation / Assigned Role</span> <span class="badge bg-secondary font-normal" style="font-size: 9.5px;"><i class="fas fa-lock me-1"></i>Admin Controlled</span></label>
                                            <input type="text" id="profDesignation" class="form-control form-control-sm fw-bold text-primary" value="${dbUser.designation || dbUser.role || 'viewer'}" readonly style="background-color: #f8fafc; cursor: not-allowed;" title="Role is fixed by System Administrator">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold text-dark" style="font-size: 12px;">Department / Division</label>
                                            <input type="text" id="profDepartment" class="form-control form-control-sm" value="${dbUser.department || ''}" placeholder="e.g. Safety & Fire Services">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold text-dark" style="font-size: 12px;">Contact Phone Number</label>
                                            <input type="text" id="profPhone" class="form-control form-control-sm" value="${dbUser.phone || ''}" placeholder="Enter contact number...">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold text-dark" style="font-size: 12px;">Employee Code / SAP ID</label>
                                            <input type="text" id="profEmpId" class="form-control form-control-sm font-mono" value="${dbUser.employeeId || ''}" placeholder="e.g. NTPC-EMP-1049">
                                        </div>
                                    </div>
                                </div>

                                <!-- Advance Details & Security Section -->
                                <div class="card border-0 shadow-sm rounded-4 mb-2 p-4 bg-white">
                                    <h6 class="fw-bold text-primary mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                                        <i class="fas fa-shield-alt"></i> Advance Security & Emergency Details
                                    </h6>
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold text-danger d-flex justify-content-between align-items-center" style="font-size: 12px;">
                                                <span>Account Password <span class="text-danger">*</span></span>
                                                <span class="badge bg-warning text-dark font-normal" style="font-size: 9.5px;"><i class="fas fa-eye me-1"></i>Admin Can View</span>
                                            </label>
                                            <div class="input-group input-group-sm">
                                                <span class="input-group-text bg-light text-danger"><i class="fas fa-key"></i></span>
                                                <input type="password" id="profPassword" class="form-control font-mono fw-bold text-danger" value="${dbUser.password || ''}" required placeholder="Set security password">
                                                <button class="btn btn-outline-secondary" type="button" onclick="const p = document.getElementById('profPassword'); p.type = (p.type === 'password' ? 'text' : 'password'); this.querySelector('i').className = (p.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash');" title="Toggle Password Visibility">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                            </div>
                                            <small class="text-muted" style="font-size: 10.5px;">Per NTPC safety transparency policy, passwords are visible to System Administrators in User Controls.</small>
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold text-dark" style="font-size: 12px;">Assigned Plant Area / Unit</label>
                                            <input type="text" id="profPlantLocation" class="form-control form-control-sm" value="${dbUser.plantLocation || ''}" placeholder="e.g. North Karanpura Super Thermal Power Station">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold text-dark" style="font-size: 12px;">Emergency Contact (SOS)</label>
                                            <input type="text" id="profEmergencyContact" class="form-control form-control-sm" value="${dbUser.emergencyContact || ''}" placeholder="e.g. Plant Control Room / Ext 4040">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold text-dark" style="font-size: 12px;">Certifications & Qualifications</label>
                                            <input type="text" id="profQualifications" class="form-control form-control-sm" value="${dbUser.qualifications || ''}" placeholder="e.g. B.Tech Electrical, ADIS Safety Certified">
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label fw-bold text-dark" style="font-size: 12px;">Professional Bio & Safety Responsibility Notes</label>
                                            <textarea id="profBio" class="form-control form-control-sm" rows="2" placeholder="e.g. Responsible for plant-wide electrical and fire safety audits, regulatory compliances, and daily tool box training.">${dbUser.bio || ''}</textarea>
                                        </div>
                                    </div>
                                </div>

                            </form>
                        </div>

                        <div class="modal-footer bg-white p-3 px-4 d-flex justify-content-between align-items-center">
                            <button type="button" class="btn btn-outline-secondary btn-sm px-3" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-erp-primary btn-sm px-4 fw-bold shadow-sm" onclick="window.app.saveProfileDetails()">
                                <i class="fas fa-save me-1"></i> Save Full Profile Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const modalEl = new bootstrap.Modal(document.getElementById('userProfileEditModal'));
        modalEl.show();
    }

    handlePhotoSelect(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                const preview = document.getElementById('profilePreviewImg');
                if (preview) preview.src = dataUrl;
                const urlInput = document.getElementById('profPhotoUrl');
                if (urlInput) urlInput.value = dataUrl;
            };
            reader.readAsDataURL(file);
        }
    }

    saveProfileDetails() {
        const user = authService.getCurrentUser();
        if (!user) return;

        const name = document.getElementById('profName').value.trim();
        const email = document.getElementById('profEmail').value.trim();
        const designation = document.getElementById('profDesignation').value.trim();
        const department = document.getElementById('profDepartment').value.trim();
        const phone = document.getElementById('profPhone').value.trim();
        const empId = document.getElementById('profEmpId').value.trim();
        const password = document.getElementById('profPassword').value.trim();
        const plantLocation = document.getElementById('profPlantLocation').value.trim();
        const emergencyContact = document.getElementById('profEmergencyContact').value.trim();
        const qualifications = document.getElementById('profQualifications').value.trim();
        const bio = document.getElementById('profBio').value.trim();
        const photoUrlInput = document.getElementById('profPhotoUrl').value.trim();
        const previewSrc = document.getElementById('profilePreviewImg') ? document.getElementById('profilePreviewImg').src : '';
        const photo = photoUrlInput || previewSrc || '';

        if (!name || !password) {
            Swal.fire({ title: 'Validation Error', text: 'Full Name and Password are required fields.', icon: 'warning', confirmButtonColor: '#0A2647' });
            return;
        }

        const updatedFields = {
            name,
            email,
            designation,
            department,
            phone,
            employeeId: empId,
            password,
            plantLocation,
            emergencyContact,
            qualifications,
            bio,
            photo
        };

        try {
            const dbRaw = localStorage.getItem("ntpc_safety_erp_database_v4");
            if (dbRaw) {
                const parsed = JSON.parse(dbRaw);
                if (parsed && parsed.users) {
                    let matchIdx = parsed.users.findIndex(u => u.id === user.id || u.username.toLowerCase() === user.username.toLowerCase());
                    if (matchIdx !== -1) {
                        parsed.users[matchIdx] = { ...parsed.users[matchIdx], ...updatedFields };
                    } else {
                        parsed.users.push({ ...user, ...updatedFields });
                    }
                    localStorage.setItem("ntpc_safety_erp_database_v4", JSON.stringify(parsed));
                }
            }
        } catch(e) {}

        const updatedUser = { ...user, ...updatedFields };
        authService.saveSession(updatedUser);

        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('userProfileEditModal'));
        if (modalInstance) modalInstance.hide();

        Swal.fire({
            title: 'Profile & Password Updated!',
            html: `Your personal credentials, photo, and security password have been saved.<br><small style="color:#C62828;">Note: Your updated password is now synchronized with System Admin records.</small>`,
            icon: 'success',
            confirmButtonColor: '#0A2647'
        });

        this.render();
    }

    navigateTo(moduleName) {
        this.state.activeModule = moduleName;
        this.render();
    }

    refreshCurrentModule() {
        this.renderCurrentModule();
    }

    exportCSV(collectionName) {
        dataService.getAll(collectionName, { fy: this.state.fy }).then(items => {
            if (!items.length) return;
            const keys = Object.keys(items[0]);
            const rows = items.map(i => keys.map(k => i[k]));
            exportService.exportToCSV(keys, rows, `NTPC_${collectionName.toUpperCase()}_Export`);
        });
    }

    async render() {
        const rootEl = document.getElementById('appRoot');
        if (!rootEl) return;

        if (!authService.isAuthenticated()) {
            rootEl.innerHTML = this.renderLoginScreen();
            this.bindLoginEvents();
            return;
        }

        rootEl.innerHTML = `
            <div class="erp-wrapper">
                ${this.sidebarComponent.render(this.state.activeModule)}
                <main class="erp-main">
                    ${this.navbarComponent.render()}
                    <div id="moduleContentArea" class="erp-content">
                        <div class="text-center py-5"><div class="spinner-border text-primary" role="status"></div></div>
                    </div>
                </main>
            </div>
        `;

        this.bindNavbarEvents();
        this.navbarComponent.startClock();
        await this.renderCurrentModule();
    }

    async renderCurrentModule() {
        const cont = document.getElementById('moduleContentArea');
        if (!cont) return;

        let html = '';
        if (this.controllers[this.state.activeModule]) {
            html = await this.controllers[this.state.activeModule].render();
        } else if (this.state.activeModule === 'notifications') {
            html = this.renderNotificationsModule();
        } else if (this.state.activeModule === 'settings') {
            html = this.renderSettingsModule();
        } else {
            html = `<div class="p-5 text-center"><h4>Module Under Active Deployment</h4></div>`;
        }

        cont.innerHTML = html;

        if (this.controllers[this.state.activeModule] && typeof this.controllers[this.state.activeModule].afterRender === 'function') {
            this.controllers[this.state.activeModule].afterRender();
        }
    }

    renderLoginScreen() {
        return `
            <div class="login-wrapper" style="background-image: url('assets/power-plant-bg.svg');">
                <div class="login-overlay"></div>
                <div class="login-card">
                    <div class="login-header">
                        <div class="login-logo">N</div>
                        <h1 class="login-title">NTPC Safety Portal</h1>
                        <div class="login-subtitle">Safety & Fire Services Department</div>
                    </div>
                    <div class="d-flex justify-content-center mb-4 border-bottom pb-2">
                        <button id="tabLoginBtn" class="btn btn-sm fw-bold text-primary border-bottom border-primary border-2 rounded-0 px-3 py-1" onclick="window.showLoginForm(); return false;">Login</button>
                        <button id="tabRegisterBtn" class="btn btn-sm fw-bold text-muted rounded-0 px-3 py-1" onclick="window.showRegisterForm(); return false;">Register Account</button>
                    </div>
                    <form id="loginForm">
                        <div class="mb-3">
                            <label class="form-label fw-bold text-muted" style="font-size:11px; text-transform:uppercase;">Username or Email</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="fas fa-user text-muted"></i></span>
                                <input type="text" id="loginUsername" class="form-control border-start-0" placeholder="e.g. admin or user@ntpc.co.in" value="" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold text-muted" style="font-size:11px; text-transform:uppercase;">Security Password</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0"><i class="fas fa-lock text-muted"></i></span>
                                <input type="password" id="loginPassword" class="form-control border-start-0" placeholder="Enter Security Password" value="" required>
                            </div>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-4" style="font-size:12px;">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="rememberMe" checked>
                                <label class="form-check-label" for="rememberMe">Remember Session</label>
                            </div>
                            <a href="#" onclick="Swal.fire('Password Recovery', 'Please contact NTPC Safety & Fire Services Helpdesk at ext 4040 to reset credentials.', 'info'); return false;" class="text-decoration-none">Forgot Password?</a>
                        </div>
                        <button type="submit" class="btn btn-erp-primary w-100 py-2 justify-content-center fw-bold" style="font-size:14px;">
                            <i class="fas fa-sign-in-alt me-2"></i> Login
                        </button>
                        <div id="loginErrorMessage" class="mt-2 text-danger text-center fw-bold" style="font-size: 12.5px; min-height: 18px; transition: all 0.2s ease;"></div>
                    </form>
                    <form id="registerForm" style="display: none;">
                        <div class="mb-2">
                            <label class="form-label fw-bold text-muted" style="font-size:11px;">FULL NAME</label>
                            <input type="text" id="regName" class="form-control form-control-sm" placeholder="e.g. Rahul Sharma" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-bold text-muted" style="font-size:11px;">OFFICIAL NTPC EMAIL</label>
                            <input type="email" id="regEmail" class="form-control form-control-sm" placeholder="e.g. rahul.sharma@ntpc.co.in" required>
                        </div>
                        <div class="mb-2">
                            <label class="form-label fw-bold text-muted" style="font-size:11px;">CHOOSE USERNAME</label>
                            <input type="text" id="regUsername" class="form-control form-control-sm" placeholder="e.g. rahul_s" required>
                            <div id="usernameAvailabilityFeedback" class="mt-1" style="font-size: 11.5px; min-height: 18px; transition: all 0.2s ease;"></div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-bold text-muted" style="font-size:11px;">CHOOSE PASSWORD</label>
                            <input type="password" id="regPass" class="form-control form-control-sm" placeholder="Create strong password" required>
                        </div>
                        <button type="submit" class="btn btn-success w-100 py-2 fw-bold shadow-sm mb-2"><i class="fas fa-user-plus me-1"></i> Submit Registration</button>
                        <div class="text-center">
                            <small class="text-muted" style="font-size: 11px;"><i class="fas fa-info-circle text-warning me-1"></i> New accounts require System Admin approval before login.</small>
                        </div>
                    </form>
                    <div class="login-footer">
                        <div>Version ${APP_CONFIG.VERSION} | Developed by ${APP_CONFIG.DEVELOPER}</div>
                        <div class="mt-1">© ${APP_CONFIG.YEAR} ${APP_CONFIG.COMPANY}</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderNotificationsModule() {
        const notifs = dataService.getDatabase().notifications || [];
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="m-0 text-primary fw-bold"><i class="fas fa-bell me-2"></i>System Notification & Alert Center</h3>
            </div>
            <div class="erp-table-container">
                <div class="erp-card-header">Active Safety Alerts & Deadlines</div>
                <div class="table-responsive">
                    <table class="table-erp mb-0">
                        <thead>
                            <tr>
                                <th>Alert ID</th>
                                <th>Level</th>
                                <th>Subject</th>
                                <th>Detailed Description</th>
                                <th>Time Logged</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${notifs.map(n => `
                                <tr>
                                    <td class="font-mono text-muted">${n.id}</td>
                                    <td><span class="badge bg-${n.type === 'danger' ? 'danger' : n.type === 'warning' ? 'warning' : 'success'} text-uppercase">${n.type}</span></td>
                                    <td class="fw-bold">${n.title}</td>
                                    <td>${n.message}</td>
                                    <td class="text-muted">${n.time}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    renderSettingsModule() {
        const currentUser = authService.getCurrentUser() || {};
        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h3 class="m-0 text-primary fw-bold"><i class="fas fa-sliders-h me-2"></i>System Preferences & Personalization</h3>
            </div>
            <div class="row g-4">
                <div class="col-md-6">
                    <div class="erp-card">
                        <div class="erp-card-header">User Profile Preferences</div>
                        <div class="erp-card-body">
                            <div class="mb-3">
                                <label class="fw-bold">Full Name</label>
                                <input type="text" class="form-control bg-light" value="${currentUser.name}" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Assigned Role & Permissions</label>
                                <input type="text" class="form-control bg-light text-uppercase" value="${currentUser.role}" readonly>
                            </div>
                            <div class="mb-3">
                                <label class="fw-bold">Department</label>
                                <input type="text" class="form-control bg-light" value="${currentUser.department}" readonly>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="erp-card">
                        <div class="erp-card-header">UI Customization & Shortcuts</div>
                        <div class="erp-card-body">
                            <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                                <div>
                                    <div class="fw-bold">Interface Theme</div>
                                    <div class="text-muted" style="font-size:11px;">Switch between Corporate Light and Night Industrial Dark Mode</div>
                                </div>
                                <button class="btn btn-erp-primary btn-sm" onclick="app.toggleTheme()">Toggle Dark Mode</button>
                            </div>
                            <div>
                                <div class="fw-bold mb-1">Keyboard Shortcuts</div>
                                <ul class="text-muted p-0 m-0" style="list-style:none; font-size:12px;">
                                    <li><kbd>Alt</kbd> + <kbd>D</kbd> : Jump to Dashboard</li>
                                    <li><kbd>Alt</kbd> + <kbd>I</kbd> : Jump to Inspections Register</li>
                                    <li><kbd>Alt</kbd> + <kbd>N</kbd> : Record New Inspection Modal</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    bindLoginEvents() {
        window.showRegisterForm = () => {
            const lf = document.getElementById('loginForm');
            const rf = document.getElementById('registerForm');
            if (lf) lf.style.display = 'none';
            if (rf) rf.style.display = 'block';
            const tbL = document.getElementById('tabLoginBtn');
            const tbR = document.getElementById('tabRegisterBtn');
            if (tbL) tbL.className = 'btn btn-sm fw-bold text-muted rounded-0 px-3 py-1';
            if (tbR) tbR.className = 'btn btn-sm fw-bold text-primary border-bottom border-primary border-2 rounded-0 px-3 py-1';
            const errEl = document.getElementById('loginErrorMessage'); if (errEl) errEl.innerHTML = '';
        };
        window.showLoginForm = () => {
            const lf = document.getElementById('loginForm');
            const rf = document.getElementById('registerForm');
            if (rf) rf.style.display = 'none';
            if (lf) lf.style.display = 'block';
            const tbL = document.getElementById('tabLoginBtn');
            const tbR = document.getElementById('tabRegisterBtn');
            if (tbR) tbR.className = 'btn btn-sm fw-bold text-muted rounded-0 px-3 py-1';
            if (tbL) tbL.className = 'btn btn-sm fw-bold text-primary border-bottom border-primary border-2 rounded-0 px-3 py-1';
            const errEl = document.getElementById('loginErrorMessage'); if (errEl) errEl.innerHTML = '';
        };

        const loginU = document.getElementById('loginUsername');
        const loginP = document.getElementById('loginPassword');
        const clrErr = () => { const el = document.getElementById('loginErrorMessage'); if (el) el.innerHTML = ''; };
        if (loginU) loginU.addEventListener('input', clrErr);
        if (loginP) loginP.addEventListener('input', clrErr);

        const form = document.getElementById('loginForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const u = document.getElementById('loginUsername').value.trim();
                const p = document.getElementById('loginPassword').value.trim();
                if (typeof USE_LIVE_FIREBASE !== 'undefined' && USE_LIVE_FIREBASE && typeof fbAuth !== 'undefined' && fbAuth && u.includes('@')) {
                    try {
                        await fbAuth.signInWithEmailAndPassword(u, p);
                    } catch (err) {
                        console.warn("[FirebaseAuth] Email login note:", err.message);
                    }
                }
                this.login(u, p);
            });
        }

        const regUsrInput = document.getElementById('regUsername');
        const feedbackEl = document.getElementById('usernameAvailabilityFeedback');
        const regSubmitBtn = document.querySelector('#registerForm button[type="submit"]');
        if (regUsrInput && feedbackEl) {
            let debounceTimer;
            regUsrInput.addEventListener('input', (e) => {
                const val = e.target.value.trim();
                clearTimeout(debounceTimer);
                if (!val) {
                    feedbackEl.innerHTML = '';
                    regUsrInput.classList.remove('is-valid', 'is-invalid');
                    if (regSubmitBtn) regSubmitBtn.disabled = false;
                    return;
                }
                if (val.length < 3) {
                    feedbackEl.innerHTML = '<span class="text-warning fw-bold"><i class="fas fa-exclamation-triangle me-1"></i>Username must be at least 3 characters</span>';
                    regUsrInput.classList.remove('is-valid');
                    regUsrInput.classList.add('is-invalid');
                    if (regSubmitBtn) regSubmitBtn.disabled = true;
                    return;
                }
                feedbackEl.innerHTML = '<span class="text-info fw-bold"><i class="fas fa-spinner fa-spin me-1"></i>Checking live availability...</span>';
                debounceTimer = setTimeout(() => {
                    const dbData = dataService.getDatabase();
                    const users = dbData.users || [];
                    const exists = users.some(u => u.username.toLowerCase() === val.toLowerCase());
                    if (exists) {
                        feedbackEl.innerHTML = `<span class="text-danger fw-bold"><i class="fas fa-times-circle me-1"></i>Username @${val} is already taken!</span>`;
                        regUsrInput.classList.remove('is-valid');
                        regUsrInput.classList.add('is-invalid');
                        if (regSubmitBtn) regSubmitBtn.disabled = true;
                    } else {
                        feedbackEl.innerHTML = `<span class="text-success fw-bold"><i class="fas fa-check-circle me-1"></i>Username @${val} is available!</span>`;
                        regUsrInput.classList.remove('is-invalid');
                        regUsrInput.classList.add('is-valid');
                        if (regSubmitBtn) regSubmitBtn.disabled = false;
                    }
                }, 350);
            });
        }

        const regForm = document.getElementById('registerForm');
        if (regForm) {
            regForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('regName').value.trim();
                const email = document.getElementById('regEmail').value.trim();
                const username = document.getElementById('regUsername').value.trim();
                const dept = "Safety & Fire Services";
                const password = document.getElementById('regPass').value.trim();

                const dbData = dataService.getDatabase();
                if (dbData.users.some(u => u.username.toLowerCase() === username.toLowerCase() || (u.email && u.email.toLowerCase() === email.toLowerCase()))) {
                    Swal.fire('Registration Error', 'Username or Email is already registered!', 'error');
                    return;
                }

                if (typeof USE_LIVE_FIREBASE !== 'undefined' && USE_LIVE_FIREBASE && typeof fbAuth !== 'undefined' && fbAuth) {
                    try {
                        await fbAuth.createUserWithEmailAndPassword(email, password);
                    } catch (err) {
                        console.warn("[FirebaseAuth] Email registration note:", err.message);
                    }
                }

                const nowStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
                const seq = (dbData.users.length + 101);
                const newId = `NTPC-USR-${nowStr}-${seq}`;

                const newUser = {
                    id: newId,
                    username: username,
                    email: email,
                    password: password,
                    name: name,
                    role: "viewer",
                    department: dept,
                    active: true,
                    approved: false,
                    status: "Pending"
                };

                dbData.users.push(newUser);
                dataService.saveDatabase(dbData);

                Swal.fire({
                    icon: 'success',
                    title: 'Registration Submitted!',
                    html: `Your account <b>${username}</b> (${email}) has been created.<br><br><span class="badge bg-warning text-dark px-2 py-1"><i class="fas fa-clock"></i> Status: Pending Admin Approval</span><br><br><small class="text-muted">Please contact System Administrator (safetyhse65@gmail.com) to approve and activate your account before logging in.</small>`,
                    confirmButtonColor: '#0A2647'
                });
                window.showLoginForm();
            });
        }
    }

    bindNavbarEvents() {
        const toggleBtn = document.getElementById('sidebarToggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const sb = document.getElementById('erpSidebar');
                if (sb) sb.classList.toggle('open');
            });
        }

        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggleTheme());
        }

        const fySelect = document.getElementById('globalFySelect');
        if (fySelect) {
            fySelect.addEventListener('change', (e) => {
                this.state.fy = e.target.value;
                this.renderCurrentModule();
            });
        }

        const mSelect = document.getElementById('globalMonthSelect');
        if (mSelect) {
            mSelect.addEventListener('change', (e) => {
                this.state.month = e.target.value;
                this.renderCurrentModule();
            });
        }

        const aSelect = document.getElementById('globalAreaSelect');
        if (aSelect) {
            aSelect.addEventListener('change', (e) => {
                this.state.area = e.target.value;
                this.renderCurrentModule();
            });
        }
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
    window.app.init();
});
