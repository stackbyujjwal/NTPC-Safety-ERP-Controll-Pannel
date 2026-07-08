/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Unified Enterprise Data Service (Hybrid LocalStorage Engine + Live Firestore Ready)
 */

import { generateSeedData } from '../models/schema.js';
import { USE_LIVE_FIREBASE, db } from '../config/firebase-config.js';
import { authService } from './authService.js';

class DataService {
    constructor() {
        this.DB_KEY = "ntpc_safety_erp_database_v4";
        this.initDatabase();
    }

    initDatabase() {
        const existing = localStorage.getItem(this.DB_KEY);
        if (!existing) {
            const seed = generateSeedData();
            localStorage.setItem(this.DB_KEY, JSON.stringify(seed));
            console.log("[Enterprise ERP] Database initialized with NTPC realistic plant data.");
        }
    }

    getDatabase() {
        try {
            const raw = localStorage.getItem(this.DB_KEY);
            let data = raw ? JSON.parse(raw) : generateSeedData();
            let modified = false;
            if (data.schemaVersion !== 11) {
                data.schemaVersion = 11;
                data.users = [
                    { id: "USR-001", username: "admin", password: "@NTPC&ERP@admin", name: "System Administrator", role: "admin", department: "Safety & Fire Services", email: "admin@ntpc.co.in", active: true, approved: true }
                ];
                data.inspections = [];
                data.tbts = [];
                data.trainings = [];
                data.incidents = [];
                data.documents = [];
                data.notifications = [];
                data.logs = [];
                data.calendarItems = [];
                data.gallery = [];
                modified = true;
            }
            if (data.users && Array.isArray(data.users)) {
                const fakeNames = ["Mechanical Maintenance", "Electrical Maintenance", "Control & Instrumentation (C&I)", "Operations", "Coal Handling Plant (CHP)"];
                const oldLen = data.users.length;
                data.users = data.users.filter(u => u.username === 'admin' || !fakeNames.includes(u.department));
                if (data.users.length !== oldLen) modified = true;
                data.users.forEach(u => {
                    if (!u.password) {
                        u.password = u.role === 'admin' ? "@NTPC&ERP@admin" : "ntpc@2026";
                        modified = true;
                    }
                    if (u.username === 'admin') {
                        if (u.name !== "System Administrator" || u.password !== "@NTPC&ERP@admin") {
                            u.name = "System Administrator";
                            u.password = "@NTPC&ERP@admin";
                            modified = true;
                        }
                    }
                });
            }
            if (data.departments && Array.isArray(data.departments)) {
                const fakeNames = ["Mechanical Maintenance", "Electrical Maintenance", "Control & Instrumentation (C&I)", "Operations", "Coal Handling Plant (CHP)"];
                const oldLen = data.departments.length;
                data.departments = data.departments.filter(d => !fakeNames.includes(d.name) && d.id !== 'DEPT-02' && d.id !== 'DEPT-03' && d.id !== 'DEPT-04' && d.id !== 'DEPT-05' && d.id !== 'DEPT-06');
                if (data.departments.length === 0 || data.departments.length !== oldLen) {
                    data.departments = [{ id: "DEPT-01", name: "Safety & Fire Services", head: "System Administrator", headcount: 45 }];
                    modified = true;
                } else if (data.departments[0] && data.departments[0].id !== "DEPT-01") {
                    data.departments[0].id = "DEPT-01";
                    modified = true;
                }
            }
            if (modified) {
                localStorage.setItem(this.DB_KEY, JSON.stringify(data));
            }
            return data;
        } catch (e) {
            const seed = generateSeedData();
            localStorage.setItem(this.DB_KEY, JSON.stringify(seed));
            return seed;
        }
    }

    saveDatabase(data) {
        localStorage.setItem(this.DB_KEY, JSON.stringify(data));
        if (typeof USE_LIVE_FIREBASE !== 'undefined' && USE_LIVE_FIREBASE && typeof db !== 'undefined' && db) {
            const collections = ['inspections', 'tbts', 'trainings', 'incidents', 'calendarItems', 'gallery', 'documents', 'logs', 'users', 'departments'];
            collections.forEach(colName => {
                const items = data[colName] || [];
                items.forEach(item => {
                    if (item && item.id) {
                        db.collection(colName).doc(String(item.id)).set(item, { merge: true }).catch(() => {});
                    }
                });
            });
        }
    }

    // Generic CRUD Operations
    async getAll(collectionName, filters = {}) {
        const dbData = this.getDatabase();
        let items = dbData[collectionName] || [];

        // Apply Global Filters (Financial Year, Month, Area, Department)
        if (filters.fy) items = items.filter(i => i.fy === filters.fy);
        if (filters.month && filters.month !== 'all') items = items.filter(i => i.month === filters.month);
        if (filters.area && filters.area !== 'all') items = items.filter(i => i.area === filters.area);
        if (filters.department && filters.department !== 'all') items = items.filter(i => i.department === filters.department);
        if (filters.status && filters.status !== 'all') items = items.filter(i => i.status === filters.status);
        if (filters.category && filters.category !== 'all') items = items.filter(i => i.category === filters.category);

        return items;
    }

    async getById(collectionName, id) {
        const dbData = this.getDatabase();
        const items = dbData[collectionName] || [];
        return items.find(i => i.id === id) || null;
    }

    async create(collectionName, itemData) {
        const dbData = this.getDatabase();
        if (!dbData[collectionName]) dbData[collectionName] = [];
        
        dbData[collectionName].unshift(itemData);
        
        // Log Audit Action
        const currentUser = authService.getCurrentUser();
        const logEntry = {
            id: "LOG-" + Math.floor(Math.random() * 90000 + 10000),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: currentUser ? currentUser.username : "system",
            action: `CREATE_${collectionName.toUpperCase()}`,
            details: `Created entity ${itemData.id || itemData.name || 'New Item'}`
        };
        dbData.logs.unshift(logEntry);

        this.saveDatabase(dbData);
        return itemData;
    }

    async update(collectionName, id, updatedData) {
        const dbData = this.getDatabase();
        const items = dbData[collectionName] || [];
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updatedData };
            
            // Log Audit Action
            const currentUser = authService.getCurrentUser();
            dbData.logs.unshift({
                id: "LOG-" + Math.floor(Math.random() * 90000 + 10000),
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                user: currentUser ? currentUser.username : "system",
                action: `UPDATE_${collectionName.toUpperCase()}`,
                details: `Updated entity ${id}`
            });

            this.saveDatabase(dbData);
            return items[index];
        }
        return null;
    }

    async delete(collectionName, id) {
        const dbData = this.getDatabase();
        if (!dbData[collectionName]) return false;
        
        dbData[collectionName] = dbData[collectionName].filter(i => i.id !== id);
        
        // Log Audit Action
        const currentUser = authService.getCurrentUser();
        dbData.logs.unshift({
            id: "LOG-" + Math.floor(Math.random() * 90000 + 10000),
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: currentUser ? currentUser.username : "system",
            action: `DELETE_${collectionName.toUpperCase()}`,
            details: `Deleted entity ${id}`
        });

        this.saveDatabase(dbData);
        return true;
    }

    // Backup & Restore Utilities
    exportBackupJSON() {
        const dbData = this.getDatabase();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `NTPC_Safety_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    importRestoreJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed.inspections && parsed.tbts && parsed.trainings) {
                this.saveDatabase(parsed);
                return { success: true };
            } else {
                return { success: false, message: "Invalid backup file schema." };
            }
        } catch (e) {
            return { success: false, message: "Corrupted JSON format." };
        }
    }
}

export const dataService = new DataService();
