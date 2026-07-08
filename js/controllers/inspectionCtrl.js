/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Inspection Management Controller (Monthly & Quarterly Safety Inspections)
 */

import { dataService } from '../services/dataService.js';
import { INSPECTION_CATEGORIES, PLANT_AREAS } from '../config/constants.js';
import { ModalComponent } from '../components/modals.js';

export class InspectionController {
    constructor(app) {
        this.app = app;
        this.selectedCategory = 'all';
        this.searchQuery = '';
        this.sortBy = 'sl_asc';
    }

    async render() {
        const filters = {
            fy: this.app.state.fy,
            month: this.app.state.month,
            area: this.app.state.area
        };

        if (!this.selectedMonth) this.selectedMonth = 'April';
        if (this.selectedMonth !== 'All') {
            this.ensureMonthSlots(this.selectedMonth);
        }
        let allInspections = await dataService.getAll('inspections', filters);
        let inspections = [...allInspections];
        if (this.selectedMonth && this.selectedMonth !== 'All') {
            const smMap = { 'Apr': 'April', 'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August', 'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December', 'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'April': 'April', 'May': 'May', 'June': 'June', 'July': 'July', 'August': 'August', 'September': 'September', 'October': 'October', 'November': 'November', 'December': 'December', 'January': 'January', 'February': 'February', 'March': 'March' };
            const fullM = smMap[this.selectedMonth] || this.selectedMonth;
            const codeM = fullM.substring(0, 3).toLowerCase();
            inspections = inspections.filter(i => {
                const m = (i.month || '').toLowerCase();
                const mc = (i.monthCode || '').toLowerCase();
                return m === fullM.toLowerCase() || m.startsWith(codeM) || mc === codeM;
            });
        }
        if (this.selectedCategory !== 'all') {
            inspections = inspections.filter(i => i.category === this.selectedCategory);
        }
            if (this.searchQuery && this.searchQuery.trim() !== '') {
                const q = this.searchQuery.toLowerCase().trim();
                inspections = inspections.filter(i => {
                    const catObj = INSPECTION_CATEGORIES.find(c => c.id === i.category) || { name: i.category };
                    const catName = (catObj.name || i.category || '').toLowerCase();
                    return (i.id && i.id.toLowerCase().includes(q)) ||
                           (catName && catName.includes(q)) ||
                           (i.area && i.area.toLowerCase().includes(q)) ||
                           (i.responsiblePerson && i.responsiblePerson.toLowerCase().includes(q)) ||
                           (i.remarks && i.remarks.toLowerCase().includes(q)) ||
                           (i.status && i.status.toLowerCase().includes(q));
                });
            }

            const fyMonthMap = { 'apr': 1, 'april': 1, 'may': 2, 'jun': 3, 'june': 3, 'jul': 4, 'july': 4, 'aug': 5, 'august': 5, 'sep': 6, 'september': 6, 'oct': 7, 'october': 7, 'nov': 8, 'november': 8, 'dec': 9, 'december': 9, 'jan': 10, 'january': 10, 'feb': 11, 'february': 11, 'mar': 12, 'march': 12 };
            if (this.sortBy === 'sl_asc' || !this.sortBy) {
                inspections.sort((a, b) => {
                    const mA = fyMonthMap[(a.month || a.monthCode || '').toLowerCase()] || 99;
                    const mB = fyMonthMap[(b.month || b.monthCode || '').toLowerCase()] || 99;
                    if (mA !== mB) return mA - mB;
                    const numA = a.slotNo || parseInt((String(a.id || '').match(/\d+/) || [999])[0], 10);
                    const numB = b.slotNo || parseInt((String(b.id || '').match(/\d+/) || [999])[0], 10);
                    return numA !== numB ? numA - numB : String(a.id || '').localeCompare(String(b.id || ''));
                });
            } else if (this.sortBy === 'sl_desc') {
                inspections.sort((a, b) => {
                    const mA = fyMonthMap[(a.month || a.monthCode || '').toLowerCase()] || 0;
                    const mB = fyMonthMap[(b.month || b.monthCode || '').toLowerCase()] || 0;
                    if (mA !== mB) return mB - mA;
                    const numA = a.slotNo || parseInt((String(a.id || '').match(/\d+/) || [0])[0], 10);
                    const numB = b.slotNo || parseInt((String(b.id || '').match(/\d+/) || [0])[0], 10);
                    return numA !== numB ? numB - numA : String(b.id || '').localeCompare(String(a.id || ''));
                });
            } else if (this.sortBy === 'name_asc') {
                inspections.sort((a, b) => {
                    const catA = (INSPECTION_CATEGORIES.find(c => c.id === a.category) || { name: a.category || '' }).name || '';
                    const catB = (INSPECTION_CATEGORIES.find(c => c.id === b.category) || { name: b.category || '' }).name || '';
                    return catA.localeCompare(catB);
                });
            } else if (this.sortBy === 'name_desc') {
                inspections.sort((a, b) => {
                    const catA = (INSPECTION_CATEGORIES.find(c => c.id === a.category) || { name: a.category || '' }).name || '';
                    const catB = (INSPECTION_CATEGORIES.find(c => c.id === b.category) || { name: b.category || '' }).name || '';
                    return catB.localeCompare(catA);
                });
            } else if (this.sortBy === 'date_desc') {
                inspections.sort((a, b) => new Date(b.plannedDate || b.completedDate || 0) - new Date(a.plannedDate || a.completedDate || 0));
            } else if (this.sortBy === 'date_asc') {
                inspections.sort((a, b) => new Date(a.plannedDate || a.completedDate || 0) - new Date(b.plannedDate || b.completedDate || 0));
            }

        return `
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-clipboard-check me-2"></i>Safety Inspection Register</h3>
                    <div class="text-muted" style="font-size:12px;">Complete audit trail for Monthly & Quarterly plant equipment safety checks</div>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-erp-primary btn-sm" onclick="app.getController('inspections').openCreateModal()">
                        <i class="fas fa-plus"></i> Record New Inspection
                    </button>
                    <button class="btn btn-erp-outline btn-sm" onclick="app.exportCSV('inspections')">
                        <i class="fas fa-file-csv"></i> Export CSV
                    </button>
                </div>
            </div>

            <!-- Category Filter Matrix -->
            <div class="filter-bar d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3 p-3 rounded-3 shadow-sm" style="background: #ffffff; border: 1px solid #E2E8F0;">
                <div class="d-flex align-items-center flex-wrap gap-2">
                    <label class="fw-bold text-primary m-0 d-flex align-items-center gap-2" for="insCategoryDropdownCtrl" style="font-size: 13.5px;">
                        <i class="fas fa-filter text-primary"></i> Category Filter:
                    </label>
                    <div class="input-group input-group-sm shadow-sm" style="width: auto; min-width: 250px;">
                        <span class="input-group-text bg-light border-end-0 text-secondary"><i class="fas fa-layer-group"></i></span>
                        <select id="insCategoryDropdownCtrl" class="form-select form-select-sm border-start-0 ps-2 fw-semibold" style="color: #0A2647; cursor: pointer; border-color: #CBD5E1;" onchange="app.getController('inspections').filterCategory(this.value)">
                            <option value="all" ${this.selectedCategory === 'all' ? 'selected' : ''}>All Categories (${allInspections.length})</option>
                            ${INSPECTION_CATEGORIES.map(c => `
                                <option value="${c.id}" ${this.selectedCategory === c.id ? 'selected' : ''}>${c.name}</option>
                            `).join('')}
                        </select>
                    </div>

                    <label class="fw-bold text-primary m-0 ms-2 d-flex align-items-center gap-2" for="insSortDropdownCtrl" style="font-size: 13.5px;">
                        <i class="fas fa-sort-amount-down text-primary"></i> Sort By:
                    </label>
                    <div class="input-group input-group-sm shadow-sm" style="width: auto; min-width: 220px;">
                        <span class="input-group-text bg-light border-end-0 text-secondary"><i class="fas fa-sort"></i></span>
                        <select id="insSortDropdownCtrl" class="form-select form-select-sm border-start-0 ps-2 fw-semibold" style="color: #0A2647; cursor: pointer; border-color: #CBD5E1;" onchange="app.getController('inspections').handleSort(this.value)">
                            <option value="sl_asc" ${this.sortBy === 'sl_asc' ? 'selected' : ''}>1. Serial No (1, 2, 3... Asc)</option>
                            <option value="sl_desc" ${this.sortBy === 'sl_desc' ? 'selected' : ''}>1. Serial No (Desc)</option>
                            <option value="name_asc" ${this.sortBy === 'name_asc' ? 'selected' : ''}>2. Name / Activity (A-Z)</option>
                            <option value="name_desc" ${this.sortBy === 'name_desc' ? 'selected' : ''}>2. Name / Activity (Z-A)</option>
                            <option value="date_desc" ${this.sortBy === 'date_desc' ? 'selected' : ''}>3. Date (Latest First)</option>
                            <option value="date_asc" ${this.sortBy === 'date_asc' ? 'selected' : ''}>3. Date (Oldest First)</option>
                        </select>
                    </div>
                </div>
                <div class="d-flex align-items-center flex-grow-1 justify-content-end" style="max-width: 420px; min-width: 260px;">
                    <div class="input-group input-group-sm shadow-sm w-100">
                        <span class="input-group-text bg-light border-end-0 text-primary"><i class="fas fa-search"></i></span>
                        <input type="text" id="insSearchInputCtrl" class="form-control border-start-0 ps-0" placeholder="Search inspections (Activity, Area, Engineer, Remarks)..." value="${this.searchQuery || ''}" oninput="app.getController('inspections').handleSearchInput(this.value)">
                        ${this.searchQuery ? `<button class="btn btn-outline-secondary" type="button" onclick="app.getController('inspections').clearSearch()" title="Clear Search"><i class="fas fa-times"></i></button>` : ''}
                    </div>
                </div>
            </div>

            <!-- Inspections Data Table -->
            <div class="erp-table-container">
                <div class="erp-card-header">
                    <span>Active Inspections Register (<span id="activeAuditRecordCountCtrl">${inspections.length} records found</span>)</span>
                    <span class="text-muted" style="font-size:11.5px;">Displaying FY: ${this.app.state.fy}</span>
                </div>
                <div class="table-responsive">
                    <table class="table-erp mb-0">
                        <thead>
                            <tr>
                                <th>Inspection ID</th>
                                <th>Category / Type</th>
                                <th>Frequency</th>
                                <th>Plant Area</th>
                                <th>Responsible Engineer</th>
                                <th>Inspection Date</th>
                                <th>Target Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${inspections.length > 0 ? inspections.map((i, idx) => {
                                const catObj = INSPECTION_CATEGORIES.find(c => c.id === i.category) || { name: i.category, frequency: 'Monthly' };
                                return `
                                    <tr>
                                        <td class="fw-bold text-center font-mono align-middle" style="width: 60px; background: #f8fafc; border-right: 1px solid #e2e8f0; color: #0A2647; font-size: 14px;">${idx + 1}</td>
                                        <td class="p-1 align-middle" title="${i.activityName || i.category || ''}" style="min-width: 200px;"><input type="text" class="form-control form-control-sm border-0 bg-transparent px-2 py-1 w-100 fw-semibold text-dark shadow-none focus-bg-white" style="font-size: 13px;" title="${i.activityName || i.category || ''}" placeholder="Enter activity..." value="${i.activityName || i.category || ''}" onchange="app.getController('inspections').updateInlineField('${i.id}', 'activityName', this.value)"></td>
                                        <td class="p-1 align-middle"><select class="form-select form-select-sm border-0 bg-transparent ps-2 pe-4 py-1 shadow-none focus-bg-white" style="font-size: 12.5px; min-width: 115px; width: 100%; cursor: pointer;" onchange="app.getController('inspections').updateInlineField('${i.id}', 'frequency', this.value)"><option value="">Select...</option><option value="Monthly" ${i.frequency === 'Monthly' ? 'selected' : ''}>Monthly</option><option value="Quarterly" ${i.frequency === 'Quarterly' ? 'selected' : ''}>Quarterly</option><option value="Weekly" ${i.frequency === 'Weekly' ? 'selected' : ''}>Weekly</option><option value="Yearly" ${i.frequency === 'Yearly' ? 'selected' : ''}>Yearly</option></select></td>
                                        <td class="p-1 align-middle" title="${i.area || ''}" style="min-width: 140px;"><input type="text" class="form-control form-control-sm border-0 bg-transparent px-2 py-1 w-100 shadow-none focus-bg-white" style="font-size: 13px;" title="${i.area || ''}" placeholder="Enter area..." value="${i.area || ''}" onchange="app.getController('inspections').updateInlineField('${i.id}', 'area', this.value)"></td>
                                        <td class="p-1 align-middle" title="${i.responsiblePerson || ''}" style="min-width: 180px;"><input type="text" class="form-control form-control-sm border-0 bg-transparent px-2 py-1 w-100 shadow-none focus-bg-white" style="font-size: 13px;" title="${i.responsiblePerson || ''}" placeholder="Enter engineer..." value="${i.responsiblePerson || ''}" onchange="app.getController('inspections').updateInlineField('${i.id}', 'responsiblePerson', this.value)"></td>
                                        <td class="p-1 align-middle"><input type="date" class="form-control form-control-sm border-0 bg-transparent px-2 py-1 shadow-none focus-bg-white font-mono" style="font-size: 12px;" value="${i.date || i.completedDate || ''}" onchange="app.getController('inspections').updateInlineField('${i.id}', 'date', this.value)"></td>
                                        <td class="p-1 align-middle"><input type="date" class="form-control form-control-sm border-0 bg-transparent px-2 py-1 shadow-none focus-bg-white font-mono" style="font-size: 12px;" value="${i.targetDate || i.plannedDate || ''}" onchange="app.getController('inspections').updateInlineField('${i.id}', 'targetDate', this.value)"></td>
                                        <td class="p-1 align-middle"><select class="form-select form-select-sm border-0 bg-transparent ps-2 pe-4 py-1 shadow-none focus-bg-white fw-bold ${i.status === 'Completed' ? 'text-success' : i.status === 'Overdue' ? 'text-danger' : i.status === 'Pending' ? 'text-warning' : 'text-muted'}" style="font-size: 12.5px; min-width: 118px; width: 100%; cursor: pointer;" onchange="app.getController('inspections').updateInlineField('${i.id}', 'status', this.value)"><option value="Pending" ${i.status === 'Pending' ? 'selected' : ''}>Pending</option><option value="Completed" ${i.status === 'Completed' ? 'selected' : ''}>Completed</option><option value="In Progress" ${i.status === 'In Progress' ? 'selected' : ''}>In Progress</option><option value="Overdue" ${i.status === 'Overdue' ? 'selected' : ''}>Overdue</option></select></td>
                                        <td>
                                            <button class="btn btn-sm btn-light border text-secondary px-2 py-1 rounded-2 shadow-sm" onclick="app.getController('inspections').openActionMenu('${i.id}', event)" title="Actions">
                                                <i class="fas fa-ellipsis-v"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('') : `
                                <tr>
                                    <td colspan="9" class="text-center py-5 bg-white">
                                        <div class="py-3">
                                            <i class="fas fa-clipboard-list text-primary mb-3" style="font-size: 38px; opacity: 0.7;"></i>
                                            <h6 class="fw-bold text-dark mb-1">No Inspection Records in ${this.selectedMonth || 'April'}</h6>
                                            <p class="text-muted small mb-3">Click 'Record New Inspection' above to create a new record.</p>
                                        </div>
                                    </td>
                                </tr>
                            `}
                        </tbody>
                    </table>
                </div>
                <div class="excel-sheet-tabs d-flex align-items-center bg-light border-top px-3 py-2" style="border-bottom-left-radius: 8px; border-bottom-right-radius: 8px; overflow-x: auto; white-space: nowrap; gap: 4px; background: #f1f5f9 !important; border-color: #cbd5e1 !important;">
                    <div class="d-flex align-items-center me-3 text-success fw-bold" style="font-size: 13px;">
                        <i class="fas fa-file-excel fs-5 me-2"></i>
                        <span>FY Month Tabs:</span>
                    </div>
                    ${[
                        { code: 'Apr', name: 'April' }, { code: 'May', name: 'May' }, { code: 'Jun', name: 'June' },
                        { code: 'Jul', name: 'July' }, { code: 'Aug', name: 'August' }, { code: 'Sep', name: 'September' },
                        { code: 'Oct', name: 'October' }, { code: 'Nov', name: 'November' }, { code: 'Dec', name: 'December' },
                        { code: 'Jan', name: 'January' }, { code: 'Feb', name: 'February' }, { code: 'Mar', name: 'March' }
                    ].map(m => `
                        <button class="btn btn-sm ${this.selectedMonth === m.name || this.selectedMonth === m.code ? 'bg-white fw-bold text-success shadow-sm border border-success' : 'text-secondary border border-transparent hover-bg-white'}" onclick="app.getController('inspections').selectMonth('${m.name}')" style="padding: 5px 16px; font-size: 13px; border-radius: 6px 6px 0 0; border-bottom: ${this.selectedMonth === m.name || this.selectedMonth === m.code ? '3px solid #198754 !important' : 'none'};">
                            ${m.code}
                        </button>
                    `).join('')}
                    <button class="btn btn-sm ${this.selectedMonth === 'All' ? 'bg-white fw-bold text-primary shadow-sm border border-primary' : 'text-secondary border border-transparent hover-bg-white'}" onclick="app.getController('inspections').selectMonth('All')" style="padding: 5px 16px; font-size: 13px; border-radius: 6px 6px 0 0; margin-left: 8px;">
                        <i class="fas fa-list me-1"></i> All FY
                    </button>
                </div>
            </div>

            <!-- Dynamic Modal Container -->
            <div id="dynamicModalContainer"></div>
        `;
    }

    openActionMenu(id, event) {
        if (event) event.stopPropagation();
        const existing = document.getElementById('floatingActionMenu');
        if (existing) {
            const prevId = existing.getAttribute('data-row-id');
            existing.remove();
            if (prevId === id) return;
        }

        const triggerBtn = event ? event.currentTarget : null;
        const rect = triggerBtn ? triggerBtn.getBoundingClientRect() : { bottom: 100, right: 200, top: 100 };
        let topPos = rect.bottom + 4;
        if (topPos + 180 > window.innerHeight) {
            topPos = Math.max(10, rect.top - 180);
        }

        const menu = document.createElement('div');
        menu.id = 'floatingActionMenu';
        menu.setAttribute('data-row-id', id);
        menu.style.position = 'fixed';
        menu.style.top = `${topPos}px`;
        menu.style.left = `${Math.min(rect.right - 180, window.innerWidth - 190)}px`;
        menu.style.width = '180px';
        menu.style.backgroundColor = '#ffffff';
        menu.style.borderRadius = '8px';
        menu.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
        menu.style.border = '1px solid #CBD5E1';
        menu.style.zIndex = '99999';
        menu.style.overflow = 'hidden';

        menu.innerHTML = `
            <div class="py-1">
                <a href="#" class="d-flex align-items-center px-3 py-2 text-decoration-none text-dark action-menu-item" onclick="document.getElementById('floatingActionMenu')?.remove(); app.getController('inspections').viewDetails('${id}'); return false;" style="font-size: 13px; transition: background 0.15s;">
                    <i class="fas fa-eye text-primary me-2" style="width: 16px;"></i> View Details
                </a>
                <a href="#" class="d-flex align-items-center px-3 py-2 text-decoration-none text-dark action-menu-item" onclick="document.getElementById('floatingActionMenu')?.remove(); app.getController('inspections').markComplete('${id}'); return false;" style="font-size: 13px; transition: background 0.15s;">
                    <i class="fas fa-check-circle text-success me-2" style="width: 16px;"></i> Mark Completed
                </a>
                <div class="border-top my-1 border-light"></div>
                <a href="#" class="d-flex align-items-center px-3 py-2 text-decoration-none text-danger action-menu-item" onclick="document.getElementById('floatingActionMenu')?.remove(); app.getController('inspections').deleteRecord('${id}'); return false;" style="font-size: 13px; transition: background 0.15s;">
                    <i class="fas fa-trash-alt me-2" style="width: 16px;"></i> Delete Record
                </a>
            </div>
        `;

        document.body.appendChild(menu);

        const items = menu.querySelectorAll('.action-menu-item');
        items.forEach(item => {
            item.addEventListener('mouseenter', () => item.style.backgroundColor = '#F1F5F9');
            item.addEventListener('mouseleave', () => item.style.backgroundColor = 'transparent');
        });

        const closeListener = (e) => {
            const activeMenu = document.getElementById('floatingActionMenu');
            if (!activeMenu) {
                cleanup();
                return;
            }
            if (activeMenu.contains(e.target) || (triggerBtn && triggerBtn.contains(e.target))) {
                return;
            }
            activeMenu.remove();
            cleanup();
        };
        const cleanup = () => {
            document.removeEventListener('click', closeListener, true);
            document.removeEventListener('mousedown', closeListener, true);
            document.removeEventListener('pointerdown', closeListener, true);
            window.removeEventListener('scroll', closeListener, true);
        };
        setTimeout(() => {
            document.addEventListener('click', closeListener, true);
            document.addEventListener('mousedown', closeListener, true);
            document.addEventListener('pointerdown', closeListener, true);
            window.addEventListener('scroll', closeListener, true);
        }, 10);
    }

    selectMonth(monthName) {
        this.selectedMonth = monthName;
        this.app.renderCurrentModule();
    }

    ensureMonthSlots(monthName) {
        if (!monthName || monthName === 'All') return;
        const dbData = dataService.getDatabase();
        if (!dbData.inspections) dbData.inspections = [];
        
        const currentFy = this.app.state.fy || "2026-2027";
        const monthMap = { 'April': 'Apr', 'May': 'May', 'June': 'Jun', 'July': 'Jul', 'August': 'Aug', 'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec', 'January': 'Jan', 'February': 'Feb', 'March': 'Mar', 'Apr': 'Apr', 'May': 'May', 'Jun': 'Jun', 'Jul': 'Jul', 'Aug': 'Aug', 'Sep': 'Sep', 'Oct': 'Oct', 'Nov': 'Nov', 'Dec': 'Dec', 'Jan': 'Jan', 'Feb': 'Feb', 'Mar': 'Mar' };
        const fullMap = { 'Apr': 'April', 'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August', 'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December', 'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'April': 'April', 'May': 'May', 'June': 'June', 'July': 'July', 'August': 'August', 'September': 'September', 'October': 'October', 'November': 'November', 'December': 'December', 'January': 'January', 'February': 'February', 'March': 'March' };
        
        const mCode = monthMap[monthName] || monthName.substring(0, 3);
        const mFull = fullMap[monthName] || monthName;
        
        const existingForMonth = dbData.inspections.filter(i => (i.month === mFull || i.month === mCode || i.monthCode === mCode || i.month?.startsWith(mCode)) && i.fy === currentFy);
        
        if (!dbData._rowsRemovedManualV1) {
            dbData.inspections = dbData.inspections.filter(i => {
                return (i.activityName && i.activityName.trim() !== '') || 
                       (i.responsiblePerson && i.responsiblePerson.trim() !== '') || 
                       (i.remarks && i.remarks.trim() !== '');
            });
            dbData._rowsRemovedManualV1 = true;
            dataService.saveDatabase(dbData);
        }
    }

    updateInlineField(id, field, value) {
        const dbData = dataService.getDatabase();
        if (!dbData.inspections) return;
        const item = dbData.inspections.find(i => i.id === id);
        if (item) {
            item[field] = value;
            if (field === 'activityName' && !item.category) {
                item.category = value;
            }
            dataService.saveDatabase(dbData);
        }
    }

    filterCategory(catId) {
        this.selectedCategory = catId;
        this.app.renderCurrentModule();
    }

    handleSort(sortVal) {
        this.sortBy = sortVal;
        this.app.renderCurrentModule();
    }

    handleSearchInput(query) {
        this.searchQuery = query;
        const q = (query || '').toLowerCase().trim();
        const tbody = document.querySelector('.table-erp tbody');
        if (!tbody) return;
        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;
        rows.forEach(row => {
            if (row.getAttribute('data-empty') === 'true') return;
            const text = row.innerText.toLowerCase();
            if (q === '' || text.includes(q)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        const countEl = document.getElementById('activeAuditRecordCountCtrl');
        if (countEl) countEl.innerText = `${visibleCount} records found`;

        let noResRow = document.getElementById('searchNoResultsRowCtrl');
        if (visibleCount === 0 && rows.length > 0 && (!rows[0].getAttribute('data-empty'))) {
            if (!noResRow) {
                noResRow = document.createElement('tr');
                noResRow.id = 'searchNoResultsRowCtrl';
                noResRow.setAttribute('data-empty', 'true');
                const colsCount = document.querySelectorAll('.table-erp thead th').length || 10;
                noResRow.innerHTML = `<td colspan="${colsCount}" class="text-center py-4 text-muted"><i class="fas fa-search me-2"></i>No matching records found for "${query}".</td>`;
                tbody.appendChild(noResRow);
            } else {
                noResRow.style.display = '';
                noResRow.querySelector('td').innerHTML = `<i class="fas fa-search me-2"></i>No matching records found for "${query}".`;
            }
        } else if (noResRow) {
            noResRow.style.display = 'none';
        }
    }

    clearSearch() {
        this.searchQuery = '';
        const input = document.getElementById('insSearchInputCtrl');
        if (input) input.value = '';
        this.app.renderCurrentModule();
    }

    openCreateModal() {
        const activeM = (this.selectedMonth && this.selectedMonth !== 'All') ? this.selectedMonth : 'April';
        const cont = document.getElementById('dynamicModalContainer');
        cont.innerHTML = ModalComponent.getInspectionFormModalHTML(
            INSPECTION_CATEGORIES,
            PLANT_AREAS,
            this.app.state.fy,
            activeM
        );
        const modalEl = new bootstrap.Modal(document.getElementById('inspectionModal'));
        modalEl.show();
    }

    async saveInspection() {
        const catEl = document.getElementById('insCategory');
        const cat = catEl ? catEl.value : '';
        const catName = catEl && catEl.selectedIndex >= 0 ? catEl.options[catEl.selectedIndex].text : cat;
        const area = document.getElementById('insArea').value;
        const date = document.getElementById('insDate').value;
        const resp = document.getElementById('insResponsible').value;
        const status = document.getElementById('insStatus').value;
        const remarks = document.getElementById('insRemarks').value;
        const action = document.getElementById('insAction')?.value || 'None';
        const targetDate = document.getElementById('insTargetDate')?.value || date;
        const freq = document.getElementById('insFrequency')?.value || 'Monthly';

        if (!resp || !remarks || !date) {
            Swal.fire({ title: 'Validation Error', text: 'Please fill out all required fields (*)', icon: 'warning', confirmButtonColor: '#0A2647' });
            return;
        }

        const dateMem = getSmartDateMemory(date || new Date());
        const selectedM = document.getElementById('insMonth')?.value || dateMem.month;
        const targetFy = document.getElementById('insFy')?.value || dateMem.fy;
        const monthMap = { 'April': 'Apr', 'May': 'May', 'June': 'Jun', 'July': 'Jul', 'August': 'Aug', 'September': 'Sep', 'October': 'Oct', 'November': 'Nov', 'December': 'Dec', 'January': 'Jan', 'February': 'Feb', 'March': 'Mar' };
        const mCode = monthMap[selectedM] || selectedM.substring(0, 3);

        const dbData = dataService.getDatabase();
        if (!dbData.inspections) dbData.inspections = [];
        const existingForMonth = dbData.inspections.filter(i => i.fy === targetFy && (i.month === selectedM || i.monthCode === mCode || i.month?.startsWith(mCode)));
        const nextSl = existingForMonth.length + 1;
        const newId = `NTPC-${mCode.toUpperCase()}-${Date.now().toString().slice(-4)}`;

        const newItem = {
            id: newId,
            slotNo: nextSl,
            category: cat,
            activityName: catName,
            fy: targetFy,
            month: selectedM,
            monthCode: mCode,
            frequency: freq,
            area: area,
            responsiblePerson: resp,
            status: status,
            date: date,
            completedDate: date,
            remarks: remarks,
            correctiveAction: action,
            targetDate: targetDate,
            closeDate: status === 'Completed' ? new Date().toISOString().split('T')[0] : '',
            photo: 'assets/power-plant-bg.svg'
        };

        await dataService.create('inspections', newItem);
        const modalEl = document.getElementById('inspectionModal');
        if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
        if (selectedM) {
            this.selectedMonth = selectedM;
        }

        Swal.fire({
            title: 'Record Saved!',
            text: `Inspection ${newId} logged into safety register successfully.`,
            icon: 'success',
            confirmButtonColor: '#0A2647'
        });
        this.app.renderCurrentModule();
    }

    async markComplete(id) {
        await dataService.update('inspections', id, { status: 'Completed', closeDate: new Date().toISOString().split('T')[0] });
        Swal.fire({ title: 'Status Updated', text: `Inspection ${id} marked as Completed.`, icon: 'success', timer: 1500, showConfirmButton: false });
        this.app.renderCurrentModule();
    }

    async deleteRecord(id) {
        const res = await Swal.fire({
            title: 'Delete Record?',
            text: `Are you sure you want to permanently remove inspection ${id}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#C62828',
            cancelButtonColor: '#0A2647',
            confirmButtonText: 'Yes, Delete'
        });

        if (res.isConfirmed) {
            await dataService.delete('inspections', id);
            this.app.renderCurrentModule();
        }
    }

    async viewDetails(id) {
        const item = await dataService.getById('inspections', id);
        if (!item) return;

        const catObj = INSPECTION_CATEGORIES.find(c => c.id === item.category) || { name: item.category, checklist: [] };
        
        Swal.fire({
            title: `<strong style="color:#0A2647;">Inspection Details: ${item.id}</strong>`,
            html: `
                <div style="text-align:left; font-size:13px;">
                    <div style="margin-bottom:10px; padding-bottom:10px; border-bottom:1px solid #E2E8F0;">
                        <strong>Category:</strong> ${catObj.name} <br>
                        <strong>Plant Area:</strong> ${item.area} | <strong>Month:</strong> ${item.month} (${item.fy}) <br>
                        <strong>Responsible Engineer:</strong> ${item.responsiblePerson} <br>
                        <strong>Status:</strong> <span style="font-weight:bold; color:${item.status === 'Completed' ? '#2E7D32' : '#C62828'}">${item.status}</span>
                    </div>
                    <div style="margin-bottom:10px;">
                        <strong>Inspection Observations / Findings:</strong><br>
                        <p style="background:#F8F9FA; padding:8px; border-radius:4px; margin:4px 0;">${item.remarks}</p>
                    </div>
                    <div style="margin-bottom:10px;">
                        <strong>Corrective Action Required:</strong><br>
                        <p style="background:#F8F9FA; padding:8px; border-radius:4px; margin:4px 0; color:#144272;">${item.correctiveAction}</p>
                    </div>
                    <div style="font-size:11.5px; color:#64748B;">
                        Date Recorded: ${item.date} | Target Closure: ${item.targetDate}
                    </div>
                </div>
            `,
            confirmButtonText: 'Close Details',
            confirmButtonColor: '#0A2647',
            width: 600
        });
    }
}
