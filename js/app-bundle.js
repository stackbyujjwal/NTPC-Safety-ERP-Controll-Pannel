/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Enterprise Single Bundle (Eliminates file:// CORS errors on direct HTML double-click)
 */

(function () {
    "use strict";

    // ==========================================
    // 1. CONSTANTS & SYSTEM CONFIGURATION
    // ==========================================
    const getSmartDateMemory = (inputDate = new Date()) => {
        const d = typeof inputDate === 'string' ? new Date(inputDate) : (inputDate instanceof Date ? inputDate : new Date());
        if (isNaN(d.getTime())) return { fy: "2026-2027", month: "July", year: 2026 };
        const year = d.getFullYear();
        const mIdx = d.getMonth();
        const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const month = months[mIdx];
        const fy = mIdx >= 3 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
        return { fy, month, year };
    };
    window.getSmartDateMemory = getSmartDateMemory;

    const _currentMem = getSmartDateMemory();

    const APP_CONFIG = {
        APP_NAME: "NTPC Safety Portal",
        FULL_NAME: "NTPC Safety & Fire Services Management System",
        VERSION: "v4.8.0",
        DEVELOPER: "Safety Systems Group",
        COMPANY: "NTPC Limited",
        YEAR: _currentMem.year,
        DEFAULT_FY: _currentMem.fy,
        DEFAULT_MONTH: _currentMem.month
    };

    // ==========================================
    // 1A. FIREBASE LIVE CLOUD SYNC CONFIGURATION
    // ==========================================

    const USE_LIVE_FIREBASE = true; // <-- SET TO true WHEN FIREBASE CONFIG IS ADDED
    window.USE_LIVE_FIREBASE = USE_LIVE_FIREBASE;

    const firebaseConfig = {
        apiKey: "AIzaSyBCzAeMt9xE9bzPDZEJPteBLq9_2UkZgG0",
        authDomain: "ntpc-safety-erp.firebaseapp.com",
        projectId: "ntpc-safety-erp",
        storageBucket: "ntpc-safety-erp.firebasestorage.app",
        messagingSenderId: "692804039913",
        appId: "1:692804039913:web:c186b8fd2652e47a886c78",
        measurementId: "G-75ZCF56Q4L"
    };

    let fbApp = null;
    let fbDb = null;
    let fbAuth = null;
    let fbStorage = null;

    const initFirebaseConnection = () => {
        if (!USE_LIVE_FIREBASE) return false;
        if (fbDb && window.fbDb) return true;
        if (typeof firebase === 'undefined') {
            console.warn("[NTPC ERP] Firebase SDK not ready yet. Retrying shortly...");
            return false;
        }
        try {
            if (!firebase.apps || !firebase.apps.length) {
                fbApp = firebase.initializeApp(firebaseConfig);
            } else {
                fbApp = firebase.app();
            }
            fbDb = firebase.firestore();
            fbAuth = firebase.auth();
            fbStorage = firebase.storage();
            try {
                fbDb.enablePersistence({ synchronizeTabs: true }).catch(() => { });
            } catch (err) { }
            console.log("[NTPC ERP] Connected to Live Firebase Cloud Firestore!");
            window.fbDb = fbDb;
            window.fbStorage = fbStorage;
            window.storage = fbStorage;
            return true;
        } catch (e) {
            console.error("[NTPC ERP] Firebase initialization failed:", e);
            return false;
        }
    };
    initFirebaseConnection();
    window.initFirebaseConnection = initFirebaseConnection;
    const storage = fbStorage;
    const db = fbDb;
    window.fbDb = fbDb;
    window.fbStorage = fbStorage;
    window.storage = fbStorage;

    const THEME_COLORS = {
        PRIMARY: "#0A2647",
        SECONDARY: "#144272",
        ACCENT: "#2C74B3",
        SUCCESS: "#2E7D32",
        WARNING: "#F9A825",
        DANGER: "#C62828",
        BACKGROUND: "#F5F7FA",
        SIDEBAR: "#081B33",
        CARDS: "#FFFFFF",
        TABLES: "#F8F9FA",
        BUTTONS: "#2C74B3"
    };

    const FINANCIAL_YEARS = [
        "2024-2025",
        "2025-2026",
        "2026-2027",
        "2027-2028",
        "2028-2029",
        "2029-2030",
        "2030-2031",
        "2031-2032",
        "2032-2033",
        "2033-2034",
        "2034-2035",
        "2035-2036",
        "2036-2037",
        "2037-2038",
        "2038-2039",
        "2039-2040",
        "2040-2041",
        "2041-2042",
        "2042-2043",
        "2043-2044",
        "2044-2045",
        "2045-2046",
        "2046-2047",
        "2047-2048",
        "2048-2049",
        "2049-2050"
    ];

    const MONTHS = [
        { name: "April", order: 1, quarter: "Q1" },
        { name: "May", order: 2, quarter: "Q1" },
        { name: "June", order: 3, quarter: "Q1" },
        { name: "July", order: 4, quarter: "Q2" },
        { name: "August", order: 5, quarter: "Q2" },
        { name: "September", order: 6, quarter: "Q2" },
        { name: "October", order: 7, quarter: "Q3" },
        { name: "November", order: 8, quarter: "Q3" },
        { name: "December", order: 9, quarter: "Q3" },
        { name: "January", order: 10, quarter: "Q4" },
        { name: "February", order: 11, quarter: "Q4" },
        { name: "March", order: 12, quarter: "Q4" }
    ];

    const PLANT_AREAS = [
        { id: "main_plant", name: "Main Plant", code: "MP" },
        { id: "chp", name: "CHP (Coal Handling Plant)", code: "CHP" },
        { id: "switchyard", name: "Switchyard & Electrical", code: "SWY" }
    ];

    const DEPARTMENTS = [
        "Mechanical Maintenance",
        "Electrical Maintenance",
        "Control & Instrumentation (C&I)",
        "Operations",
        "Coal Handling Plant (CHP)",
        "Ash Handling Plant (AHP)",
        "Civil Engineering",
        "Safety & Fire Services",
        "Chemical & Lab",
        "IT & ERP Systems"
    ];

    const INSPECTION_CATEGORIES = [
        {
            id: "hand_tool",
            name: "Hand Tool Inspection",
            frequency: "Monthly",
            areas: ["Main Plant", "CHP", "Switchyard"]
        },
        {
            id: "power_tool",
            name: "Power Tool Inspection",
            frequency: "Monthly",
            areas: ["Main Plant", "CHP", "Switchyard"]
        },
        {
            id: "extension_board",
            name: "Extension Board Inspection",
            frequency: "Monthly",
            areas: ["Main Plant", "CHP", "Switchyard"]
        },
        {
            id: "ladder",
            name: "Ladder Inspection",
            frequency: "Monthly",
            areas: ["Main Plant", "CHP", "Switchyard"]
        },
        {
            id: "rccb_plant",
            name: "RCCB Inspection - Plant Area",
            frequency: "Monthly",
            areas: ["Main Plant", "CHP", "Switchyard"]
        },
        {
            id: "rccb_contractor",
            name: "RCCB Inspection - Contractor Area",
            frequency: "Monthly",
            areas: ["Main Plant", "CHP", "Switchyard"]
        },
        {
            id: "ppe",
            name: "PPE Compliance Inspection",
            frequency: "Quarterly",
            areas: ["Main Plant", "CHP", "Switchyard"]
        },
        {
            id: "welding_machine",
            name: "Welding Machine Inspection",
            frequency: "Quarterly",
            areas: ["Main Plant", "CHP", "Switchyard"]
        }
    ];

    // ==========================================
    // 2. DATABASE SCHEMA & SEED DATA
    // ==========================================
    const generateSeedData = () => {
        return {
            schemaVersion: 11,
            users: [
                { id: "USR-001", username: "admin", password: "@NTPC&ERP@admin", name: "System Administrator", role: "admin", department: "Safety & Fire Services", email: "admin@ntpc.co.in", active: true, approved: true }
            ],
            departments: [
                { id: "DEPT-01", name: "Safety & Fire Services", head: "System Administrator", headcount: 45 }
            ],
            inspections: [],
            tbts: [],
            trainings: [],
            incidents: [],
            documents: [],
            notifications: [],
            logs: [],
            calendarItems: [],
            gallery: []
        };
    };

    // ==========================================
    // 3. AUTHENTICATION SERVICE
    // ==========================================
    class AuthService {
        constructor() {
            this.SESSION_KEY = "ntpc_erp_session_user";
            this.currentUser = this.loadSession();
        }
        loadSession() {
            try {
                // Clear any persistent localStorage session to prevent automatic login security glitch
                localStorage.removeItem(this.SESSION_KEY);
                const saved = sessionStorage.getItem(this.SESSION_KEY);
                if (!saved) return null;
                const user = JSON.parse(saved);
                if (user && user.username === 'admin' && (user.name !== 'System Administrator' || user.name.toLowerCase().includes('rajeshwar'))) {
                    user.name = 'System Administrator';
                }
                return user;
            } catch (e) {
                return null;
            }
        }
        saveSession(user) {
            this.currentUser = user;
            try {
                localStorage.removeItem(this.SESSION_KEY);
                sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
            } catch (e) { }
        }
        login(username, password) {
            let users = [];
            try {
                const dbRaw = localStorage.getItem("ntpc_safety_erp_database_v4");
                if (dbRaw) {
                    const parsed = JSON.parse(dbRaw);
                    if (parsed && parsed.users) users = parsed.users;
                }
            } catch (e) { }

            if (users.length === 0 || !users.some(u => u.username.toLowerCase() === 'admin')) {
                const adminUser = { id: "USR-001", username: "admin", password: "@NTPC&ERP@admin", name: "System Administrator", role: "admin", department: "Safety & Fire Services", email: "admin@ntpc.co.in", active: true, approved: true };
                users.unshift(adminUser);
                try {
                    const dbRaw = localStorage.getItem("ntpc_safety_erp_database_v4");
                    const parsed = dbRaw ? JSON.parse(dbRaw) : {};
                    parsed.users = users;
                    localStorage.setItem("ntpc_safety_erp_database_v4", JSON.stringify(parsed));
                } catch (e) { }
            }

            // Master Recovery: If login is admin / @NTPC&ERP@admin, always guarantee admin access
            if (username.toLowerCase() === 'admin' && password === '@NTPC&ERP@admin') {
                let adminObj = users.find(u => u.username.toLowerCase() === 'admin');
                if (!adminObj) {
                    adminObj = { id: "USR-001", username: "admin", password: "@NTPC&ERP@admin", name: "System Administrator", role: "admin", department: "Safety & Fire Services", email: "admin@ntpc.co.in", active: true, approved: true, failedLoginAttempts: 0, lockoutUntil: null };
                    users.unshift(adminObj);
                } else {
                    adminObj.password = "@NTPC&ERP@admin";
                    adminObj.active = true;
                    adminObj.approved = true;
                    adminObj.failedLoginAttempts = 0;
                    adminObj.lockoutUntil = null;
                }
                try {
                    const dbRaw = localStorage.getItem("ntpc_safety_erp_database_v4");
                    const parsed = dbRaw ? JSON.parse(dbRaw) : {};
                    parsed.users = users;
                    localStorage.setItem("ntpc_safety_erp_database_v4", JSON.stringify(parsed));
                    let l1 = JSON.parse(localStorage.getItem("ntpc_login_lockouts") || "{}");
                    let l2 = JSON.parse(localStorage.getItem("ntpc_unknown_login_attempts") || "{}");
                    delete l1['admin']; delete l2['admin'];
                    localStorage.setItem("ntpc_login_lockouts", JSON.stringify(l1));
                    localStorage.setItem("ntpc_unknown_login_attempts", JSON.stringify(l2));
                } catch (e) { }
                const sessionUser = { ...adminObj, loginTime: new Date().toISOString() };
                this.saveSession(sessionUser);
                return { success: true, user: sessionUser };
            }

            const usrKey = username.toLowerCase().trim();
            const targetUser = users.find(u => u.username.toLowerCase() === usrKey || (u.email && u.email.toLowerCase() === usrKey));

            if (!targetUser) {
                return {
                    success: false,
                    message: `❌ Username '${username}' does not exist.`
                };
            }

            const actualKey = targetUser.username.toLowerCase();
            let lockouts = {};
            try { lockouts = JSON.parse(localStorage.getItem("ntpc_login_lockouts") || "{}"); } catch (e) { }
            let unknownAttempts = {};
            try { unknownAttempts = JSON.parse(localStorage.getItem("ntpc_unknown_login_attempts") || "{}"); } catch (e) { }

            const curLock = lockouts[actualKey] || lockouts[usrKey] || unknownAttempts[actualKey] || unknownAttempts[usrKey] || { count: 0, lockUntil: null };

            const saveUsersDb = () => {
                try {
                    const dbRaw = localStorage.getItem("ntpc_safety_erp_database_v4");
                    const parsed = dbRaw ? JSON.parse(dbRaw) : {};
                    parsed.users = users;
                    localStorage.setItem("ntpc_safety_erp_database_v4", JSON.stringify(parsed));
                    if (typeof dataService !== 'undefined' && typeof dataService.saveDatabase === 'function') {
                        dataService.saveDatabase(parsed);
                    }
                } catch (e) { }
            };

            const saveLockout = (count, lockTime) => {
                curLock.count = count;
                curLock.lockUntil = lockTime;
                lockouts[actualKey] = curLock;
                if (usrKey !== actualKey) lockouts[usrKey] = curLock;
                try { localStorage.setItem("ntpc_login_lockouts", JSON.stringify(lockouts)); } catch (e) { }
                try { localStorage.setItem("ntpc_unknown_login_attempts", JSON.stringify(lockouts)); } catch (e) { }
            };

            const userLockUntil = targetUser.lockoutUntil || null;
            const localLockUntil = curLock.lockUntil || null;
            let effectiveLockUntil = null;
            if (userLockUntil && new Date(userLockUntil) > new Date()) effectiveLockUntil = userLockUntil;
            if (localLockUntil && new Date(localLockUntil) > new Date()) {
                if (!effectiveLockUntil || new Date(localLockUntil) > new Date(effectiveLockUntil)) {
                    effectiveLockUntil = localLockUntil;
                }
            }

            if (effectiveLockUntil) {
                const diffMs = new Date(effectiveLockUntil) - new Date();
                const diffMins = Math.ceil(diffMs / (1000 * 60));
                const diffHrs = Math.floor(diffMins / 60);
                const remMins = diffMins % 60;
                const timeStr = diffHrs > 0 ? `${diffHrs} hr ${remMins} min` : `${diffMins} min`;
                return {
                    success: false,
                    message: `🔒 Account blocked for ${timeStr} (5 failed attempts).`
                };
            }

            if (targetUser.password === password) {
                if (targetUser.active === false) {
                    return { success: false, message: "🚫 Account disabled by Admin." };
                }
                if (targetUser.role !== 'admin' && (targetUser.approved === false || targetUser.status === 'Pending')) {
                    return { success: false, message: "⏳ Account pending Admin approval." };
                }
                targetUser.failedLoginAttempts = 0;
                targetUser.lockoutUntil = null;
                saveUsersDb();
                saveLockout(0, null);

                const sessionUser = { ...targetUser, loginTime: new Date().toISOString() };
                this.saveSession(sessionUser);
                return { success: true, user: sessionUser };
            } else {
                const newCount = Math.max((targetUser.failedLoginAttempts || 0), curLock.count) + 1;
                targetUser.failedLoginAttempts = newCount;
                if (newCount >= 5) {
                    const lockTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
                    targetUser.lockoutUntil = lockTime;
                    saveUsersDb();
                    saveLockout(newCount, lockTime);
                    return {
                        success: false,
                        message: `🔒 Account blocked for 2 hrs (5 failed attempts).`
                    };
                } else {
                    const remaining = 5 - newCount;
                    saveUsersDb();
                    saveLockout(newCount, null);
                    return {
                        success: false,
                        message: `❌ Incorrect password. ${remaining} attempt(s) left.`
                    };
                }
            }
        }
        logout() {
            this.currentUser = null;
            try {
                localStorage.removeItem(this.SESSION_KEY);
                sessionStorage.removeItem(this.SESSION_KEY);
            } catch (e) { }
        }
        isAuthenticated() { return this.currentUser !== null; }
        getCurrentUser() { return this.currentUser; }
    }
    const authService = new AuthService();

    // ==========================================
    // 4. DATA & EXPORT SERVICES
    // ==========================================
    class DataService {
        constructor() {
            this.DB_KEY = "ntpc_safety_erp_database_v4";
            this.initDatabase();
            this._lastKnownSnapshot = JSON.parse(JSON.stringify(this.getDatabase()));
            this.initLiveSync();
        }
        initDatabase() {
            if (!localStorage.getItem(this.DB_KEY)) {
                localStorage.setItem(this.DB_KEY, JSON.stringify(generateSeedData()));
            }
        }
        initLiveSync() {
            if (!USE_LIVE_FIREBASE) return;
            if (!fbDb && typeof window.initFirebaseConnection === 'function') {
                window.initFirebaseConnection();
            }
            if (!fbDb) {
                console.log("[DataService] Firebase not ready yet. Retrying in 1.5s...");
                setTimeout(() => this.initLiveSync(), 1500);
                return;
            }
            console.log("[DataService] Initializing Live Firestore Category-Wise Real-Time Sync...");
            const collections = [
                'inspections', 'tbts', 'trainings', 'incidents',
                'calendarItems', 'gallery', 'documents', 'logs',
                'users', 'departments'
            ];

            this._isRemoteSyncing = false;
            this.unsubscribers = {};

            // Automatically clean up fake departments and fake users from Firestore!
            try {
                const fakeNames = ["Mechanical Maintenance", "Electrical Maintenance", "Control & Instrumentation (C&I)", "Operations", "Coal Handling Plant (CHP)"];
                fbDb.collection('departments').get().then(snap => {
                    snap.forEach(doc => {
                        const d = doc.data();
                        if ((d && fakeNames.includes(d.name)) || ['DEPT-02', 'DEPT-03', 'DEPT-04', 'DEPT-05', 'DEPT-06'].includes(doc.id)) {
                            doc.ref.delete();
                            console.log(`[LiveSync] Cleaned up fake department ${doc.id} from Firestore.`);
                        }
                    });
                });
                fbDb.collection('departments').doc('DEPT-01').set({ id: "DEPT-01", name: "Safety & Fire Services", head: "System Administrator", headcount: 45 });
                fbDb.collection('users').get().then(snap => {
                    snap.forEach(doc => {
                        const u = doc.data();
                        if (u && u.username !== 'admin' && fakeNames.includes(u.department)) {
                            doc.ref.delete();
                            console.log(`[LiveSync] Cleaned up fake user ${u.username} from Firestore.`);
                        }
                    });
                });
            } catch (e) { }

            // Explicit Direct Seeding & Permission Check
            collections.forEach(async (colName) => {
                try {
                    const dbData = this.getDatabase();
                    if (dbData[colName] && dbData[colName].length > 0) {
                        const snap = await fbDb.collection(colName).limit(1).get();
                        if (snap.empty) {
                            console.log(`[LiveSync] Explicit seeding for empty collection: ${colName} (${dbData[colName].length} items)...`);
                            const batch = fbDb.batch();
                            let count = 0;
                            for (const item of dbData[colName]) {
                                if (item && item.id) {
                                    batch.set(fbDb.collection(colName).doc(String(item.id)), item);
                                    count++;
                                    if (count >= 450) break;
                                }
                            }
                            if (count > 0) {
                                await batch.commit();
                                console.log(`[LiveSync] Successfully seeded ${count} records to ${colName}!`);
                            }
                        }
                    }
                } catch (err) {
                    console.error(`[LiveSync] Explicit seed error on ${colName}:`, err);
                    if (err.code === 'permission-denied' || (err.message && err.message.toLowerCase().includes('permission'))) {
                        if (!window._notifiedFbRules) {
                            window._notifiedFbRules = true;
                            if (typeof Swal !== 'undefined') {
                                Swal.fire({
                                    icon: 'warning',
                                    title: 'Firebase Database Rules Blocked!',
                                    html: `<div class="text-start" style="font-size: 13.5px;">
                                        <p>Your Firebase Cloud Firestore is blocking read/write access because of Security Rules.</p>
                                        <p><b>How to fix in 10 seconds:</b></p>
                                        <ol>
                                            <li>Go to your <b>Firebase Console</b> &rarr; <b>Firestore Database</b> &rarr; <b>Rules</b> tab.</li>
                                            <li>Change <code>allow read, write: if false;</code> to:<br><code style="background:#e8f5e9;color:#2e7d32;padding:2px 6px;border-radius:4px;font-weight:bold;">allow read, write: if true;</code></li>
                                            <li>Click <b>Publish</b> and refresh this page!</li>
                                        </ol>
                                    </div>`,
                                    confirmButtonText: 'I understand, let me fix Rules'
                                });
                            }
                        }
                    }
                }
            });

            collections.forEach(colName => {
                try {
                    this.unsubscribers[colName] = fbDb.collection(colName).onSnapshot(async (snapshot) => {
                        const remoteItems = [];
                        snapshot.forEach(doc => {
                            remoteItems.push({ id: doc.id, ...doc.data() });
                        });

                        const dbData = this.getDatabase();
                        if (remoteItems.length > 0) {
                            // We received live remote updates from Firestore!
                            const localStr = JSON.stringify(dbData[colName] || []);
                            const remoteStr = JSON.stringify(remoteItems);
                            if (localStr !== remoteStr) {
                                console.log(`[LiveSync] Live update received for category: ${colName} (${remoteItems.length} records)`);
                                dbData[colName] = remoteItems;

                                // Save directly to localStorage without triggering outbound diff sync
                                this._isRemoteSyncing = true;
                                localStorage.setItem(this.DB_KEY, JSON.stringify(dbData));
                                this._lastKnownSnapshot = JSON.parse(JSON.stringify(dbData));
                                this._isRemoteSyncing = false;

                                // Live refresh UI cleanly
                                if (window.app && typeof window.app.renderCurrentModule === 'function' && (typeof Swal === 'undefined' || !Swal.isVisible()) && !document.querySelector('.modal.show')) {
                                    window.app.renderCurrentModule();
                                }
                            }
                        }
                    }, err => {
                        console.error(`[LiveSync] Snapshot listener error on ${colName}:`, err);
                        if (err.code === 'permission-denied' || (err.message && err.message.toLowerCase().includes('permission'))) {
                            if (!window._notifiedFbRules) {
                                window._notifiedFbRules = true;
                                if (typeof Swal !== 'undefined') {
                                    Swal.fire({
                                        icon: 'warning',
                                        title: 'Firebase Database Rules Blocked!',
                                        html: `<div class="text-start" style="font-size: 13.5px;">
                                            <p>Your Firebase Cloud Firestore is blocking read/write access because of Security Rules.</p>
                                            <p><b>How to fix in 10 seconds:</b></p>
                                            <ol>
                                                <li>Go to your <b>Firebase Console</b> &rarr; <b>Firestore Database</b> &rarr; <b>Rules</b> tab.</li>
                                                <li>Change <code>allow read, write: if false;</code> to:<br><code style="background:#e8f5e9;color:#2e7d32;padding:2px 6px;border-radius:4px;font-weight:bold;">allow read, write: if true;</code></li>
                                                <li>Click <b>Publish</b> and refresh this page!</li>
                                            </ol>
                                        </div>`,
                                        confirmButtonText: 'I understand, let me fix Rules'
                                    });
                                }
                            }
                        }
                    });
                } catch (e) {
                    console.error(`[LiveSync] Setup failed for ${colName}:`, e);
                }
            });

            // Also sync custom tables settings if present
            try {
                fbDb.collection('settings').doc('customTables').onSnapshot(doc => {
                    if (doc.exists && doc.data()) {
                        const dbData = this.getDatabase();
                        dbData.customTables = doc.data().tables || {};
                        this._isRemoteSyncing = true;
                        localStorage.setItem(this.DB_KEY, JSON.stringify(dbData));
                        this._lastKnownSnapshot = JSON.parse(JSON.stringify(dbData));
                        this._isRemoteSyncing = false;
                    }
                });
            } catch (e) { }
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
                if (!data._serialNormalizedV11) {
                    const normalizeList = (list, moduleCode, startSeq = 101) => {
                        if (!list || !Array.isArray(list)) return;
                        let count = startSeq;
                        list.forEach((item) => {
                            if (!item) return;
                            const dtStr = item.date || item.completedDate || item.plannedDate || item.dateRange || item.timestamp || new Date().toISOString().split('T')[0];
                            const dtClean = dtStr.replace(/[^0-9]/g, '').slice(0, 8) || new Date().toISOString().split('T')[0].replace(/[^0-9]/g, '');
                            if (moduleCode === 'LOG') {
                                item.id = `LOG-${dtClean}-${count}`;
                            } else if (moduleCode === 'USR' || moduleCode === 'DEPT' || moduleCode === 'EMP') {
                                item.id = `${moduleCode}-${count}`;
                            } else {
                                item.id = `NTPC-${moduleCode}-${dtClean}-${count}`;
                            }
                            count++;
                        });
                    };
                    normalizeList(data.inspections, 'INSP', 101);
                    normalizeList(data.tbts, 'TBT', 101);
                    normalizeList(data.trainings, 'TRG', 101);
                    normalizeList(data.incidents, 'INC', 101);
                    normalizeList(data.calendarItems, 'CAL', 101);
                    normalizeList(data.gallery, 'GAL', 101);
                    normalizeList(data.documents, 'DOC', 101);
                    normalizeList(data.logs, 'LOG', 10001);
                    data._serialNormalizedV11 = true;
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

            // If we are currently processing an inbound sync from Firestore, don't echo back!
            if (this._isRemoteSyncing || !USE_LIVE_FIREBASE || !fbDb) {
                this._lastKnownSnapshot = JSON.parse(JSON.stringify(data));
                return;
            }

            const collections = [
                'inspections', 'tbts', 'trainings', 'incidents',
                'calendarItems', 'gallery', 'documents', 'logs',
                'users', 'departments'
            ];

            const oldSnapshot = this._lastKnownSnapshot || {};

            collections.forEach(colName => {
                const newItems = data[colName] || [];
                const oldItems = oldSnapshot[colName] || [];

                const oldMap = new Map();
                oldItems.forEach(item => { if (item && item.id) oldMap.set(String(item.id), JSON.stringify(item)); });

                const newMap = new Map();
                newItems.forEach(item => { if (item && item.id) newMap.set(String(item.id), JSON.stringify(item)); });

                // 1. Detect Added or Modified Items
                newItems.forEach(item => {
                    if (!item || !item.id) return;
                    const idStr = String(item.id);
                    const newStr = newMap.get(idStr);
                    const oldStr = oldMap.get(idStr);
                    if (newStr !== oldStr) {
                        fbDb.collection(colName).doc(idStr).set(item, { merge: true }).catch(err => {
                            console.error(`[LiveSync] Error saving ${colName}/${idStr} to Firestore:`, err);
                        });
                    }
                });

                // 2. Detect Deleted Items
                oldItems.forEach(item => {
                    if (!item || !item.id) return;
                    const idStr = String(item.id);
                    if (!newMap.has(idStr)) {
                        fbDb.collection(colName).doc(idStr).delete().catch(err => {
                            console.error(`[LiveSync] Error deleting ${colName}/${idStr} from Firestore:`, err);
                        });
                    }
                });
            });

            // Sync customTables if changed
            if (JSON.stringify(data.customTables || {}) !== JSON.stringify(oldSnapshot.customTables || {})) {
                fbDb.collection('settings').doc('customTables').set({ tables: data.customTables || {} }, { merge: true }).catch(() => { });
            }

            this._lastKnownSnapshot = JSON.parse(JSON.stringify(data));
        }

        getNextSerialId(collectionName, moduleCode, itemObj = {}) {
            const dbData = this.getDatabase();
            const items = dbData[collectionName] || [];
            const dtStr = itemObj.date || itemObj.completedDate || itemObj.plannedDate || itemObj.dateRange || itemObj.timestamp || new Date().toISOString().split('T')[0];
            const dtClean = dtStr.replace(/[^0-9]/g, '').slice(0, 8) || new Date().toISOString().split('T')[0].replace(/[^0-9]/g, '');

            let maxNum = moduleCode === 'LOG' ? 10000 : 100;
            items.forEach(item => {
                if (item && item.id) {
                    const parts = item.id.split('-');
                    const lastPart = parts[parts.length - 1];
                    const num = parseInt(lastPart, 10);
                    if (!isNaN(num) && num > maxNum) maxNum = num;
                }
            });

            if (moduleCode === 'LOG') {
                return `LOG-${dtClean}-${maxNum + 1}`;
            } else if (moduleCode === 'USR' || moduleCode === 'DEPT' || moduleCode === 'EMP') {
                return `${moduleCode}-${maxNum + 1}`;
            } else {
                return `NTPC-${moduleCode}-${dtClean}-${maxNum + 1}`;
            }
        }

        async getAll(collectionName, filters = {}) {
            const dbData = this.getDatabase();
            let items = dbData[collectionName] || [];
            if (filters.fy) items = items.filter(i => i.fy === filters.fy);
            if (filters.month && filters.month !== 'all') items = items.filter(i => i.month === filters.month);
            if (filters.area && filters.area !== 'all') items = items.filter(i => i.area === filters.area);
            return items;
        }
        async getById(collectionName, id) {
            const items = (this.getDatabase()[collectionName]) || [];
            return items.find(i => i.id === id) || null;
        }
        async create(collectionName, itemData) {
            const dbData = this.getDatabase();
            if (!dbData[collectionName]) dbData[collectionName] = [];
            dbData[collectionName].unshift(itemData);

            const currentUser = authService.getCurrentUser();
            dbData.logs.unshift({
                id: this.getNextSerialId('logs', 'LOG'),
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                user: currentUser ? currentUser.username : "system",
                action: `CREATE_${collectionName.toUpperCase()}`,
                details: `Created record ${itemData.id || 'New Item'}`
            });
            this.saveDatabase(dbData);
            return itemData;
        }
        async update(collectionName, id, updatedData) {
            const dbData = this.getDatabase();
            const items = dbData[collectionName] || [];
            const index = items.findIndex(i => i.id === id);
            if (index !== -1) {
                items[index] = { ...items[index], ...updatedData };
                this.saveDatabase(dbData);
                return items[index];
            }
            return null;
        }
        async delete(collectionName, id) {
            const dbData = this.getDatabase();
            if (!dbData[collectionName]) return false;
            dbData[collectionName] = dbData[collectionName].filter(i => i.id !== id);
            this.saveDatabase(dbData);
            return true;
        }
        exportBackupJSON() {
            const dbData = this.getDatabase();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbData, null, 2));
            const a = document.createElement('a');
            a.setAttribute("href", dataStr);
            a.setAttribute("download", `NTPC_Safety_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(a);
            a.click();
            a.remove();
        }
        importRestoreJSON(jsonString) {
            try {
                const parsed = JSON.parse(jsonString);
                if (parsed.inspections && parsed.tbts) {
                    this.saveDatabase(parsed);
                    return { success: true };
                }
            } catch (e) { }
            return { success: false, message: "Corrupted backup file format." };
        }
    }
    const dataService = new DataService();

    class ExportService {
        exportToCSV(headers, rows, filename) {
            let csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\r\n";
            rows.forEach(r => {
                csv += r.map(v => `"${String(v != null ? v : "").replace(/"/g, '""')}"`).join(",") + "\r\n";
            });
            const link = document.createElement("a");
            link.setAttribute("href", encodeURI(csv));
            link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
        printPrintableView(title, contentHTML) {
            const win = window.open('', '_blank', 'width=1000,height=800');
            win.document.write(`
                <html><head><title>${title} - NTPC Safety Portal</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 30px; color: #1E293B; }
                    .print-header { text-align: center; border-bottom: 3px solid #0A2647; padding-bottom: 15px; margin-bottom: 25px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
                    th, td { border: 1px solid #CBD5E1; padding: 8px 10px; text-align: left; }
                    th { background-color: #F8F9FA; color: #0A2647; text-transform: uppercase; }
                </style></head>
                <body>
                    <div class="print-header"><h1>NTPC Limited - Safety & Fire Services Management System</h1><h3>${title}</h3></div>
                    ${contentHTML}
                </body></html>
            `);
            win.document.close();
            win.focus();
            setTimeout(() => win.print(), 300);
        }
    }
    const exportService = new ExportService();

    // ==========================================
    // 5. CHARTS & MODALS COMPONENTS
    // ==========================================
    const ChartComponent = {
        instances: {},
        destroy(id) { if (this.instances[id]) { this.instances[id].destroy(); delete this.instances[id]; } },
        renderMonthlyProgress(id, dataLabels, dataCompleted, dataPending) {
            this.destroy(id);
            const ctx = document.getElementById(id);
            if (!ctx || typeof Chart === 'undefined') return;
            this.instances[id] = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: dataLabels || ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
                    datasets: [
                        { label: 'Completed Inspections', data: dataCompleted || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#2E7D32', borderRadius: 4 },
                        { label: 'Pending Action', data: dataPending || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], backgroundColor: '#F9A825', borderRadius: 4 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
            });
        },
        renderAreaWiseChart(id, mainPlantVal, chpVal, switchyardVal) {
            this.destroy(id);
            const ctx = document.getElementById(id);
            if (!ctx || typeof Chart === 'undefined') return;
            this.instances[id] = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Main Plant', 'CHP', 'Switchyard'],
                    datasets: [{ data: [mainPlantVal ?? 0, chpVal ?? 0, switchyardVal ?? 0], backgroundColor: ['#0A2647', '#2C74B3', '#144272'], borderWidth: 2 }]
                },
                options: { responsive: true, maintainAspectRatio: false, cutout: '68%' }
            });
        }
    };

    const ModalComponent = {
        getInspectionFormHTML(fy, month) {
            return `
                <div class="modal fade" id="inspectionModal" tabindex="-1">
                    <div class="modal-dialog modal-lg modal-dialog-centered">
                        <div class="modal-content erp-card border-0">
                            <div class="modal-header erp-card-header bg-primary text-white">
                                <h5 class="modal-title m-0 text-white"><i class="fas fa-plus-circle me-2"></i>Create New Safety Inspection</h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body p-4">
                                <form id="inspectionCreateForm">
                                    <div class="row g-3">
                                        <div class="col-md-3">
                                            <label class="form-label fw-bold">Sl / Record ID</label>
                                            <input type="text" class="form-control font-mono" id="insId" placeholder="Auto / Custom Sl">
                                        </div>
                                        <div class="col-md-5">
                                            <label class="form-label fw-bold">Activity / Inspection Type <span class="text-danger">*</span></label>
                                            <select class="form-select" id="insCategory" required onchange="const opt = this.options[this.selectedIndex]; if(opt && opt.dataset.freq) { const fe = document.getElementById('insFrequency'); if(fe) fe.value = opt.dataset.freq; }">
                                                ${INSPECTION_CATEGORIES.map(c => `<option value="${c.id}" data-freq="${c.frequency || 'Monthly'}">${c.name}</option>`).join('')}
                                            </select>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">Frequency <span class="text-danger">*</span></label>
                                            <select class="form-select" id="insFrequency">
                                                <option value="Monthly">Monthly</option>
                                                <option value="Quarterly">Quarterly</option>
                                                <option value="Weekly">Weekly</option>
                                                <option value="Yearly">Yearly</option>
                                            </select>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">Plant Area <span class="text-danger">*</span></label>
                                            <input type="text" class="form-control" id="insArea" value="Main Plant" required>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">Financial Year</label>
                                            <input type="text" class="form-control bg-light text-primary fw-bold" id="insFy" value="${fy || getSmartDateMemory().fy}" readonly>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">Inspection Month <span class="text-danger">*</span></label>
                                            <select class="form-select fw-bold text-success" id="insMonth">
                                                ${['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'].map(m => `<option value="${m}" ${m === month || m.startsWith(month) || month?.startsWith(m.substring(0, 3)) ? 'selected' : ''}>${m}</option>`).join('')}
                                            </select>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">Planned Date</label>
                                            <input type="date" class="form-control" id="insPlannedDate">
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label fw-bold">Completed Date</label>
                                            <input type="date" class="form-control" id="insDate" value="${new Date().toISOString().split('T')[0]}" onchange="if(window.app) window.app.syncDateMemory(this, 'insMonth', 'insFy')">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold">Responsible Engineer</label>
                                            <input type="text" class="form-control" id="insResponsible" placeholder="e.g. S. K. Verma">
                                        </div>
                                        <div class="col-md-6">
                                            <label class="form-label fw-bold">Status <span class="text-danger">*</span></label>
                                            <select class="form-select" id="insStatus">
                                                <option value="Pending">Pending</option>
                                                <option value="Completed">Completed</option>
                                                <option value="Overdue">Overdue</option>
                                            </select>
                                        </div>
                                        <div class="col-12">
                                            <label class="form-label fw-bold">Remarks / Observations</label>
                                            <textarea class="form-control" id="insRemarks" rows="2" placeholder="Enter remarks or inspection notes..."></textarea>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div class="modal-footer bg-light">
                                <button type="button" class="btn btn-erp-outline" data-bs-dismiss="modal">Cancel</button>
                                <button type="button" class="btn btn-erp-primary" onclick="window.app.controllers.inspections.saveInspection()">
                                    <i class="fas fa-save me-1"></i> Submit Record
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    };

    // ==========================================
    // 6. MODULE CONTROLLERS
    // ==========================================
    class DashboardController {
        constructor(app) { this.app = app; }
        async render() {
            const inspections = await dataService.getAll('inspections', { fy: this.app.state.fy });
            const tbts = await dataService.getAll('tbts');
            const completedCount = inspections.filter(i => i.status === 'Completed').length;
            const pendingCount = inspections.filter(i => i.status === 'Pending').length;
            const overdueCount = inspections.filter(i => i.status === 'Overdue').length;
            const completionRate = Math.round((completedCount / (inspections.length || 1)) * 100);

            const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
            const smMap = { 'Apr': 'April', 'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August', 'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December', 'Jan': 'January', 'Feb': 'February', 'Mar': 'March' };
            this._chartLabels = months;
            this._chartCompleted = months.map(m => inspections.filter(i => (i.month === smMap[m] || (i.month || '').startsWith(m)) && i.status === 'Completed').length);
            this._chartPending = months.map(m => inspections.filter(i => (i.month === smMap[m] || (i.month || '').startsWith(m)) && i.status !== 'Completed').length);
            this._chartMainPlant = inspections.filter(i => i.area === 'Main Plant').length;
            this._chartChp = inspections.filter(i => i.area === 'CHP').length;
            this._chartSwitchyard = inspections.filter(i => i.area === 'Switchyard').length;

            return `
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 class="m-0 text-primary fw-bold"><i class="fas fa-tachometer-alt me-2"></i>Executive Safety Dashboard</h3>
                        <div class="text-muted" style="font-size:12px;">Financial Year: <strong>${this.app.state.fy}</strong> | Period: <strong>${this.app.state.month}</strong></div>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-erp-outline btn-sm" onclick="window.app.renderCurrentModule()">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-xl-3 col-md-6">
                        <div class="kpi-card kpi-accent">
                            <div class="kpi-info">
                                <h6>Active Safety Tasks</h6>
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
                                <div class="text-muted mt-1" style="font-size:11px;"><strong class="text-success">${inspections.length ? completionRate + '%' : '0%'}</strong> rate</div>
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
                                <div class="text-muted mt-1" style="font-size:11px;">${overdueCount ? '<span class="text-danger fw-bold">Immediate action required</span>' : '<span class="text-success fw-bold">No overdue work</span>'}</div>
                            </div>
                            <div class="kpi-icon"><i class="fas fa-bell"></i></div>
                        </div>
                    </div>
                </div>

                <div class="row g-3 mb-4">
                    <div class="col-lg-8">
                        <div class="erp-card h-100 mb-0">
                            <div class="erp-card-header">Monthly Inspection Progress Comparison</div>
                            <div class="erp-card-body" style="height: 310px;"><canvas id="dashMonthlyChart"></canvas></div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="erp-card h-100 mb-0">
                            <div class="erp-card-header">Plant Area Compliance Ratio</div>
                            <div class="erp-card-body" style="height: 310px;"><canvas id="dashAreaChart"></canvas></div>
                        </div>
                    </div>
                </div>

                <div class="erp-card mb-0">
                    <div class="erp-card-header d-flex justify-content-between">
                        <span>Recent Safety Activities & Inspection Records</span>
                        <a href="#" onclick="window.app.navigateTo('inspections'); return false;" class="text-decoration-none fw-bold" style="font-size:12px;">View All &rarr;</a>
                    </div>
                    <div class="table-responsive">
                        <table class="table-erp mb-0">
                            <thead>
                                <tr><th>ID</th><th>Category</th><th>Area</th><th>Responsible Engineer</th><th>Date</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                ${inspections.length ? inspections.slice(0, 5).map(i => `
                                    <tr>
                                        <td class="fw-bold text-primary font-mono">${i.id}</td>
                                        <td class="text-capitalize">${i.category.replace('_', ' ')}</td>
                                        <td><span class="badge bg-secondary p-1">${i.area}</span></td>
                                        <td>${i.responsiblePerson}</td>
                                        <td>${i.date}</td>
                                        <td><span class="badge-erp ${i.status === 'Completed' ? 'badge-success' : i.status === 'Overdue' ? 'badge-danger' : 'badge-warning'}">${i.status}</span></td>
                                        <td><button class="btn btn-sm btn-erp-outline p-1 px-2" onclick="window.app.controllers.inspections.viewDetails('${i.id}')"><i class="fas fa-eye"></i> View</button></td>
                                    </tr>
                                `).join('') : '<tr><td colspan="7" class="text-center py-4 text-muted">No recent inspections recorded. Navigate to Inspections module to add one.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        afterRender() {
            setTimeout(() => {
                ChartComponent.renderMonthlyProgress('dashMonthlyChart', this._chartLabels, this._chartCompleted, this._chartPending);
                ChartComponent.renderAreaWiseChart('dashAreaChart', this._chartMainPlant, this._chartChp, this._chartSwitchyard);
            }, 150);
        }
    }

    class InspectionController {
        constructor(app) { this.app = app; this.selectedCat = 'all'; this.searchQuery = ''; this.sortBy = 'sl_asc'; }
        async render() {
            if (!this.selectedMonth) this.selectedMonth = 'April';
            if (this.selectedMonth !== 'All') {
                this.ensureMonthSlots(this.selectedMonth);
            }
            let allItems = await dataService.getAll('inspections', { fy: this.app.state.fy });
            let items = [...allItems];
            if (this.selectedMonth && this.selectedMonth !== 'All') {
                const smMap = { 'Apr': 'April', 'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August', 'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December', 'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'April': 'April', 'May': 'May', 'June': 'June', 'July': 'July', 'August': 'August', 'September': 'September', 'October': 'October', 'November': 'November', 'December': 'December', 'January': 'January', 'February': 'February', 'March': 'March' };
                const fullM = smMap[this.selectedMonth] || this.selectedMonth;
                const codeM = fullM.substring(0, 3).toLowerCase();
                items = items.filter(i => {
                    const m = (i.month || '').toLowerCase();
                    const mc = (i.monthCode || '').toLowerCase();
                    return m === fullM.toLowerCase() || m.startsWith(codeM) || mc === codeM;
                });
            }
            if (this.selectedCat !== 'all') items = items.filter(i => i.category === this.selectedCat);
            if (this.searchQuery && this.searchQuery.trim() !== '') {
                const q = this.searchQuery.toLowerCase().trim();
                items = items.filter(i => {
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
                items.sort((a, b) => {
                    const mA = fyMonthMap[(a.month || a.monthCode || '').toLowerCase()] || 99;
                    const mB = fyMonthMap[(b.month || b.monthCode || '').toLowerCase()] || 99;
                    if (mA !== mB) return mA - mB;
                    const numA = a.slotNo || parseInt((String(a.id || '').match(/\d+/) || [999])[0], 10);
                    const numB = b.slotNo || parseInt((String(b.id || '').match(/\d+/) || [999])[0], 10);
                    return numA !== numB ? numA - numB : String(a.id || '').localeCompare(String(b.id || ''));
                });
            } else if (this.sortBy === 'sl_desc') {
                items.sort((a, b) => {
                    const mA = fyMonthMap[(a.month || a.monthCode || '').toLowerCase()] || 0;
                    const mB = fyMonthMap[(b.month || b.monthCode || '').toLowerCase()] || 0;
                    if (mA !== mB) return mB - mA;
                    const numA = a.slotNo || parseInt((String(a.id || '').match(/\d+/) || [0])[0], 10);
                    const numB = b.slotNo || parseInt((String(b.id || '').match(/\d+/) || [0])[0], 10);
                    return numA !== numB ? numB - numA : String(b.id || '').localeCompare(String(a.id || ''));
                });
            } else if (this.sortBy === 'name_asc') {
                items.sort((a, b) => {
                    const catA = (INSPECTION_CATEGORIES.find(c => c.id === a.category) || { name: a.category || '' }).name || '';
                    const catB = (INSPECTION_CATEGORIES.find(c => c.id === b.category) || { name: b.category || '' }).name || '';
                    return catA.localeCompare(catB);
                });
            } else if (this.sortBy === 'name_desc') {
                items.sort((a, b) => {
                    const catA = (INSPECTION_CATEGORIES.find(c => c.id === a.category) || { name: a.category || '' }).name || '';
                    const catB = (INSPECTION_CATEGORIES.find(c => c.id === b.category) || { name: b.category || '' }).name || '';
                    return catB.localeCompare(catA);
                });
            } else if (this.sortBy === 'date_desc') {
                items.sort((a, b) => new Date(b.plannedDate || b.completedDate || 0) - new Date(a.plannedDate || a.completedDate || 0));
            } else if (this.sortBy === 'date_asc') {
                items.sort((a, b) => new Date(a.plannedDate || a.completedDate || 0) - new Date(b.plannedDate || b.completedDate || 0));
            }

            const dbData = dataService.getDatabase();
            const customCols = dbData.customInspectionColumns || [];
            const hiddenCols = dbData.hiddenInspectionColumns || [];
            const user = authService.getCurrentUser();
            const isViewer = user?.role === 'viewer';

            let allCols = [
                { key: 'id', label: 'Sl', isCustom: false },
                { key: 'category', label: 'Activity', isCustom: false },
                { key: 'area', label: 'Area', isCustom: false },
                { key: 'frequency', label: 'Frequency', isCustom: false },
                { key: 'plannedDate', label: 'Planned Date', isCustom: false },
                { key: 'completedDate', label: 'Completed Date', isCustom: false },
                { key: 'status', label: 'Status', isCustom: false },
                { key: 'responsiblePerson', label: 'Responsible', isCustom: false },
                { key: 'remarks', label: 'Remarks', isCustom: false },
                ...customCols.map(c => ({ key: c.key, label: c.label, isCustom: true }))
            ];

            if (dbData.inspectionColOrder && Array.isArray(dbData.inspectionColOrder)) {
                allCols.sort((a, b) => {
                    let idxA = dbData.inspectionColOrder.indexOf(a.key);
                    let idxB = dbData.inspectionColOrder.indexOf(b.key);
                    if (idxA === -1) idxA = 999;
                    if (idxB === -1) idxB = 999;
                    return idxA - idxB;
                });
            }

            const visibleCols = allCols.filter(col => !hiddenCols.includes(col.key));

            return `
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-clipboard-check me-2"></i>Safety Inspection Master Register</h3>
                    <div class="d-flex gap-2 flex-wrap">
                        ${!isViewer ? `
                            <button class="btn btn-erp-primary btn-sm" onclick="window.app.controllers.inspections.openCreateModal()"><i class="fas fa-plus me-1"></i> Record Inspection</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="window.app.controllers.inspections.clearAllInspections()"><i class="fas fa-trash-alt me-1"></i> Clear Register</button>
                            <button class="btn btn-erp-outline btn-sm text-primary" onclick="window.app.controllers.inspections.addCustomColumn()"><i class="fas fa-plus-circle me-1"></i> + Add Custom Column</button>
                            <button class="btn btn-erp-outline btn-sm" onclick="window.app.controllers.inspections.manageColumns()"><i class="fas fa-columns me-1"></i> Manage Columns</button>
                        ` : ''}
                        <button class="btn btn-erp-outline btn-sm" onclick="window.app.exportCSV('inspections')"><i class="fas fa-file-csv me-1"></i> Export CSV</button>
                        <button class="btn btn-erp-outline btn-sm" onclick="window.app.printReport('Safety Inspection Register')"><i class="fas fa-print me-1"></i> Print PDF</button>
                    </div>
                </div>

                <div class="d-flex align-items-center justify-content-between bg-light p-2 px-3 rounded-3 mb-3 border shadow-sm flex-wrap gap-2" style="background: #f8fafc !important; border-color: #cbd5e1 !important;">
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <span class="badge bg-success text-white px-3 py-2 rounded-pill d-flex align-items-center gap-2 shadow-sm" style="font-size: 13px;">
                            <i class="fas fa-calendar-alt"></i> Schedule Month: <strong class="text-white">${this.selectedMonth || 'April'}</strong>
                        </span>
                    </div>
                    <div class="d-flex align-items-center gap-1 overflow-auto py-1">
                        ${[
                    { code: 'Apr', name: 'April' }, { code: 'May', name: 'May' }, { code: 'Jun', name: 'June' },
                    { code: 'Jul', name: 'July' }, { code: 'Aug', name: 'August' }, { code: 'Sep', name: 'September' },
                    { code: 'Oct', name: 'October' }, { code: 'Nov', name: 'November' }, { code: 'Dec', name: 'December' },
                    { code: 'Jan', name: 'January' }, { code: 'Feb', name: 'February' }, { code: 'Mar', name: 'March' }
                ].map(m => `
                            <button class="btn btn-sm ${this.selectedMonth === m.name || this.selectedMonth === m.code ? 'btn-success fw-bold shadow-sm' : 'btn-light border text-secondary hover-bg-white'}" onclick="window.app.controllers.inspections.selectMonth('${m.name}')" style="padding: 3px 10px; font-size: 12px; border-radius: 5px;">
                                ${m.code}
                            </button>
                        `).join('')}
                        <button class="btn btn-sm ${this.selectedMonth === 'All' ? 'btn-primary fw-bold shadow-sm' : 'btn-light border text-secondary hover-bg-white'}" onclick="window.app.controllers.inspections.selectMonth('All')" style="padding: 3px 10px; font-size: 12px; border-radius: 5px; margin-left: 4px;">
                            All FY
                        </button>
                    </div>
                </div>

                <div class="filter-bar d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3 p-3 rounded-3 shadow-sm" style="background: #ffffff; border: 1px solid #E2E8F0;">
                    <div class="d-flex align-items-center flex-wrap gap-2">
                        <label class="fw-bold text-primary m-0 d-flex align-items-center gap-2" for="insCategoryDropdown" style="font-size: 13.5px;">
                            <i class="fas fa-filter text-primary"></i> Category Filter:
                        </label>
                        <div class="input-group input-group-sm shadow-sm" style="width: auto; min-width: 250px;">
                            <span class="input-group-text bg-light border-end-0 text-secondary"><i class="fas fa-layer-group"></i></span>
                            <select id="insCategoryDropdown" class="form-select form-select-sm border-start-0 ps-2 fw-semibold" style="color: #0A2647; cursor: pointer; border-color: #CBD5E1;" onchange="window.app.controllers.inspections.filterCat(this.value)">
                                <option value="all" ${this.selectedCat === 'all' ? 'selected' : ''}>All Categories (${allItems.length})</option>
                                ${INSPECTION_CATEGORIES.map(c => `
                                    <option value="${c.id}" ${this.selectedCat === c.id ? 'selected' : ''}>${c.name}</option>
                                `).join('')}
                            </select>
                        </div>

                        <label class="fw-bold text-primary m-0 ms-2 d-flex align-items-center gap-2" for="insSortDropdown" style="font-size: 13.5px;">
                            <i class="fas fa-sort-amount-down text-primary"></i> Sort By:
                        </label>
                        <div class="input-group input-group-sm shadow-sm" style="width: auto; min-width: 220px;">
                            <span class="input-group-text bg-light border-end-0 text-secondary"><i class="fas fa-sort"></i></span>
                            <select id="insSortDropdown" class="form-select form-select-sm border-start-0 ps-2 fw-semibold" style="color: #0A2647; cursor: pointer; border-color: #CBD5E1;" onchange="window.app.controllers.inspections.handleSort(this.value)">
                                <option value="sl_asc" ${this.sortBy === 'sl_asc' ? 'selected' : ''}>Serial No  (Asc)</option>
                                <option value="sl_desc" ${this.sortBy === 'sl_desc' ? 'selected' : ''}>Serial No (Desc)</option>
                                <option value="name_asc" ${this.sortBy === 'name_asc' ? 'selected' : ''}>Name / Activity (A-Z)</option>
                                <option value="name_desc" ${this.sortBy === 'name_desc' ? 'selected' : ''}>Name / Activity (Z-A)</option>
                                <option value="date_desc" ${this.sortBy === 'date_desc' ? 'selected' : ''}>Date (Latest First)</option>
                                <option value="date_asc" ${this.sortBy === 'date_asc' ? 'selected' : ''}>Date (Oldest First)</option>
                            </select>
                        </div>
                    </div>
                    <div class="d-flex align-items-center flex-grow-1 justify-content-end" style="max-width: 420px; min-width: 260px;">
                        <div class="input-group input-group-sm shadow-sm w-100">
                            <span class="input-group-text bg-light border-end-0 text-primary"><i class="fas fa-search"></i></span>
                            <input type="text" id="insSearchInput" class="form-control border-start-0 ps-0" placeholder="Search inspections (Activity, Area, Engineer, Remarks)..." value="${this.searchQuery || ''}" oninput="window.app.controllers.inspections.handleSearchInput(this.value)">
                            ${this.searchQuery ? `<button class="btn btn-outline-secondary" type="button" onclick="window.app.controllers.inspections.clearSearch()" title="Clear Search"><i class="fas fa-times"></i></button>` : ''}
                        </div>
                    </div>
                </div>

                <div class="erp-table-container">
                    <div class="erp-card-header d-flex justify-content-between align-items-center">
                        <span>Active Safety Audit Register (<span id="activeAuditRecordCount">${items.length} records</span>)</span>
                        ${hiddenCols.length > 0 || customCols.length > 0 ? `<small class="text-primary cursor-pointer d-print-none" onclick="window.app.controllers.inspections.manageColumns()">Configure Visible Columns (${hiddenCols.length} hidden)</small>` : ''}
                    </div>
                    <div class="table-responsive">
                        <table class="table-erp mb-0">
                            <thead>
                                <tr>
                                    ${visibleCols.map(col => `
                                        <th draggable="true" 
                                            ondragstart="event.dataTransfer.setData('text/plain', '${col.key}')" 
                                            ondragover="event.preventDefault()" 
                                            ondrop="window.app.controllers.inspections.dropColumn(event, '${col.key}')" 
                                            style="cursor: grab;" title="Drag left or right to change column position">
                                            ${col.label}
                                            ${!isViewer ? `<i class="fas fa-times ms-1 text-danger cursor-pointer d-print-none" onclick="window.app.controllers.inspections.${col.isCustom ? `removeCustomColumn('${col.key}', '${col.label}')` : `hideColumn('${col.key}', '${col.label}')`}" title="Remove Column"></i>` : ''}
                                        </th>
                                    `).join('')}
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items.length > 0 ? items.map((i, idx) => {
                    const catObj = INSPECTION_CATEGORIES.find(c => c.id === i.category) || { name: i.category };
                    return `
                                        <tr>
                                            ${visibleCols.map(col => {
                        if (col.key === 'id') return `<td class="fw-bold text-center font-mono align-middle" style="width: 60px; background: #f8fafc; border-right: 1px solid #e2e8f0; color: #0A2647; font-size: 14px;">${idx + 1}</td>`;
                        if (col.key === 'responsiblePerson') return `<td class="p-1 align-middle" title="${i.responsiblePerson || ''}" style="min-width: 180px;"><input type="text" class="form-control form-control-sm border-0 bg-transparent px-2 py-1 w-100 shadow-none focus-bg-white" style="font-size: 13px;" title="${i.responsiblePerson || ''}" placeholder="Enter engineer..." value="${i.responsiblePerson || ''}" onchange="window.app.controllers.inspections.updateInlineField('${i.id}', 'responsiblePerson', this.value)"></td>`;
                        if (col.key === 'category') return `<td class="p-1 align-middle" title="${i.activityName || i.category || ''}" style="min-width: 200px;"><input type="text" class="form-control form-control-sm border-0 bg-transparent px-2 py-1 w-100 fw-semibold text-dark shadow-none focus-bg-white" style="font-size: 13px;" title="${i.activityName || i.category || ''}" placeholder="Enter activity..." value="${i.activityName || i.category || ''}" onchange="window.app.controllers.inspections.updateInlineField('${i.id}', 'activityName', this.value)"></td>`;
                        if (col.key === 'area') return `<td class="p-1 align-middle" title="${i.area || ''}" style="min-width: 140px;"><input type="text" class="form-control form-control-sm border-0 bg-transparent px-2 py-1 w-100 shadow-none focus-bg-white" style="font-size: 13px;" title="${i.area || ''}" placeholder="Enter area..." value="${i.area || ''}" onchange="window.app.controllers.inspections.updateInlineField('${i.id}', 'area', this.value)"></td>`;
                        if (col.key === 'status') return `<td class="p-1 align-middle"><select class="form-select form-select-sm border-0 bg-transparent ps-2 pe-4 py-1 shadow-none focus-bg-white fw-bold ${i.status === 'Completed' ? 'text-success' : i.status === 'Overdue' ? 'text-danger' : i.status === 'Pending' ? 'text-warning' : 'text-muted'}" style="font-size: 12.5px; min-width: 118px; width: 100%; cursor: pointer;" onchange="window.app.controllers.inspections.updateInlineField('${i.id}', 'status', this.value)"><option value="Pending" ${i.status === 'Pending' ? 'selected' : ''}>Pending</option><option value="Completed" ${i.status === 'Completed' ? 'selected' : ''}>Completed</option><option value="In Progress" ${i.status === 'In Progress' ? 'selected' : ''}>In Progress</option><option value="Overdue" ${i.status === 'Overdue' ? 'selected' : ''}>Overdue</option></select></td>`;
                        if (col.key === 'frequency') return `<td class="p-1 align-middle"><select class="form-select form-select-sm border-0 bg-transparent ps-2 pe-4 py-1 shadow-none focus-bg-white" style="font-size: 12.5px; min-width: 115px; width: 100%; cursor: pointer;" onchange="window.app.controllers.inspections.updateInlineField('${i.id}', 'frequency', this.value)"><option value="">Select...</option><option value="Monthly" ${i.frequency === 'Monthly' ? 'selected' : ''}>Monthly</option><option value="Quarterly" ${i.frequency === 'Quarterly' ? 'selected' : ''}>Quarterly</option><option value="Weekly" ${i.frequency === 'Weekly' ? 'selected' : ''}>Weekly</option><option value="Yearly" ${i.frequency === 'Yearly' ? 'selected' : ''}>Yearly</option></select></td>`;
                        if (col.key === 'plannedDate') return `<td class="p-1 align-middle"><input type="date" class="form-control form-control-sm border-0 bg-transparent px-2 py-1 shadow-none focus-bg-white font-mono" style="font-size: 12px;" value="${i.plannedDate || ''}" onchange="window.app.controllers.inspections.updateInlineField('${i.id}', 'plannedDate', this.value)"></td>`;
                        if (col.key === 'completedDate' || col.key === 'date') return `<td class="p-1 align-middle"><input type="date" class="form-control form-control-sm border-0 bg-transparent px-2 py-1 shadow-none focus-bg-white font-mono" style="font-size: 12px;" value="${i.completedDate || i.date || ''}" onchange="window.app.controllers.inspections.updateInlineField('${i.id}', 'completedDate', this.value)"></td>`;
                        if (col.key === 'remarks') return `<td class="p-1 align-middle" title="${i.remarks || ''}" style="min-width: 180px;"><input type="text" class="form-control form-control-sm border-0 bg-transparent px-2 py-1 w-100 shadow-none focus-bg-white" style="font-size: 12px;" title="${i.remarks || ''}" placeholder="Add remarks..." value="${i.remarks || ''}" onchange="window.app.controllers.inspections.updateInlineField('${i.id}', 'remarks', this.value)"></td>`;
                        return `<td class="p-1 align-middle" title="${i[col.key] || ''}" style="min-width: 140px;"><input type="text" class="form-control form-control-sm border-0 bg-transparent px-2 py-1 w-100 shadow-none focus-bg-white" style="font-size: 13px;" title="${i[col.key] || ''}" value="${i[col.key] || ''}" onchange="window.app.controllers.inspections.updateInlineField('${i.id}', '${col.key}', this.value)"></td>`;
                    }).join('')}
                                            <td>
                                                <button class="btn btn-sm btn-light border text-secondary px-2 py-1 rounded-2 shadow-sm" onclick="window.app.controllers.inspections.openActionMenu('${i.id}', event)" title="Actions">
                                                    <i class="fas fa-ellipsis-v"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `;
                }).join('') : `
                                    <tr>
                                        <td colspan="${visibleCols.length + 1}" class="text-center py-5 bg-white">
                                            <div class="py-3">
                                                <i class="fas fa-clipboard-list text-primary mb-3" style="font-size: 38px; opacity: 0.7;"></i>
                                                <h6 class="fw-bold text-dark mb-1">No Inspection Records in ${this.selectedMonth || 'April'}</h6>
                                                <p class="text-muted small mb-3">Click 'Record Inspection' above to add a new safety audit record.</p>
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
                            <button class="btn btn-sm ${this.selectedMonth === m.name || this.selectedMonth === m.code ? 'bg-white fw-bold text-success shadow-sm border border-success' : 'text-secondary border border-transparent hover-bg-white'}" onclick="window.app.controllers.inspections.selectMonth('${m.name}')" style="padding: 5px 16px; font-size: 13px; border-radius: 6px 6px 0 0; border-bottom: ${this.selectedMonth === m.name || this.selectedMonth === m.code ? '3px solid #198754 !important' : 'none'};">
                                ${m.code}
                            </button>
                        `).join('')}
                        <button class="btn btn-sm ${this.selectedMonth === 'All' ? 'bg-white fw-bold text-primary shadow-sm border border-primary' : 'text-secondary border border-transparent hover-bg-white'}" onclick="window.app.controllers.inspections.selectMonth('All')" style="padding: 5px 16px; font-size: 13px; border-radius: 6px 6px 0 0; margin-left: 8px;">
                            <i class="fas fa-list me-1"></i> All FY
                        </button>
                    </div>
                </div>
                <div id="modalHolder"></div>
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

            const isViewer = authService.getCurrentUser()?.role === 'viewer';
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
                    <a href="#" class="d-flex align-items-center px-3 py-2 text-decoration-none text-dark action-menu-item" onclick="document.getElementById('floatingActionMenu')?.remove(); window.app.controllers.inspections.viewDetails('${id}'); return false;" style="font-size: 13px; transition: background 0.15s;">
                        <i class="fas fa-eye text-primary me-2" style="width: 16px;"></i> View Details
                    </a>
                    ${!isViewer ? `
                        <a href="#" class="d-flex align-items-center px-3 py-2 text-decoration-none text-dark action-menu-item" onclick="document.getElementById('floatingActionMenu')?.remove(); window.app.controllers.inspections.editInspection('${id}'); return false;" style="font-size: 13px; transition: background 0.15s;">
                            <i class="fas fa-edit text-info me-2" style="width: 16px;"></i> Edit Record
                        </a>
                        <a href="#" class="d-flex align-items-center px-3 py-2 text-decoration-none text-dark action-menu-item" onclick="document.getElementById('floatingActionMenu')?.remove(); window.app.controllers.inspections.markComplete('${id}'); return false;" style="font-size: 13px; transition: background 0.15s;">
                            <i class="fas fa-check-circle text-success me-2" style="width: 16px;"></i> Mark Completed
                        </a>
                        <div class="border-top my-1 border-light"></div>
                        <a href="#" class="d-flex align-items-center px-3 py-2 text-decoration-none text-danger action-menu-item" onclick="document.getElementById('floatingActionMenu')?.remove(); window.app.controllers.inspections.del('${id}'); return false;" style="font-size: 13px; transition: background 0.15s;">
                            <i class="fas fa-trash-alt me-2" style="width: 16px;"></i> Delete Record
                        </a>
                    ` : ''}
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
        filterCat(cat) { this.selectedCat = cat; this.app.renderCurrentModule(); }
        handleSort(sortVal) { this.sortBy = sortVal; this.app.renderCurrentModule(); }

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
            const countEl = document.getElementById('activeAuditRecordCount');
            if (countEl) countEl.innerText = `${visibleCount} records`;

            let noResRow = document.getElementById('searchNoResultsRow');
            if (visibleCount === 0 && rows.length > 0 && (!rows[0].getAttribute('data-empty'))) {
                if (!noResRow) {
                    noResRow = document.createElement('tr');
                    noResRow.id = 'searchNoResultsRow';
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
            const input = document.getElementById('insSearchInput');
            if (input) input.value = '';
            this.app.renderCurrentModule();
        }

        clearAllInspections() {
            if (confirm("Are you sure you want to clear ALL inspection records? This will empty the register so you can add or manage your own custom records from scratch.")) {
                const dbData = dataService.getDatabase();
                dbData.inspections = [];
                dataService.saveDatabase(dbData);
                Swal.fire('Register Emptied!', 'All inspection records have been cleared. You now have a clean blank table to manage as you wish.', 'success');
                this.app.renderCurrentModule();
            }
        }

        dropColumn(event, targetKey) {
            event.preventDefault();
            const sourceKey = event.dataTransfer.getData('text/plain');
            if (!sourceKey || sourceKey === targetKey) return;

            const dbData = dataService.getDatabase();
            const customCols = dbData.customInspectionColumns || [];
            const stdKeys = ['id', 'category', 'area', 'frequency', 'plannedDate', 'completedDate', 'status', 'responsiblePerson', 'remarks'];
            let currentOrder = dbData.inspectionColOrder ? [...dbData.inspectionColOrder] : [...stdKeys, ...customCols.map(c => c.key)];

            const allKeys = [...stdKeys, ...customCols.map(c => c.key)];
            allKeys.forEach(k => { if (!currentOrder.includes(k)) currentOrder.push(k); });

            const srcIdx = currentOrder.indexOf(sourceKey);
            const tgtIdx = currentOrder.indexOf(targetKey);
            if (srcIdx !== -1 && tgtIdx !== -1) {
                currentOrder.splice(srcIdx, 1);
                currentOrder.splice(tgtIdx, 0, sourceKey);
                dbData.inspectionColOrder = currentOrder;
                dataService.saveDatabase(dbData);
                this.app.renderCurrentModule();
            }
        }

        hideColumn(colKey, colName) {
            const dbData = dataService.getDatabase();
            if (!dbData.hiddenInspectionColumns) dbData.hiddenInspectionColumns = [];
            if (!dbData.hiddenInspectionColumns.includes(colKey)) {
                dbData.hiddenInspectionColumns.push(colKey);
            }
            dataService.saveDatabase(dbData);
            this.app.renderCurrentModule();
        }

        removeCustomColumn(colKey, colName) {
            const dbData = dataService.getDatabase();
            if (dbData.customInspectionColumns) {
                dbData.customInspectionColumns = dbData.customInspectionColumns.filter(c => c.key !== colKey);
                dataService.saveDatabase(dbData);
                this.app.renderCurrentModule();
            }
        }

        async manageColumns() {
            const dbData = dataService.getDatabase();
            const hidden = dbData.hiddenInspectionColumns || [];
            const custom = dbData.customInspectionColumns || [];

            let allCols = [
                { key: 'id', label: 'Sl', isCustom: false },
                { key: 'category', label: 'Activity', isCustom: false },
                { key: 'area', label: 'Area', isCustom: false },
                { key: 'frequency', label: 'Frequency', isCustom: false },
                { key: 'plannedDate', label: 'Planned Date', isCustom: false },
                { key: 'completedDate', label: 'Completed Date', isCustom: false },
                { key: 'status', label: 'Status', isCustom: false },
                { key: 'responsiblePerson', label: 'Responsible', isCustom: false },
                { key: 'remarks', label: 'Remarks', isCustom: false },
                ...custom.map(c => ({ key: c.key, label: c.label, isCustom: true }))
            ];

            if (dbData.inspectionColOrder && Array.isArray(dbData.inspectionColOrder)) {
                allCols.sort((a, b) => {
                    let idxA = dbData.inspectionColOrder.indexOf(a.key);
                    let idxB = dbData.inspectionColOrder.indexOf(b.key);
                    if (idxA === -1) idxA = 999;
                    if (idxB === -1) idxB = 999;
                    return idxA - idxB;
                });
            }

            const html = `
                <div style="text-align:left; font-size:13px;">
                    <p class="text-muted mb-3">Check or uncheck columns to display or hide them in the inspection table:</p>
                    <h6 class="fw-bold text-primary border-bottom pb-1 mb-3">Standard & Active Table Columns</h6>
                    ${allCols.map(c => `
                        <div class="d-flex justify-content-between align-items-center mb-2 p-1 ${c.isCustom ? 'bg-light rounded border' : ''}">
                            <div class="form-check m-0">
                                <input class="form-check-input" type="checkbox" id="chk_${c.key}" ${!hidden.includes(c.key) ? 'checked' : ''}>
                                <label class="form-check-label fw-bold" for="chk_${c.key}">${c.label}</label>
                            </div>
                            ${c.isCustom ? `<button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" onclick="Swal.close(); window.app.controllers.inspections.removeCustomColumn('${c.key}', '${c.label}')"><i class="fas fa-trash me-1"></i> Delete</button>` : ''}
                        </div>
                    `).join('')}
                </div>
            `;

            const { isConfirmed } = await Swal.fire({
                title: '<strong style="color:#0A2647;">Manage Table Columns</strong>',
                html,
                showCancelButton: true,
                confirmButtonText: 'Save Configuration',
                confirmButtonColor: '#0A2647',
                preConfirm: () => {
                    const newHidden = [];
                    allCols.forEach(c => {
                        const el = document.getElementById(`chk_${c.key}`);
                        if (el && !el.checked) newHidden.push(c.key);
                    });
                    return newHidden;
                }
            });

            if (isConfirmed !== undefined && Array.isArray(isConfirmed)) {
                dbData.hiddenInspectionColumns = isConfirmed;
                dataService.saveDatabase(dbData);
                this.app.renderCurrentModule();
            }
        }

        async addCustomColumn() {
            const user = authService.getCurrentUser();
            if (user?.role === 'viewer') return;
            const { value: label } = await Swal.fire({
                title: 'Add Standard Table Column',
                input: 'text',
                inputLabel: 'Enter Column Name (e.g. Contractor Agency, Hazard Score, Shift No.)',
                inputPlaceholder: 'e.g. Contractor Firm Name',
                showCancelButton: true,
                confirmButtonColor: '#0A2647'
            });
            if (label) {
                const dbData = dataService.getDatabase();
                if (!dbData.customInspectionColumns) dbData.customInspectionColumns = [];
                const key = 'col_' + label.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(Math.random() * 100);
                dbData.customInspectionColumns.push({ key, label });
                if (dbData.inspectionColOrder && Array.isArray(dbData.inspectionColOrder)) {
                    const statusIdx = dbData.inspectionColOrder.indexOf('status');
                    if (statusIdx !== -1) {
                        dbData.inspectionColOrder.splice(statusIdx, 0, key);
                    } else {
                        dbData.inspectionColOrder.push(key);
                    }
                }
                dataService.saveDatabase(dbData);
                Swal.fire('Column Added', `Column "${label}" added as standard active column to Inspection Register.`, 'success');
                this.app.renderCurrentModule();
            }
        }

        clearCustomColumns() {
            if (confirm("Remove all custom columns from table view?")) {
                const dbData = dataService.getDatabase();
                dbData.customInspectionColumns = [];
                dataService.saveDatabase(dbData);
                this.app.renderCurrentModule();
            }
        }

        openCreateModal() {
            if (authService.getCurrentUser()?.role === 'viewer') {
                Swal.fire('Access Restricted', 'Your account has Read-Only (Viewer) permissions.', 'warning');
                return;
            }
            const dbData = dataService.getDatabase();
            const customCols = dbData.customInspectionColumns || [];

            let customHtml = '';
            customCols.forEach(col => {
                customHtml += `
                    <div class="col-md-6 mt-2">
                        <label class="form-label fw-bold text-primary">${col.label}</label>
                        <input type="text" class="form-control custom-col-input" data-key="${col.key}" placeholder="Enter ${col.label}">
                    </div>
                `;
            });

            const activeM = (this.selectedMonth && this.selectedMonth !== 'All') ? this.selectedMonth : 'April';
            document.getElementById('modalHolder').innerHTML = ModalComponent.getInspectionFormHTML(this.app.state.fy, activeM);
            if (customHtml) {
                const formRow = document.querySelector('#inspectionModal .row');
                if (formRow) formRow.insertAdjacentHTML('beforeend', customHtml);
            }
            new bootstrap.Modal(document.getElementById('inspectionModal')).show();
        }

        async saveInspection() {
            const idVal = document.getElementById('insId')?.value || '';
            const catEl = document.getElementById('insCategory');
            const cat = catEl ? catEl.value : '';
            const catName = catEl && catEl.selectedIndex >= 0 ? catEl.options[catEl.selectedIndex].text : cat;
            const freq = document.getElementById('insFrequency')?.value || 'Monthly';
            const area = document.getElementById('insArea').value;
            const plannedDate = document.getElementById('insPlannedDate')?.value || '';
            const date = document.getElementById('insDate').value;
            const resp = document.getElementById('insResponsible').value;
            const status = document.getElementById('insStatus').value;
            const remarks = document.getElementById('insRemarks').value;
            const action = document.getElementById('insAction')?.value || 'None';

            if (!resp && !remarks) {
                Swal.fire('Validation Error', 'Please enter some remarks or responsible engineer.', 'warning');
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
            const record = {
                id: idVal.trim() || dataService.getNextSerialId('inspections', 'INSP', { date: plannedDate || date }),
                slotNo: nextSl,
                category: cat, activityName: catName, fy: targetFy, month: selectedM, monthCode: mCode,
                area: area, frequency: freq, plannedDate: plannedDate, completedDate: date, date: date,
                responsiblePerson: resp, status: status, remarks: remarks, correctiveAction: action
            };

            document.querySelectorAll('.custom-col-input').forEach(inp => {
                record[inp.dataset.key] = inp.value;
            });

            await dataService.create('inspections', record);
            const modalEl = document.getElementById('inspectionModal');
            if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
            if (selectedM) {
                this.selectedMonth = selectedM;
            }
            Swal.fire('Record Saved', 'Safety inspection logged into database.', 'success');
            this.app.renderCurrentModule();
        }

        async editInspection(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            const item = await dataService.getById('inspections', id);
            if (!item) return;

            const dbData = dataService.getDatabase();
            const customCols = dbData.customInspectionColumns || [];

            let customInputs = '';
            customCols.forEach(col => {
                customInputs += `
                    <div class="col-md-6 mt-2">
                        <label class="fw-bold text-primary" style="font-size:12px;">${col.label}</label>
                        <input id="edit_cust_${col.key}" class="form-control" value="${item[col.key] || ''}">
                    </div>
                `;
            });

            const catOptions = INSPECTION_CATEGORIES.map(c => `<option value="${c.id}" ${item.category === c.id ? 'selected' : ''}>${c.name}</option>`).join('');

            const { value: formValues } = await Swal.fire({
                title: `<strong style="color:#0A2647;">Full Edit Inspection: ${item.id}</strong>`,
                width: '700px',
                html: `
                    <div class="row g-2" style="text-align:left; font-size:13px;">
                        <div class="col-md-4">
                            <label class="fw-bold mt-1">Sl / Record ID</label>
                            <input id="edId" class="form-control font-mono" value="${item.id}">
                        </div>
                        <div class="col-md-8">
                            <label class="fw-bold mt-1">Activity / Category</label>
                            <select id="edCategory" class="form-select">${catOptions}</select>
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Area</label>
                            <input id="edArea" class="form-control" value="${item.area || ''}">
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Frequency</label>
                            <input id="edFreq" class="form-control" value="${item.frequency || 'Monthly'}">
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Planned Date</label>
                            <input id="edPlanned" type="date" class="form-control" value="${item.plannedDate || ''}">
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Completed Date</label>
                            <input id="edCompleted" type="date" class="form-control" value="${item.completedDate || item.date || ''}">
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Status</label>
                            <select id="edStatus" class="form-select">
                                <option value="Pending" ${item.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Completed" ${item.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                <option value="Overdue" ${item.status === 'Overdue' ? 'selected' : ''}>Overdue</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label class="fw-bold mt-1">Responsible Engineer</label>
                            <input id="edResp" class="form-control" value="${item.responsiblePerson || ''}">
                        </div>
                        <div class="col-12">
                            <label class="fw-bold mt-1">Remarks</label>
                            <textarea id="edRemarks" class="form-control" rows="2">${item.remarks || ''}</textarea>
                        </div>
                        <div class="col-12">
                            <label class="fw-bold mt-1">Corrective Action</label>
                            <input id="edAction" class="form-control" value="${item.correctiveAction || ''}">
                        </div>
                        ${customInputs}
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Save All Changes',
                confirmButtonColor: '#0A2647',
                preConfirm: () => {
                    const res = {
                        id: document.getElementById('edId').value.trim() || item.id,
                        category: document.getElementById('edCategory').value,
                        area: document.getElementById('edArea').value,
                        frequency: document.getElementById('edFreq').value,
                        plannedDate: document.getElementById('edPlanned').value,
                        completedDate: document.getElementById('edCompleted').value,
                        date: document.getElementById('edCompleted').value,
                        status: document.getElementById('edStatus').value,
                        responsiblePerson: document.getElementById('edResp').value,
                        remarks: document.getElementById('edRemarks').value,
                        correctiveAction: document.getElementById('edAction').value
                    };
                    customCols.forEach(col => {
                        const el = document.getElementById(`edit_cust_${col.key}`);
                        if (el) res[col.key] = el.value;
                    });
                    return res;
                }
            });

            if (formValues) {
                await dataService.update('inspections', id, formValues);
                Swal.fire('Updated', 'Inspection record successfully updated across all columns.', 'success');
                this.app.renderCurrentModule();
            }
        }

        async markComplete(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            await dataService.update('inspections', id, { status: 'Completed' });
            this.app.renderCurrentModule();
        }
        async del(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            if (confirm(`Delete inspection ${id}?`)) {
                await dataService.delete('inspections', id);
                this.app.renderCurrentModule();
            }
        }
        async viewDetails(id) {
            const item = await dataService.getById('inspections', id);
            if (!item) return;
            const dbData = dataService.getDatabase();
            const customCols = dbData.customInspectionColumns || [];
            let customDetails = '';
            customCols.forEach(col => {
                if (item[col.key]) customDetails += `<br><b>${col.label}:</b> ${item[col.key]}`;
            });
            Swal.fire({
                title: item.id,
                html: `<div style="text-align:left; font-size:13.5px; line-height:1.6;"><b>Area:</b> ${item.area}<br><b>Engineer:</b> ${item.responsiblePerson}<br><b>Date:</b> ${item.date}<br><b>Status:</b> <span class="badge bg-info text-dark">${item.status}</span><br><b>Remarks:</b> ${item.remarks}<br><b>Action:</b> ${item.correctiveAction}${customDetails}</div>`,
                confirmButtonColor: '#0A2647'
            });
        }
    }

    class TBTController {
        constructor(app) { this.app = app; this.sortBy = 'sl_asc'; }
        async render() {
            const tbts = await dataService.getAll('tbts');
            if (this.sortBy === 'sl_asc') {
                tbts.sort((a, b) => {
                    const numA = parseInt((String(a.id || '').match(/\d+/) || [0])[0], 10);
                    const numB = parseInt((String(b.id || '').match(/\d+/) || [0])[0], 10);
                    return numA !== numB ? numA - numB : String(a.id || '').localeCompare(String(b.id || ''));
                });
            } else if (this.sortBy === 'sl_desc') {
                tbts.sort((a, b) => {
                    const numA = parseInt((String(a.id || '').match(/\d+/) || [0])[0], 10);
                    const numB = parseInt((String(b.id || '').match(/\d+/) || [0])[0], 10);
                    return numA !== numB ? numB - numA : String(b.id || '').localeCompare(String(a.id || ''));
                });
            } else if (this.sortBy === 'name_asc') {
                tbts.sort((a, b) => String(a.topic || '').localeCompare(String(b.topic || '')));
            } else if (this.sortBy === 'name_desc') {
                tbts.sort((a, b) => String(b.topic || '').localeCompare(String(a.topic || '')));
            } else if (this.sortBy === 'date_desc') {
                tbts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
            } else if (this.sortBy === 'date_asc') {
                tbts.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));
            }
            const user = authService.getCurrentUser();
            const isViewer = user?.role === 'viewer';
            return `
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-users me-2"></i>Daily Toolbox Talk (TBT) Register</h3>
                    <div class="d-flex gap-2 flex-wrap">
                        ${!isViewer ? `<button class="btn btn-erp-primary btn-sm" onclick="window.app.controllers.tbt.openCreate()"><i class="fas fa-plus me-1"></i> Log Today's TBT</button>` : ''}
                        <button class="btn btn-erp-outline btn-sm" onclick="window.app.exportCSV('tbts')"><i class="fas fa-file-csv me-1"></i> Export CSV</button>
                        <button class="btn btn-erp-outline btn-sm" onclick="window.app.printReport('Daily Toolbox Talk Register')"><i class="fas fa-print me-1"></i> Print PDF</button>
                    </div>
                </div>

                <div class="filter-bar d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3 p-3 rounded-3 shadow-sm" style="background: #ffffff; border: 1px solid #E2E8F0;">
                    <div class="d-flex align-items-center flex-wrap gap-2">
                        <label class="fw-bold text-primary m-0 d-flex align-items-center gap-2" for="tbtSortDropdown" style="font-size: 13.5px;">
                            <i class="fas fa-sort-amount-down text-primary"></i> Sort By:
                        </label>
                        <div class="input-group input-group-sm shadow-sm" style="width: auto; min-width: 240px;">
                            <span class="input-group-text bg-light border-end-0 text-secondary"><i class="fas fa-sort"></i></span>
                            <select id="tbtSortDropdown" class="form-select form-select-sm border-start-0 ps-2 fw-semibold" style="color: #0A2647; cursor: pointer; border-color: #CBD5E1;" onchange="window.app.controllers.tbt.handleSort(this.value)">
                                <option value="sl_asc" ${this.sortBy === 'sl_asc' ? 'selected' : ''}>Serial No (Asc)</option>
                                <option value="sl_desc" ${this.sortBy === 'sl_desc' ? 'selected' : ''}>Serial No (Desc)</option>
                                <option value="name_asc" ${this.sortBy === 'name_asc' ? 'selected' : ''}>Topic Name (A-Z)</option>
                                <option value="name_desc" ${this.sortBy === 'name_desc' ? 'selected' : ''}>Topic Name (Z-A)</option>
                                <option value="date_desc" ${this.sortBy === 'date_desc' ? 'selected' : ''}>Date (Latest First)</option>
                                <option value="date_asc" ${this.sortBy === 'date_asc' ? 'selected' : ''}>Date (Oldest First)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="erp-table-container">
                    <div class="erp-card-header">Toolbox Talk Compliance Logs (${tbts.length} records)</div>
                    <div class="table-responsive">
                        <table class="table-erp mb-0">
                            <thead><tr><th>Date</th><th>TOPIC</th><th>Conducted by</th><th>Order No.</th><th>JSA No.</th><th>Attendance</th><th>Actions</th></tr></thead>
                            <tbody>
                                ${tbts.length ? tbts.map(t => `
                                    <tr>
                                        <td>${t.date}</td>
                                        <td class="fw-bold">${t.topic}</td>
                                        <td>${t.trainer}</td>
                                        <td class="fw-bold font-mono text-primary">${t.orderNo || ''}</td>
                                        <td>${t.jsaNo || ''}</td>
                                        <td><span class="badge bg-success">${t.attendance} Workers</span></td>
                                        <td>
                                            ${!isViewer ? `
                                                <button class="btn btn-sm btn-erp-outline p-1 px-2 text-primary" onclick="window.app.controllers.tbt.editTBT('${t.id}')" title="Edit TBT"><i class="fas fa-edit"></i></button>
                                                <button class="btn btn-sm btn-erp-outline p-1 px-2 text-danger" onclick="window.app.controllers.tbt.del('${t.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                                            ` : '<span class="text-muted" style="font-size:11px;">Read-Only</span>'}
                                        </td>
                                    </tr>
                                `).join('') : '<tr><td colspan="7" class="text-center py-4 text-muted">No Toolbox Talks logged yet. Click "Log Daily TBT" above to record a session.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        handleSort(sortVal) { this.sortBy = sortVal; this.app.renderCurrentModule(); }
        async openCreate() {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            const { value: formValues } = await Swal.fire({
                title: '<strong style="color:#0A2647;">Log Daily Safety Toolbox Talk</strong>',
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Date</label>
                        <input id="tbtDate" type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                        <label class="fw-bold mt-2">TOPIC</label>
                        <input id="tbtTopic" class="form-control" placeholder="e.g. Working at Height Safety Precautions">
                        <label class="fw-bold mt-2">Conducted by</label>
                        <input id="tbtTrainer" class="form-control" value="${authService.getCurrentUser()?.name || 'Safety Supervisor'}">
                        <label class="fw-bold mt-2">Order No.</label>
                        <input id="tbtOrderNo" class="form-control" placeholder="Order No.">
                        <label class="fw-bold mt-2">JSA No.</label>
                        <input id="tbtJsaNo" class="form-control" placeholder="JSA No.">
                        <label class="fw-bold mt-2">Attendance</label>
                        <input id="tbtAtt" type="number" class="form-control" value="20">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#0A2647',
                preConfirm: () => {
                    const topic = document.getElementById('tbtTopic').value;
                    if (!topic) { Swal.showValidationMessage('Please enter safety topic'); return false; }
                    return {
                        id: dataService.getNextSerialId('tbts', 'TBT', { date: document.getElementById('tbtDate').value }),
                        topic,
                        trainer: document.getElementById('tbtTrainer').value || 'Safety Officer',
                        orderNo: document.getElementById('tbtOrderNo').value || '',
                        jsaNo: document.getElementById('tbtJsaNo').value || '',
                        attendance: parseInt(document.getElementById('tbtAtt').value || '15'),
                        date: document.getElementById('tbtDate').value
                    };
                }
            });
            if (formValues) {
                await dataService.create('tbts', formValues);
                Swal.fire('Logged', 'Daily TBT successfully recorded.', 'success');
                this.app.renderCurrentModule();
            }
        }
        async editTBT(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            const item = await dataService.getById('tbts', id);
            if (!item) return;
            const { value: formValues } = await Swal.fire({
                title: `<strong style="color:#0A2647;">Edit TBT: ${item.id}</strong>`,
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Date</label>
                        <input id="edTbtDate" type="date" class="form-control" value="${item.date}">
                        <label class="fw-bold mt-2">TOPIC</label>
                        <input id="edTbtTopic" class="form-control" value="${item.topic}">
                        <label class="fw-bold mt-2">Conducted by</label>
                        <input id="edTbtTrainer" class="form-control" value="${item.trainer}">
                        <label class="fw-bold mt-2">Order No.</label>
                        <input id="edTbtOrderNo" class="form-control" value="${item.orderNo || ''}">
                        <label class="fw-bold mt-2">JSA No.</label>
                        <input id="edTbtJsaNo" class="form-control" value="${item.jsaNo || ''}">
                        <label class="fw-bold mt-2">Attendance</label>
                        <input id="edTbtAtt" type="number" class="form-control" value="${item.attendance}">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#0A2647',
                preConfirm: () => ({
                    topic: document.getElementById('edTbtTopic').value,
                    trainer: document.getElementById('edTbtTrainer').value,
                    orderNo: document.getElementById('edTbtOrderNo').value,
                    jsaNo: document.getElementById('edTbtJsaNo').value,
                    attendance: parseInt(document.getElementById('edTbtAtt').value || '0'),
                    date: document.getElementById('edTbtDate').value
                })
            });
            if (formValues) {
                await dataService.update('tbts', id, formValues);
                Swal.fire('Updated', 'TBT record modified.', 'success');
                this.app.renderCurrentModule();
            }
        }
        async del(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            if (confirm('Delete this TBT record?')) {
                await dataService.delete('tbts', id);
                this.app.renderCurrentModule();
            }
        }
    }

    class TrainingController {
        constructor(app) { this.app = app; this.sortBy = 'sl_asc'; }
        async render() {
            const trainings = await dataService.getAll('trainings');
            if (this.sortBy === 'sl_asc') {
                trainings.sort((a, b) => {
                    const numA = parseInt((String(a.id || '').match(/\d+/) || [0])[0], 10);
                    const numB = parseInt((String(b.id || '').match(/\d+/) || [0])[0], 10);
                    return numA !== numB ? numA - numB : String(a.id || '').localeCompare(String(b.id || ''));
                });
            } else if (this.sortBy === 'sl_desc') {
                trainings.sort((a, b) => {
                    const numA = parseInt((String(a.id || '').match(/\d+/) || [0])[0], 10);
                    const numB = parseInt((String(b.id || '').match(/\d+/) || [0])[0], 10);
                    return numA !== numB ? numB - numA : String(b.id || '').localeCompare(String(a.id || ''));
                });
            } else if (this.sortBy === 'name_asc') {
                trainings.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
            } else if (this.sortBy === 'name_desc') {
                trainings.sort((a, b) => String(b.name || '').localeCompare(String(a.name || '')));
            }
            const user = authService.getCurrentUser();
            const isViewer = user?.role === 'viewer';
            return `
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-graduation-cap me-2"></i>Module Safety Training Schedule & Master Register</h3>
                    <div class="d-flex gap-2 flex-wrap">
                        ${!isViewer ? `<button class="btn btn-erp-primary btn-sm" onclick="window.app.controllers.training.openCreate()"><i class="fas fa-plus me-1"></i> Schedule / Add Training</button>` : ''}
                        <button class="btn btn-erp-outline btn-sm" onclick="window.app.exportCSV('trainings')"><i class="fas fa-file-csv me-1"></i> Export CSV</button>
                        <button class="btn btn-erp-outline btn-sm" onclick="window.app.printReport('Module Safety Training Register')"><i class="fas fa-print me-1"></i> Print PDF</button>
                    </div>
                </div>

                <div class="filter-bar d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3 p-3 rounded-3 shadow-sm" style="background: #ffffff; border: 1px solid #E2E8F0;">
                    <div class="d-flex align-items-center flex-wrap gap-2">
                        <label class="fw-bold text-primary m-0 d-flex align-items-center gap-2" for="trgSortDropdown" style="font-size: 13.5px;">
                            <i class="fas fa-sort-amount-down text-primary"></i> Sort By:
                        </label>
                        <div class="input-group input-group-sm shadow-sm" style="width: auto; min-width: 240px;">
                            <span class="input-group-text bg-light border-end-0 text-secondary"><i class="fas fa-sort"></i></span>
                            <select id="trgSortDropdown" class="form-select form-select-sm border-start-0 ps-2 fw-semibold" style="color: #0A2647; cursor: pointer; border-color: #CBD5E1;" onchange="window.app.controllers.training.handleSort(this.value)">
                                <option value="sl_asc" ${this.sortBy === 'sl_asc' ? 'selected' : ''}>Serial No (Asc)</option>
                                <option value="sl_desc" ${this.sortBy === 'sl_desc' ? 'selected' : ''}>Serial No (Desc)</option>
                                <option value="name_asc" ${this.sortBy === 'name_asc' ? 'selected' : ''}>Module Title (A-Z)</option>
                                <option value="name_desc" ${this.sortBy === 'name_desc' ? 'selected' : ''}>Module Title (Z-A)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="row g-4 mb-4">
                </div>
                <div class="erp-table-container">
                    <div class="erp-card-header">Training Master Register (${trainings.length} modules)</div>
                    <div class="table-responsive">
                        <table class="table-erp mb-0">
                            <thead><tr><th>Date</th><th>Topic</th><th>Conducted By</th><th>Attendance</th><th>Actions</th></tr></thead>
                            <tbody>
                                ${trainings.length ? trainings.map(t => `
                                    <tr>
                                        <td>${t.date || ''}</td>
                                        <td class="fw-bold">${t.name}</td>
                                        <td>${t.trainer}</td>
                                        <td><span class="badge bg-success">${t.attendance} Attendees</span></td>
                                        <td>
                                            ${!isViewer ? `
                                                <button class="btn btn-sm btn-erp-outline p-1 px-2 text-primary" onclick="window.app.controllers.training.editTraining('${t.id}')"><i class="fas fa-edit"></i></button>
                                                <button class="btn btn-sm btn-erp-outline p-1 px-2 text-danger" onclick="window.app.controllers.training.del('${t.id}')"><i class="fas fa-trash"></i></button>
                                            ` : '<span class="text-muted" style="font-size:11px;">Read-Only</span>'}
                                        </td>
                                    </tr>
                                `).join('') : '<tr><td colspan="5" class="text-center py-4 text-muted">No training sessions scheduled yet. Click "Schedule / Add Training" above to add one.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        async openCreate() {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            const { value: formValues } = await Swal.fire({
                title: '<strong style="color:#0A2647;">Schedule Module Safety Training</strong>',
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Date</label>
                        <input id="trgDate" type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                        <label class="fw-bold mt-2">Topic</label>
                        <input id="trgName" class="form-control" placeholder="e.g. Scaffolding Inspection Certification">
                        <label class="fw-bold mt-2">Conducted By</label>
                        <input id="trgTrainer" class="form-control" value="Safety Training Institute / NTPC Faculty">
                        <label class="fw-bold mt-2">Attendance</label>
                        <input id="trgAtt" type="number" class="form-control" value="30">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#0A2647',
                preConfirm: () => {
                    const name = document.getElementById('trgName').value;
                    if (!name) { Swal.showValidationMessage('Please enter training module title'); return false; }
                    return {
                        id: dataService.getNextSerialId('trainings', 'TRG'),
                        date: document.getElementById('trgDate').value,
                        name,
                        trainer: document.getElementById('trgTrainer').value,
                        attendance: parseInt(document.getElementById('trgAtt').value || '20')
                    };
                }
            });
            if (formValues) {
                await dataService.create('trainings', formValues);
                Swal.fire('Scheduled', 'Safety training module registered.', 'success');
                this.app.renderCurrentModule();
            }
        }
        async editTraining(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            const item = await dataService.getById('trainings', id);
            if (!item) return;
            const { value: formValues } = await Swal.fire({
                title: `<strong style="color:#0A2647;">Edit Training: ${item.id}</strong>`,
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Date</label>
                        <input id="edTrgDate" type="date" class="form-control" value="${item.date || ''}">
                        <label class="fw-bold mt-2">Topic</label>
                        <input id="edTrgName" class="form-control" value="${item.name}">
                        <label class="fw-bold mt-2">Conducted By</label>
                        <input id="edTrgTrainer" class="form-control" value="${item.trainer}">
                        <label class="fw-bold mt-2">Attendance</label>
                        <input id="edTrgAtt" type="number" class="form-control" value="${item.attendance}">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#0A2647',
                preConfirm: () => ({
                    date: document.getElementById('edTrgDate').value,
                    name: document.getElementById('edTrgName').value,
                    trainer: document.getElementById('edTrgTrainer').value,
                    attendance: parseInt(document.getElementById('edTrgAtt').value || '0')
                })
            });
            if (formValues) {
                await dataService.update('trainings', id, formValues);
                Swal.fire('Updated', 'Training session updated.', 'success');
                this.app.renderCurrentModule();
            }
        }
        async del(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            if (confirm('Delete this training module?')) {
                await dataService.delete('trainings', id);
                this.app.renderCurrentModule();
            }
        }
    }

    class IncidentController {
        constructor(app) { this.app = app; this.sortBy = 'sl_asc'; }
        async render() {
            const incidents = await dataService.getAll('incidents');
            if (this.sortBy === 'sl_asc') {
                incidents.sort((a, b) => {
                    const numA = parseInt((String(a.id || '').match(/\d+/) || [0])[0], 10);
                    const numB = parseInt((String(b.id || '').match(/\d+/) || [0])[0], 10);
                    return numA !== numB ? numA - numB : String(a.id || '').localeCompare(String(b.id || ''));
                });
            } else if (this.sortBy === 'sl_desc') {
                incidents.sort((a, b) => {
                    const numA = parseInt((String(a.id || '').match(/\d+/) || [0])[0], 10);
                    const numB = parseInt((String(b.id || '').match(/\d+/) || [0])[0], 10);
                    return numA !== numB ? numB - numA : String(b.id || '').localeCompare(String(a.id || ''));
                });
            } else if (this.sortBy === 'name_asc') {
                incidents.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
            } else if (this.sortBy === 'name_desc') {
                incidents.sort((a, b) => String(b.name || '').localeCompare(String(a.name || '')));
            }
            const user = authService.getCurrentUser();
            const isViewer = user?.role === 'viewer';
            return `
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-exclamation-triangle me-2"></i>Monthly Incident Recall & Learning Repository</h3>
                    <div class="d-flex gap-2 flex-wrap">
                        ${!isViewer ? `<button class="btn btn-erp-primary btn-sm" onclick="window.app.controllers.incidents.openCreate()"><i class="fas fa-plus me-1"></i> Log Incident Recall</button>` : ''}
                        <button class="btn btn-erp-outline btn-sm" onclick="window.app.exportCSV('incidents')"><i class="fas fa-file-csv me-1"></i> Export CSV</button>
                        <button class="btn btn-erp-outline btn-sm" onclick="window.app.printReport('Monthly Incident Recall Repository')"><i class="fas fa-print me-1"></i> Print PDF</button>
                    </div>
                </div>

                <div class="filter-bar d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3 p-3 rounded-3 shadow-sm" style="background: #ffffff; border: 1px solid #E2E8F0;">
                    <div class="d-flex align-items-center flex-wrap gap-2">
                        <label class="fw-bold text-primary m-0 d-flex align-items-center gap-2" for="incSortDropdown" style="font-size: 13.5px;">
                            <i class="fas fa-sort-amount-down text-primary"></i> Sort By:
                        </label>
                        <div class="input-group input-group-sm shadow-sm" style="width: auto; min-width: 240px;">
                            <span class="input-group-text bg-light border-end-0 text-secondary"><i class="fas fa-sort"></i></span>
                            <select id="incSortDropdown" class="form-select form-select-sm border-start-0 ps-2 fw-semibold" style="color: #0A2647; cursor: pointer; border-color: #CBD5E1;" onchange="window.app.controllers.incidents.handleSort(this.value)">
                                <option value="sl_asc" ${this.sortBy === 'sl_asc' ? 'selected' : ''}>Serial No (Asc)</option>
                                <option value="sl_desc" ${this.sortBy === 'sl_desc' ? 'selected' : ''}>Serial No (Desc)</option>
                                <option value="name_asc" ${this.sortBy === 'name_asc' ? 'selected' : ''}>Incident Title (A-Z)</option>
                                <option value="name_desc" ${this.sortBy === 'name_desc' ? 'selected' : ''}>Incident Title (Z-A)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="row g-4">
                    ${incidents.length ? incidents.map(inc => `
                        <div class="col-md-6">
                            <div class="erp-card h-100 mb-0 border-0 shadow-sm position-relative transition-all" style="border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 4px 20px rgba(10, 38, 71, 0.08); border: 1px solid rgba(10, 38, 71, 0.1) !important;">
                                <!-- Top Sleek Gradient Bar -->
                                <div style="height: 5px; background: linear-gradient(90deg, #0A2647 0%, #2C74B3 50%, #00d2ff 100%);"></div>
                                
                                <!-- Card Header -->
                                <div class="px-3 py-2.5 d-flex justify-content-between align-items-center" style="background: rgba(10, 38, 71, 0.02); border-bottom: 1px solid rgba(10, 38, 71, 0.08);">
                                    <div class="d-flex align-items-center gap-2 flex-wrap">
                                        <span class="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 fw-bold" style="font-size: 11.5px; border-radius: 6px;">
                                            <i class="fas fa-calendar-alt me-1"></i> Date: ${inc.date || inc.week || 'N/A'}
                                        </span>
                                        <span class="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1 fw-bold font-mono" style="font-size: 11.5px; border-radius: 6px;">
                                            Order No: ${inc.orderNo || inc.id || 'N/A'}
                                        </span>
                                    </div>
                                    ${!isViewer ? `
                                        <div class="d-flex align-items-center gap-1.5">
                                            <button class="btn btn-sm btn-light text-primary d-flex align-items-center justify-content-center shadow-sm" style="width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);" onclick="window.app.controllers.incidents.editIncident('${inc.id}')" title="Edit"><i class="fas fa-edit" style="font-size: 13px;"></i></button>
                                            <button class="btn btn-sm btn-light text-danger d-flex align-items-center justify-content-center shadow-sm" style="width: 30px; height: 30px; border-radius: 8px; border: 1px solid rgba(0,0,0,0.05);" onclick="window.app.controllers.incidents.del('${inc.id}')" title="Delete"><i class="fas fa-trash" style="font-size: 13px;"></i></button>
                                        </div>
                                    ` : ''}
                                </div>

                                <!-- Card Body -->
                                <div class="p-3 pt-3 d-flex flex-column justify-content-between" style="flex: 1; padding: 18px !important;">
                                    <div class="mb-3">
                                        <div class="text-uppercase fw-bold mb-1" style="font-size: 11px; color: #64748B; letter-spacing: 0.5px;">Incident Topic</div>
                                        <h5 class="fw-bold mb-0" style="font-size: 16px; line-height: 1.4; color: #0A2647;">
                                            <i class="fas fa-bookmark text-warning me-2"></i>${inc.topic || inc.name || 'Safety Recall Analysis'}
                                        </h5>
                                    </div>

                                    <!-- Footer Info Box -->
                                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-auto p-2.5" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 10px;">
                                        <div class="d-flex align-items-center gap-2">
                                            <div class="rounded-circle d-flex align-items-center justify-content-center text-white shadow-sm" style="width: 32px; height: 32px; background: linear-gradient(135deg, #0A2647, #2C74B3); font-size: 13px;">
                                                <i class="fas fa-user-tie"></i>
                                            </div>
                                            <div>
                                                <div style="font-size: 10px; color: #64748B; text-transform: uppercase; font-weight: 700; line-height: 1.1;">Conducted By</div>
                                                <div class="fw-bold text-dark mt-0.5" style="font-size: 13px;">${inc.conductedBy || 'Safety Department'}</div>
                                            </div>
                                        </div>
                                        <div class="text-end">
                                            <div style="font-size: 10px; color: #64748B; text-transform: uppercase; font-weight: 700; line-height: 1.1;">Attendance</div>
                                            <div class="mt-1">
                                                <span class="badge px-2.5 py-1 shadow-sm d-inline-flex align-items-center gap-1 fw-bold" style="background: #10B981; color: #fff; font-size: 12px; border-radius: 6px;">
                                                    <i class="fas fa-users" style="font-size: 11px;"></i> ${inc.attendance || '0'} Attendees
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('') : '<div class="col-12"><div class="erp-card p-5 text-center text-muted"><i class="fas fa-exclamation-triangle fs-2 mb-2 d-block text-secondary"></i>No incident recall entries logged yet. Click "Log Incident Recall" above to add a record.</div></div>'}
                </div>
            `;
        }
        handleSort(sortVal) { this.sortBy = sortVal; this.app.renderCurrentModule(); }
        async openCreate() {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            const today = new Date().toISOString().split('T')[0];
            const { value: formValues } = await Swal.fire({
                title: '<strong style="color:#0A2647;">Log Monthly Incident Recall</strong>',
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Date <span class="text-danger">*</span></label>
                        <input id="incDate" type="date" class="form-control" value="${today}">
                        <label class="fw-bold mt-2">Order No. <span class="text-danger">*</span></label>
                        <input id="incOrderNo" type="text" class="form-control font-mono" placeholder="e.g. ORD-2026-001">
                        <label class="fw-bold mt-2">Topic <span class="text-danger">*</span></label>
                        <input id="incTopic" type="text" class="form-control" placeholder="e.g. Near-Miss Steam Pipe Gasket Leakage">
                        <label class="fw-bold mt-2">Conducted By <span class="text-danger">*</span></label>
                        <input id="incConductedBy" type="text" class="form-control" placeholder="e.g. Dr. Rajeshwar Rao / Lead Safety Officer">
                        <label class="fw-bold mt-2">Attendance <span class="text-danger">*</span></label>
                        <input id="incAttendance" type="text" class="form-control" placeholder="e.g. 45 Participants">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#0A2647',
                preConfirm: () => {
                    const topic = document.getElementById('incTopic').value.trim();
                    const date = document.getElementById('incDate').value;
                    const orderNo = document.getElementById('incOrderNo').value.trim();
                    const conductedBy = document.getElementById('incConductedBy').value.trim();
                    const attendance = document.getElementById('incAttendance').value.trim();
                    if (!topic || !date || !orderNo) {
                        Swal.showValidationMessage('Please fill in Date, Order No. and Topic');
                        return false;
                    }
                    return {
                        id: dataService.getNextSerialId('incidents', 'INC', { date }),
                        date,
                        orderNo,
                        topic,
                        name: topic,
                        conductedBy: conductedBy || 'Safety Officer',
                        attendance: attendance || '0',
                        fy: window.app?.state?.fy || 'FY 2026-27',
                        month: window.app?.state?.month === 'all' ? 'July' : (window.app?.state?.month || 'July')
                    };
                }
            });
            if (formValues) {
                await dataService.create('incidents', formValues);
                Swal.fire('Logged & Synced', 'Incident recall entry saved and synced to Firebase.', 'success');
                this.app.renderCurrentModule();
            }
        }
        async editIncident(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            const item = await dataService.getById('incidents', id);
            if (!item) return;
            const today = new Date().toISOString().split('T')[0];
            const { value: formValues } = await Swal.fire({
                title: `<strong style="color:#0A2647;">Edit Incident Recall: ${item.id}</strong>`,
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Date <span class="text-danger">*</span></label>
                        <input id="edIncDate" type="date" class="form-control" value="${item.date || today}">
                        <label class="fw-bold mt-2">Order No. <span class="text-danger">*</span></label>
                        <input id="edIncOrderNo" type="text" class="form-control font-mono" value="${item.orderNo || item.id}">
                        <label class="fw-bold mt-2">Topic <span class="text-danger">*</span></label>
                        <input id="edIncTopic" type="text" class="form-control" value="${item.topic || item.name || ''}">
                        <label class="fw-bold mt-2">Conducted By <span class="text-danger">*</span></label>
                        <input id="edIncConductedBy" type="text" class="form-control" value="${item.conductedBy || ''}">
                        <label class="fw-bold mt-2">Attendance <span class="text-danger">*</span></label>
                        <input id="edIncAttendance" type="text" class="form-control" value="${item.attendance || ''}">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#0A2647',
                preConfirm: () => {
                    const topic = document.getElementById('edIncTopic').value.trim();
                    const date = document.getElementById('edIncDate').value;
                    const orderNo = document.getElementById('edIncOrderNo').value.trim();
                    const conductedBy = document.getElementById('edIncConductedBy').value.trim();
                    const attendance = document.getElementById('edIncAttendance').value.trim();
                    if (!topic || !date || !orderNo) {
                        Swal.showValidationMessage('Please fill in Date, Order No. and Topic');
                        return false;
                    }
                    return {
                        date,
                        orderNo,
                        topic,
                        name: topic,
                        conductedBy: conductedBy || 'Safety Officer',
                        attendance: attendance || '0'
                    };
                }
            });
            if (formValues) {
                await dataService.update('incidents', id, formValues);
                Swal.fire('Updated & Synced', 'Incident recall modified and synced to Firebase.', 'success');
                this.app.renderCurrentModule();
            }
        }
        async del(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            if (confirm('Delete this incident recall record?')) {
                await dataService.delete('incidents', id);
                this.app.renderCurrentModule();
            }
        }
    }

    class ReportsController {
        constructor(app) { this.app = app; this.sortBy = 'sl_asc'; }
        async render() {
            const items = await dataService.getAll('inspections');
            if (this.sortBy === 'sl_asc') {
                items.sort((a, b) => {
                    const numA = parseInt((String(a.id || '').match(/\d+/) || [0])[0], 10);
                    const numB = parseInt((String(b.id || '').match(/\d+/) || [0])[0], 10);
                    return numA !== numB ? numA - numB : String(a.id || '').localeCompare(String(b.id || ''));
                });
            } else if (this.sortBy === 'sl_desc') {
                items.sort((a, b) => {
                    const numA = parseInt((String(a.id || '').match(/\d+/) || [0])[0], 10);
                    const numB = parseInt((String(b.id || '').match(/\d+/) || [0])[0], 10);
                    return numA !== numB ? numB - numA : String(b.id || '').localeCompare(String(a.id || ''));
                });
            } else if (this.sortBy === 'name_asc') {
                items.sort((a, b) => String(a.category || '').localeCompare(String(b.category || '')));
            } else if (this.sortBy === 'name_desc') {
                items.sort((a, b) => String(b.category || '').localeCompare(String(a.category || '')));
            }
            const tbts = await dataService.getAll('tbts');
            const trainings = await dataService.getAll('trainings');
            return `
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-file-alt me-2"></i>Safety Reports Generator</h3>
                    <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-erp-primary btn-sm" onclick="window.app.exportCSV('inspections')"><i class="fas fa-file-csv me-1"></i> Export Master CSV</button>
                        <button class="btn btn-erp-outline btn-sm" onclick="window.app.printReport('Safety Executive Audit Summary')"><i class="fas fa-print me-1"></i> Print Executive PDF Report</button>
                    </div>
                </div>
                <div class="row g-3 mb-4">
                    <div class="col-md-4">
                        <div class="erp-card p-3 bg-light border-start border-4 border-primary">
                            <h6 class="text-muted mb-1">Total Inspections Logged</h6>
                            <h3 class="fw-bold text-primary mb-0">${items.length} Records</h3>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="erp-card p-3 bg-light border-start border-4 border-success">
                            <h6 class="text-muted mb-1">Daily TBT Sessions Conducted</h6>
                            <h3 class="fw-bold text-success mb-0">${tbts.length} Sessions</h3>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="erp-card p-3 bg-light border-start border-4 border-warning">
                            <h6 class="text-muted mb-1">Training Modules Active</h6>
                            <h3 class="fw-bold text-warning mb-0">${trainings.length} Modules</h3>
                        </div>
                    </div>
                </div>

                <div class="filter-bar d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3 p-3 rounded-3 shadow-sm" style="background: #ffffff; border: 1px solid #E2E8F0;">
                    <div class="d-flex align-items-center flex-wrap gap-2">
                        <label class="fw-bold text-primary m-0 d-flex align-items-center gap-2" for="repSortDropdown" style="font-size: 13.5px;">
                            <i class="fas fa-sort-amount-down text-primary"></i> Sort Audit Trail By:
                        </label>
                        <div class="input-group input-group-sm shadow-sm" style="width: auto; min-width: 240px;">
                            <span class="input-group-text bg-light border-end-0 text-secondary"><i class="fas fa-sort"></i></span>
                            <select id="repSortDropdown" class="form-select form-select-sm border-start-0 ps-2 fw-semibold" style="color: #0A2647; cursor: pointer; border-color: #CBD5E1;" onchange="window.app.controllers.reports.handleSort(this.value)">
                                <option value="sl_asc" ${this.sortBy === 'sl_asc' ? 'selected' : ''}>Serial No (Asc)</option>
                                <option value="sl_desc" ${this.sortBy === 'sl_desc' ? 'selected' : ''}>Serial No (Desc)</option>
                                <option value="name_asc" ${this.sortBy === 'name_asc' ? 'selected' : ''}>Category / Activity (A-Z)</option>
                                <option value="name_desc" ${this.sortBy === 'name_desc' ? 'selected' : ''}>Category / Activity (Z-A)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="erp-table-container">
                    <div class="erp-card-header">Consolidated Safety Audit Trail (North Karanpura Plant)</div>
                    <div class="table-responsive">
                        <table class="table-erp mb-0">
                            <thead><tr><th>ID</th><th>Category</th><th>Plant Area</th><th>Responsible Engineer</th><th>Date</th><th>Status</th></tr></thead>
                            <tbody>
                                ${items.map(i => `<tr><td class="font-mono text-primary fw-bold">${i.id}</td><td>${i.category}</td><td><span class="badge bg-secondary">${i.area}</span></td><td>${i.responsiblePerson}</td><td>${i.date}</td><td><span class="badge-erp ${i.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${i.status}</span></td></tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        handleSort(sortVal) { this.sortBy = sortVal; this.app.renderCurrentModule(); }
    }

    class CalendarController {
        constructor(app) { this.app = app; }
        async render() {
            const user = authService.getCurrentUser();
            const isViewer = user?.role === 'viewer';
            const calItems = dataService.getDatabase().calendarItems || [];
            return `
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-calendar-check me-2"></i>Plant Safety Calendar & Deadlines</h3>
                    <div class="d-flex gap-2">
                        ${!isViewer ? `<button class="btn btn-erp-primary btn-sm" onclick="window.app.controllers.calendar.openAdd()"><i class="fas fa-plus me-1"></i> Add Deadline</button>` : ''}
                        <button class="btn btn-erp-outline btn-sm" onclick="window.app.printReport('Safety Compliance Calendar')"><i class="fas fa-print me-1"></i> Print PDF</button>
                    </div>
                </div>
                <div class="erp-table-container">
                    <div class="erp-card-header">Compliance Matrix FY ${this.app.state.fy} (${calItems.length} items)</div>
                    <div class="table-responsive">
                        <table class="table-erp mb-0">
                            <thead><tr><th>Date</th><th>Type</th><th>Activity Description</th><th>Target Conducted By</th><th>Target Area</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                ${calItems.length ? calItems.map(item => `
                                    <tr>
                                        <td class="fw-bold text-primary">${item.date || item.dateRange || ''}</td>
                                        <td><span class="badge ${item.type === 'Cutoff' ? 'bg-danger' : 'bg-warning text-dark'}">${item.type}</span></td>
                                        <td class="fw-bold">${item.desc}</td>
                                        <td>${item.conductedBy || ''}</td>
                                        <td>${item.area}</td>
                                        <td><span class="badge bg-info text-dark">${item.status}</span></td>
                                        <td>
                                            ${!isViewer ? `<button class="btn btn-sm text-danger" onclick="window.app.controllers.calendar.del('${item.id}')"><i class="fas fa-trash"></i></button>` : '-'}
                                        </td>
                                    </tr>
                                `).join('') : '<tr><td colspan="6" class="text-center py-4 text-muted">No safety deadlines scheduled yet. Click "Add Deadline" above to record one.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        }
        async openAdd() {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            const { value: vals } = await Swal.fire({
                title: 'Add Compliance Deadline',
                html: `
                    <div style="text-align:left;">
                        <label class="fw-bold mt-2">Date</label>
                        <input id="calDate" type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                        <label class="fw-bold mt-2">Type</label>
                        <select id="calType" class="form-select"><option value="Quarterly Due">Quarterly Due</option><option value="Cutoff">Cutoff</option><option value="Monthly Review">Monthly Review</option></select>
                        <label class="fw-bold mt-2">Description</label>
                        <input id="calDesc" class="form-control" placeholder="e.g. Fire Hydrant Pressure Verification">
                        <label class="fw-bold mt-2">Target Conducted By</label>
                        <input id="calConductedBy" class="form-control" placeholder="Conducted By">
                        <label class="fw-bold mt-2">Target Area</label>
                        <input id="calArea" class="form-control" placeholder="Target Area">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#0A2647',
                preConfirm: () => ({
                    id: dataService.getNextSerialId('calendarItems', 'CAL', { date: document.getElementById('calDate').value }),
                    date: document.getElementById('calDate').value,
                    type: document.getElementById('calType').value,
                    desc: document.getElementById('calDesc').value,
                    conductedBy: document.getElementById('calConductedBy').value,
                    area: document.getElementById('calArea').value,
                    status: "Scheduled"
                })
            });
            if (vals) {
                const db = dataService.getDatabase();
                if (!db.calendarItems) db.calendarItems = [];
                db.calendarItems.push(vals);
                dataService.saveDatabase(db);
                this.app.renderCurrentModule();
            }
        }
        del(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            if (confirm("Delete deadline?")) {
                const db = dataService.getDatabase();
                db.calendarItems = (db.calendarItems || []).filter(c => c.id !== id);
                dataService.saveDatabase(db);
                this.app.renderCurrentModule();
            }
        }
    }

    class GalleryController {
        constructor(app) {
            this.app = app;
            this.selectedArea = 'All';
        }
        selectArea(area) {
            this.selectedArea = area;
            this.app.renderCurrentModule();
        }
        async render() {
            const user = authService.getCurrentUser();
            const isViewer = user?.role === 'viewer';
            const db = dataService.getDatabase();
            const galleryList = db.gallery || [];
            const areas = ['All', ...new Set(galleryList.map(g => g.area || 'Main Plant'))];
            const filteredList = this.selectedArea && this.selectedArea !== 'All' ? galleryList.filter(g => g.area === this.selectedArea) : galleryList;

            return `
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-images me-2"></i>Plant Safety Photo Repository</h3>
                    <div class="d-flex gap-2">
                        ${!isViewer ? `<button class="btn btn-erp-primary btn-sm" onclick="window.app.controllers.gallery.openAdd()"><i class="fas fa-cloud-upload-alt me-1"></i> Upload / Add Safety Photo</button>` : ''}
                        <button class="btn btn-erp-outline btn-sm" onclick="window.app.printReport('Safety Photo Gallery Audit')"><i class="fas fa-print me-1"></i> Print Gallery PDF</button>
                    </div>
                </div>

                <!-- Clean Filter Strip with ERP Theme -->
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        ${areas.map(a => `
                            <button class="btn btn-sm ${this.selectedArea === a || (!this.selectedArea && a === 'All') ? 'btn-erp-primary fw-bold px-3 shadow-sm' : 'btn-erp-outline px-3'}" onclick="window.app.controllers.gallery.selectArea('${a}')" style="border-radius: 6px; font-size: 13px;">
                                ${a} <span class="badge ${this.selectedArea === a || (!this.selectedArea && a === 'All') ? 'bg-white text-primary' : 'bg-secondary'} ms-1">${a === 'All' ? galleryList.length : galleryList.filter(i => i.area === a).length}</span>
                            </button>
                        `).join('')}
                    </div>
                    <small class="text-muted">Showing <strong>${filteredList.length}</strong> photos</small>
                </div>

                <!-- Clean Minimal Grid with Standard ERP Cards -->
                <div class="row g-4">
                    ${filteredList.length ? filteredList.map(img => `
                        <div class="col-md-6 col-lg-4">
                            <div class="erp-card p-3 h-100 d-flex flex-column justify-content-between" style="transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(0,0,0,0.08)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow=''">
                                <div>
                                    <div class="position-relative overflow-hidden rounded border mb-3" style="cursor: pointer; height: 180px;" onclick="window.app.controllers.gallery.openLightbox('${img.id}')" title="Click to view full picture">
                                        <img src="${img.url}" onerror="this.src='assets/power-plant-bg.svg'" class="w-100 h-100" style="object-fit: cover;">
                                        <div class="position-absolute bottom-0 end-0 m-2">
                                            <span class="badge bg-dark bg-opacity-75 text-white px-2 py-1 shadow" style="font-size: 11px;"><i class="fas fa-expand me-1"></i>View Full</span>
                                        </div>
                                    </div>
                                    <div class="d-flex justify-content-between align-items-start mb-1 gap-2">
                                        <h6 class="fw-bold text-primary m-0 text-truncate" style="cursor: pointer;" onclick="window.app.controllers.gallery.openLightbox('${img.id}')" title="${img.title || 'Safety Observation'}">${img.title || 'Safety Observation'}</h6>
                                        <span class="badge bg-secondary ms-1 font-monospace" style="font-size: 11px;">${img.area || 'Main Plant'}</span>
                                    </div>
                                    <small class="text-muted d-block mb-3">
                                        <i class="fas fa-calendar-alt me-1"></i> Date: ${img.date || 'N/A'}
                                        ${img.remarks ? `<span class="ms-2 border-start ps-2 text-truncate d-inline-block" style="max-width: 140px; vertical-align: bottom;" title="${img.remarks}">${img.remarks}</span>` : ''}
                                    </small>
                                </div>
                                <div class="d-flex justify-content-between align-items-center border-top pt-2">
                                    <button class="btn btn-sm btn-erp-outline text-success fw-bold py-1 px-2 d-flex align-items-center gap-1" onclick="window.app.controllers.gallery.downloadPhotoAsPNG('${encodeURIComponent(img.url)}', '${encodeURIComponent(img.title || 'safety_photo')}', '${img.id}')" title="Download as PNG">
                                        <i class="fas fa-file-download"></i> PNG
                                    </button>
                                    ${!isViewer ? `
                                        <div class="d-flex gap-2">
                                            <button class="btn btn-sm btn-erp-outline text-primary py-1 px-2" onclick="window.app.controllers.gallery.editPhoto('${img.id}')" title="Edit"><i class="fas fa-edit me-1"></i> Edit</button>
                                            <button class="btn btn-sm btn-erp-outline text-danger py-1 px-2" onclick="window.app.controllers.gallery.delPhoto('${img.id}')" title="Delete"><i class="fas fa-trash me-1"></i> Delete</button>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('') : '<div class="col-12"><div class="erp-card p-5 text-center text-muted"><i class="fas fa-images fs-2 mb-2 d-block text-secondary"></i>No safety photos uploaded yet or matching the filter.</div></div>'}
                </div>
            `;
        }
        async openAdd() {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            const { value: vals } = await Swal.fire({
                title: '<strong style="color:#0A2647;">Upload Safety Photo (.JPG / .PNG)</strong>',
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Photo Caption / Title</label>
                        <input id="galTitle" class="form-control" placeholder="e.g. CHP Fire Extinguisher Refill Inspection">
                        <label class="fw-bold mt-2">Plant Area</label>
                        <select id="galArea" class="form-select">
                            <option value="Main Plant">Main Plant</option>
                            <option value="CHP">CHP (Coal Handling)</option>
                            <option value="Ash Pond">Ash Pond</option>
                            <option value="Switchyard">Switchyard</option>
                            <option value="Township">Township</option>
                        </select>
                        <label class="fw-bold mt-2">Inspection Date</label>
                        <input id="galDate" type="date" class="form-control" value="${new Date().toISOString().split('T')[0]}">
                        <label class="fw-bold mt-2 text-primary"><i class="fas fa-file-image me-1"></i>Upload Photo File (.JPG / .PNG)</label>
                        <input id="galFile" type="file" accept=".jpg,.jpeg,.png" class="form-control mt-1">
                        <small class="text-danger d-block mt-1 fw-bold"><i class="fas fa-exclamation-triangle me-1"></i>Warning: Please upload file less than 1 MB</small>
                        <label class="fw-bold mt-2 text-muted" style="font-size:11px;">Or Image URL / Path (Optional)</label>
                        <input id="galUrl" class="form-control form-control-sm" placeholder="Optional URL fallback">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#0A2647',
                confirmButtonText: '<i class="fas fa-cloud-upload-alt me-1"></i> Upload & Save',
                preConfirm: async () => {
                    const title = document.getElementById('galTitle').value;
                    if (!title) { Swal.showValidationMessage('Please enter photo title'); return false; }
                    const fileInput = document.getElementById('galFile');
                    let photoUrl = document.getElementById('galUrl').value;
                    if (fileInput && fileInput.files && fileInput.files[0]) {
                        const file = fileInput.files[0];
                        if (file.size > 1024 * 1024) {
                            Swal.showValidationMessage('<i class="fas fa-exclamation-circle me-1"></i> File size exceeds 1 MB limit! Please upload less than 1 MB.');
                            return false;
                        }
                        if (typeof Swal !== 'undefined') {
                            Swal.showLoading();
                            const btn = Swal.getConfirmButton();
                            if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Uploading...';
                        }
                        try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('upload_preset', 'y0w90wvw');
                            const response = await fetch('https://api.cloudinary.com/v1_1/zulcs60r/auto/upload', {
                                method: 'POST',
                                body: formData
                            });
                            const data = await response.json();
                            if (data && data.secure_url) {
                                photoUrl = data.secure_url;
                            } else {
                                console.error("Cloudinary upload error:", data);
                            }
                        } catch (e) {
                            console.error("Cloudinary API request failed:", e);
                        }
                        if (!photoUrl || photoUrl === '') {
                            photoUrl = await new Promise((resolve, reject) => {
                                const reader = new FileReader();
                                reader.onload = e => resolve(e.target.result);
                                reader.onerror = err => reject(err);
                                reader.readAsDataURL(file);
                            });
                        }
                    } else if (!photoUrl) {
                        photoUrl = 'assets/power-plant-bg.svg';
                    }
                    return {
                        id: dataService.getNextSerialId('gallery', 'GAL', { date: document.getElementById('galDate').value }),
                        title,
                        area: document.getElementById('galArea').value,
                        date: document.getElementById('galDate').value,
                        url: photoUrl
                    };
                }
            });
            if (vals) {
                const db = dataService.getDatabase();
                if (!db.gallery) db.gallery = [];
                db.gallery.unshift(vals);
                dataService.saveDatabase(db);
                Swal.fire('Uploaded!', 'Safety photo uploaded & saved to repository.', 'success');
                this.app.renderCurrentModule();
            }
        }
        async editPhoto(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            const db = dataService.getDatabase();
            const img = (db.gallery || []).find(g => g.id === id);
            if (!img) return;
            const { value: vals } = await Swal.fire({
                title: `<strong style="color:#0A2647;">Edit Photo Details</strong>`,
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Title</label>
                        <input id="edGalTitle" class="form-control" value="${img.title}">
                        <label class="fw-bold mt-2">Area</label>
                        <input id="edGalArea" class="form-control" value="${img.area}">
                        <label class="fw-bold mt-2">Date</label>
                        <input id="edGalDate" type="date" class="form-control" value="${img.date}">
                        <label class="fw-bold mt-2 text-primary">Replace Photo (.JPG / .PNG)</label>
                        <input id="edGalFile" type="file" accept=".jpg,.jpeg,.png" class="form-control mt-1">
                        <small class="text-danger d-block mt-1 fw-bold"><i class="fas fa-exclamation-triangle me-1"></i>Warning: Please upload file less than 1 MB</small>
                        <label class="fw-bold mt-2 text-muted" style="font-size:11px;">Or Image URL</label>
                        <input id="edGalUrl" class="form-control form-control-sm" value="${img.url}">
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#0A2647',
                preConfirm: async () => {
                    const fileInput = document.getElementById('edGalFile');
                    let photoUrl = document.getElementById('edGalUrl').value;
                    if (fileInput && fileInput.files && fileInput.files[0]) {
                        const file = fileInput.files[0];
                        if (file.size > 1024 * 1024) {
                            Swal.showValidationMessage('<i class="fas fa-exclamation-circle me-1"></i> File size exceeds 1 MB limit! Please upload less than 1 MB.');
                            return false;
                        }
                        if (typeof Swal !== 'undefined') {
                            Swal.showLoading();
                            const btn = Swal.getConfirmButton();
                            if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Uploading...';
                        }
                        try {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('upload_preset', 'y0w90wvw');
                            const response = await fetch('https://api.cloudinary.com/v1_1/zulcs60r/auto/upload', {
                                method: 'POST',
                                body: formData
                            });
                            const data = await response.json();
                            if (data && data.secure_url) {
                                photoUrl = data.secure_url;
                            } else {
                                console.error("Cloudinary upload error:", data);
                            }
                        } catch (e) {
                            console.error("Cloudinary API request failed:", e);
                        }
                        if (!photoUrl || photoUrl === document.getElementById('edGalUrl').value) {
                            photoUrl = await new Promise((resolve) => {
                                const reader = new FileReader();
                                reader.onload = e => resolve(e.target.result);
                                reader.readAsDataURL(file);
                            });
                        }
                    }
                    return {
                        title: document.getElementById('edGalTitle').value,
                        area: document.getElementById('edGalArea').value,
                        date: document.getElementById('edGalDate').value,
                        url: photoUrl
                    };
                }
            });
            if (vals) {
                img.title = vals.title; img.area = vals.area; img.date = vals.date; img.url = vals.url;
                dataService.saveDatabase(db);
                Swal.fire('Updated', 'Photo details modified.', 'success');
                this.app.renderCurrentModule();
            }
        }
        delPhoto(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            if (confirm("Delete this safety photo?")) {
                const db = dataService.getDatabase();
                db.gallery = (db.gallery || []).filter(g => g.id !== id);
                dataService.saveDatabase(db);
                this.app.renderCurrentModule();
            }
        }
        openLightbox(id) {
            const db = dataService.getDatabase();
            const gallery = db.gallery || [];
            this.currentPhotoIndex = gallery.findIndex(g => g.id === id);
            if (this.currentPhotoIndex === -1 && gallery.length > 0) this.currentPhotoIndex = 0;
            if (!gallery.length) return;
            this.currentZoom = 1;

            let modalEl = document.getElementById('lightboxModal');
            if (!modalEl) {
                const holder = document.getElementById('modalHolder') || document.body;
                const div = document.createElement('div');
                div.innerHTML = `
                    <div class="modal fade" id="lightboxModal" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-fullscreen">
                            <div class="modal-content" style="background: rgba(10, 25, 47, 0.96); backdrop-filter: blur(14px); color: #fff; border: none;">
                                <!-- Top Navigation & Toolbar Bar -->
                                <div class="d-flex justify-content-between align-items-center p-3 px-4 border-bottom border-secondary border-opacity-25 shadow" style="background: rgba(0,0,0,0.5); z-index: 1060;">
                                    <div class="d-flex align-items-center gap-3 overflow-hidden">
                                        <span id="lightboxCounter" class="badge bg-primary px-3 py-2 font-mono fs-6 shadow-sm">1 / 1</span>
                                        <div class="text-truncate">
                                            <h5 id="lightboxTitle" class="m-0 fw-bold text-warning text-truncate">Photo Title</h5>
                                            <div class="d-flex align-items-center gap-2 mt-1">
                                                <span id="lightboxArea" class="badge bg-secondary">Main Plant</span>
                                                <small id="lightboxDate" class="text-light opacity-75"><i class="fas fa-calendar-alt me-1"></i> Date: </small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="d-flex align-items-center gap-2 flex-wrap">
                                        <div class="btn-group shadow-sm" role="group">
                                            <button type="button" class="btn btn-dark border-secondary border-opacity-50 text-white px-3" onclick="window.app.controllers.gallery.zoomLightbox(-0.25)" title="Zoom Out"><i class="fas fa-search-minus"></i></button>
                                            <button type="button" id="lightboxZoomText" class="btn btn-dark border-secondary border-opacity-50 text-info font-mono fw-bold px-3" onclick="window.app.controllers.gallery.zoomLightbox(0)" title="Reset Zoom to 100%">100%</button>
                                            <button type="button" class="btn btn-dark border-secondary border-opacity-50 text-white px-3" onclick="window.app.controllers.gallery.zoomLightbox(0.25)" title="Zoom In"><i class="fas fa-search-plus"></i></button>
                                        </div>
                                        <button type="button" class="btn btn-success fw-bold shadow-sm d-flex align-items-center gap-2 px-3 ms-2" onclick="window.app.controllers.gallery.downloadCurrentPhoto()" title="Download Photo">
                                            <i class="fas fa-download"></i> <span class="d-none d-md-inline">Download</span>
                                        </button>
                                        <button type="button" class="btn btn-danger rounded-circle shadow-lg d-flex align-items-center justify-content-center ms-3" style="width: 44px; height: 44px; border: 2px solid rgba(255,255,255,0.4);" data-bs-dismiss="modal" title="Close Lightbox">
                                            <i class="fas fa-times fs-5 text-white"></i>
                                        </button>
                                    </div>
                                </div>
                                <!-- Center Image Viewport with Prev/Next Arrows -->
                                <div class="modal-body p-0 position-relative d-flex align-items-center justify-content-center overflow-hidden" style="height: calc(100vh - 80px); user-select: none;">
                                    <button type="button" class="btn btn-dark rounded-circle position-absolute start-0 ms-4 shadow-lg d-flex align-items-center justify-content-center" style="width: 56px; height: 56px; z-index: 1055; border: 2px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.7); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" onclick="window.app.controllers.gallery.navigateLightbox(-1)" title="Previous Photo (Left Arrow)">
                                        <i class="fas fa-chevron-left fs-4 text-white"></i>
                                    </button>
                                    <div class="w-100 h-100 d-flex align-items-center justify-content-center overflow-auto p-4">
                                        <img id="lightboxImage" src="" class="img-fluid rounded shadow-lg" style="max-height: 85vh; max-width: 85vw; object-fit: contain; transition: transform 0.25s ease-out; transform-origin: center center;">
                                    </div>
                                    <button type="button" class="btn btn-dark rounded-circle position-absolute end-0 me-4 shadow-lg d-flex align-items-center justify-content-center" style="width: 56px; height: 56px; z-index: 1055; border: 2px solid rgba(255,255,255,0.3); background: rgba(0,0,0,0.7); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'" onclick="window.app.controllers.gallery.navigateLightbox(1)" title="Next Photo (Right Arrow)">
                                        <i class="fas fa-chevron-right fs-4 text-white"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                holder.appendChild(div.firstElementChild);
                modalEl = document.getElementById('lightboxModal');

                if (!window._galleryKeyHandler) {
                    window._galleryKeyHandler = (e) => {
                        const modal = document.getElementById('lightboxModal');
                        if (!modal || !modal.classList.contains('show')) return;
                        if (e.key === 'ArrowLeft') window.app.controllers.gallery.navigateLightbox(-1);
                        if (e.key === 'ArrowRight') window.app.controllers.gallery.navigateLightbox(1);
                        if (e.key === '+' || e.key === '=') window.app.controllers.gallery.zoomLightbox(0.25);
                        if (e.key === '-') window.app.controllers.gallery.zoomLightbox(-0.25);
                        if (e.key === '0' || e.key === 'Escape' || e.key === ' ') {
                            if (e.key === '0') window.app.controllers.gallery.zoomLightbox(0);
                        }
                    };
                    window.addEventListener('keydown', window._galleryKeyHandler);
                }
            }

            this.updateLightboxView();
            const bsModal = bootstrap.Modal.getOrCreateInstance(modalEl);
            bsModal.show();
        }
        updateLightboxView() {
            const db = dataService.getDatabase();
            const gallery = db.gallery || [];
            if (!gallery.length || this.currentPhotoIndex < 0 || this.currentPhotoIndex >= gallery.length) return;
            const img = gallery[this.currentPhotoIndex];
            const imgEl = document.getElementById('lightboxImage');
            if (imgEl) imgEl.src = img.url;
            const titleEl = document.getElementById('lightboxTitle');
            if (titleEl) titleEl.textContent = img.title;
            const areaEl = document.getElementById('lightboxArea');
            if (areaEl) areaEl.textContent = img.area;
            const dateEl = document.getElementById('lightboxDate');
            if (dateEl) dateEl.innerHTML = `<i class="fas fa-calendar-alt me-1"></i> Date: ${img.date}`;
            const counterEl = document.getElementById('lightboxCounter');
            if (counterEl) counterEl.textContent = `${this.currentPhotoIndex + 1} / ${gallery.length}`;
            this.currentZoom = 1;
            this.applyZoom();
        }
        navigateLightbox(dir) {
            const db = dataService.getDatabase();
            const gallery = db.gallery || [];
            if (!gallery.length) return;
            this.currentPhotoIndex = (this.currentPhotoIndex + dir + gallery.length) % gallery.length;
            this.updateLightboxView();
        }
        zoomLightbox(step) {
            if (step === 0) {
                this.currentZoom = 1;
            } else {
                this.currentZoom = Math.max(0.5, Math.min(3.5, this.currentZoom + step));
            }
            this.applyZoom();
        }
        applyZoom() {
            const imgEl = document.getElementById('lightboxImage');
            const textEl = document.getElementById('lightboxZoomText');
            if (imgEl) {
                imgEl.style.transform = `scale(${this.currentZoom})`;
            }
            if (textEl) {
                textEl.textContent = `${Math.round(this.currentZoom * 100)}%`;
            }
        }
        downloadCurrentPhoto() {
            const db = dataService.getDatabase();
            const gallery = db.gallery || [];
            const img = gallery[this.currentPhotoIndex];
            if (!img) return;
            this.downloadPhotoAsPNG(img.url, img.title, img.id);
        }
        downloadPhotoAsPNG(urlParam, titleParam, id) {
            let url = urlParam;
            let title = titleParam;
            try { if (url.includes('%')) url = decodeURIComponent(url); } catch (e) { }
            try { if (title && title.includes('%')) title = decodeURIComponent(title); } catch (e) { }

            const safeName = (title || 'Safety_Photo').replace(/[^a-zA-Z0-9_\-]/g, '_');
            const filename = `NTPC_Safety_Record_${id || 'IMG'}_${safeName}.png`;

            // If it is a base64 Data URL or we can draw it on canvas
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth || img.width;
                    canvas.height = img.naturalHeight || img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const pngUrl = canvas.toDataURL('image/png');
                    const a = document.createElement('a');
                    a.href = pngUrl;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                } catch (err) {
                    // Fallback if CORS tainted canvas
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                }
            };
            img.onerror = () => {
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
            img.src = url;
        }
    }

    class DocumentController {
        constructor(app) { this.app = app; }
        async render() {
            const docs = await dataService.getAll('documents');
            const user = authService.getCurrentUser();
            const isViewer = user?.role === 'viewer';
            return `
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <h3 class="m-0 text-primary fw-bold"><i class="fas fa-folder-open me-2"></i>Digital Safety Document Library</h3>
                    <div class="d-flex gap-2">
                        ${!isViewer ? `<button class="btn btn-erp-primary btn-sm" onclick="window.app.controllers.documents.openAdd()"><i class="fas fa-plus me-1"></i> Upload Document</button>` : ''}
                        <button class="btn btn-erp-outline btn-sm" onclick="window.app.printReport('Digital Document Library')"><i class="fas fa-print me-1"></i> Print Index</button>
                    </div>
                </div>
                <div class="row g-3">
                    ${docs.length ? docs.map(d => {
                const iconClass = d.title && (d.title.toLowerCase().endsWith('.xlsx') || d.title.toLowerCase().endsWith('.xls') || d.category === 'Checklist') ? 'fa-file-excel text-success' : 'fa-file-pdf text-danger';
                return `
                        <div class="col-md-6">
                            <div class="erp-card p-3 d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center gap-3 overflow-hidden me-2">
                                    <i class="fas ${iconClass} fs-1 flex-shrink-0"></i>
                                    <div class="overflow-hidden">
                                        <h6 class="fw-bold mb-1 text-primary text-truncate" title="${d.title}">${d.title}</h6>
                                        <small class="text-muted d-block text-truncate">${d.category} | ${d.size || '1.2 MB'} | Author: ${d.author || 'NTPC Safety'}</small>
                                    </div>
                                </div>
                                <div class="d-flex gap-1 flex-shrink-0">
                                    ${d.fileData || d.url ? `<button type="button" onclick="window.app.controllers.documents.downloadDoc('${d.id}')" class="btn btn-sm btn-erp-primary py-1 px-2" title="Download / Open File"><i class="fas fa-download"></i></button>` : `<button type="button" onclick="Swal.fire('Info', 'No file attached. Click Edit to upload a PDF or XLSX file.', 'info')" class="btn btn-sm btn-erp-outline py-1 px-2" title="No file attached"><i class="fas fa-download"></i></button>`}
                                    ${!isViewer ? `
                                        <button class="btn btn-sm btn-erp-outline text-primary py-1 px-2" onclick="window.app.controllers.documents.editDoc('${d.id}')" title="Edit & Upload File"><i class="fas fa-edit"></i></button>
                                        <button class="btn btn-sm btn-erp-outline text-danger py-1 px-2" onclick="window.app.controllers.documents.delDoc('${d.id}')" title="Delete"><i class="fas fa-trash"></i></button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
            }).join('') : '<div class="col-12"><div class="erp-card p-5 text-center text-muted"><i class="fas fa-folder-open fs-2 mb-2 d-block text-secondary"></i>No safety documents uploaded yet. Click "Upload Document" above to add files.</div></div>'}
                </div>
            `;
        }
        async downloadDoc(idOrUrl, encodedTitle) {
            try {
                let base64Data = null;
                let fileName = 'document';
                if (idOrUrl && (idOrUrl.startsWith('DOC-') || !idOrUrl.includes('//') && !idOrUrl.startsWith('data:'))) {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            title: 'Retrieving Document...',
                            text: 'Please wait while we fetch the document from Firestore.',
                            allowOutsideClick: false,
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });
                    }
                    const doc = await dataService.getById('documents', idOrUrl);
                    if (!doc) {
                        if (typeof Swal !== 'undefined') Swal.close();
                        Swal.fire('Error', 'Document not found.', 'error');
                        return;
                    }
                    base64Data = doc.fileData || doc.url;
                    fileName = doc.fileName || doc.title || 'document';
                } else {
                    base64Data = decodeURIComponent(idOrUrl);
                    fileName = decodeURIComponent(encodedTitle || 'document');
                }
                if (!base64Data) {
                    if (typeof Swal !== 'undefined') Swal.close();
                    Swal.fire('Error', 'No file attachment found for this document.', 'error');
                    return;
                }
                const a = document.createElement('a');
                a.href = base64Data;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                if (typeof Swal !== 'undefined') Swal.close();
            } catch (e) {
                console.error("Download error:", e);
                if (typeof Swal !== 'undefined') {
                    Swal.fire('Error', 'Failed to download document.', 'error');
                }
            }
        }
        async openAdd() {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            const { value: vals } = await Swal.fire({
                title: '<strong style="color:#0A2647;">Upload Digital SOP / Checklist</strong>',
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Document Title</label>
                        <input id="docTitle" class="form-control" placeholder="e.g. Confined Space Permit SOP v4.2">
                        <label class="fw-bold mt-2">Category</label>
                        <select id="docCat" class="form-select">
                            <option value="SOP Manual">SOP Manual (PDF)</option>
                            <option value="Checklist">Inspection Checklist Form (Excel XLSX)</option>
                            <option value="Audit Report">Audit Report</option>
                            <option value="Statutory Form">Statutory Form</option>
                        </select>
                        <label class="fw-bold mt-2">Author / Issuing Authority</label>
                        <input id="docAuth" class="form-control" value="Safety & Fire Services Dept">
                        <label class="fw-bold mt-2 text-primary"><i class="fas fa-file-upload me-1"></i>Upload File (.PDF / .XLSX)</label>
                        <input id="docFile" type="file" accept=".pdf,.xlsx,.xls" class="form-control mt-1">
                        <small class="text-danger d-block mt-1 fw-bold"><i class="fas fa-exclamation-triangle me-1"></i>Warning: Please upload file less than 1 MB</small>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#0A2647',
                confirmButtonText: '<i class="fas fa-cloud-upload-alt me-1"></i> Upload to Storage',
                preConfirm: async () => {
                    const title = document.getElementById('docTitle').value || 'Standard Safety SOP';
                    const fileInput = document.getElementById('docFile');
                    let fileData = null;
                    let docSize = "1.2 MB";
                    let fileName = null;
                    let fileType = null;
                    if (fileInput && fileInput.files && fileInput.files[0]) {
                        const file = fileInput.files[0];
                        if (file.size > 1024 * 1024) {
                            Swal.showValidationMessage('<i class="fas fa-exclamation-circle me-1"></i> File size exceeds 1 MB limit! Please upload less than 1 MB.');
                            return false;
                        }
                        if (typeof Swal !== 'undefined') {
                            Swal.showLoading();
                            const btn = Swal.getConfirmButton();
                            if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Uploading...';
                        }
                        docSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
                        fileName = file.name;
                        fileType = file.type;
                        fileData = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = e => resolve(e.target.result);
                            reader.onerror = err => reject(err);
                            reader.readAsDataURL(file);
                        });
                    }
                    return {
                        id: dataService.getNextSerialId('documents', 'DOC'),
                        title,
                        category: document.getElementById('docCat').value,
                        author: document.getElementById('docAuth').value,
                        size: docSize,
                        fileData: fileData,
                        url: fileData,
                        fileName: fileName || title,
                        fileType: fileType || ''
                    };
                }
            });
            if (vals) {
                await dataService.create('documents', vals);
                Swal.fire('Uploaded!', 'Document uploaded and saved to digital library.', 'success');
                this.app.renderCurrentModule();
            }
        }
        async editDoc(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            const doc = await dataService.getById('documents', id);
            if (!doc) return;
            const { value: vals } = await Swal.fire({
                title: '<strong style="color:#0A2647;">Edit Document & Attachment</strong>',
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Title</label>
                        <input id="edDocTitle" class="form-control" value="${doc.title}">
                        <label class="fw-bold mt-2">Category</label>
                        <select id="edDocCat" class="form-select">
                            <option value="SOP Manual" ${doc.category === 'SOP Manual' ? 'selected' : ''}>SOP Manual (PDF)</option>
                            <option value="Checklist" ${doc.category === 'Checklist' ? 'selected' : ''}>Inspection Checklist Form (Excel XLSX)</option>
                            <option value="Audit Report" ${doc.category === 'Audit Report' ? 'selected' : ''}>Audit Report</option>
                            <option value="Statutory Form" ${doc.category === 'Statutory Form' ? 'selected' : ''}>Statutory Form</option>
                        </select>
                        <label class="fw-bold mt-2">Author</label>
                        <input id="edDocAuth" class="form-control" value="${doc.author || ''}">
                        <label class="fw-bold mt-2 text-primary">Replace Attachment (.PDF / .XLSX)</label>
                        <input id="edDocFile" type="file" accept=".pdf,.xlsx,.xls" class="form-control mt-1">
                        <small class="text-danger d-block mt-1 fw-bold"><i class="fas fa-exclamation-triangle me-1"></i>Warning: Please upload file less than 1 MB</small>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonColor: '#0A2647',
                preConfirm: async () => {
                    const fileInput = document.getElementById('edDocFile');
                    let fileData = doc.fileData || doc.url;
                    let docSize = doc.size;
                    let fileName = doc.fileName;
                    let fileType = doc.fileType;
                    if (fileInput && fileInput.files && fileInput.files[0]) {
                        const file = fileInput.files[0];
                        if (file.size > 1024 * 1024) {
                            Swal.showValidationMessage('<i class="fas fa-exclamation-circle me-1"></i> File size exceeds 1 MB limit! Please upload less than 1 MB.');
                            return false;
                        }
                        if (typeof Swal !== 'undefined') {
                            Swal.showLoading();
                            const btn = Swal.getConfirmButton();
                            if (btn) btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Uploading...';
                        }
                        docSize = (file.size / (1024 * 1024)).toFixed(2) + " MB";
                        fileName = file.name;
                        fileType = file.type;
                        fileData = await new Promise((resolve, reject) => {
                            const reader = new FileReader();
                            reader.onload = e => resolve(e.target.result);
                            reader.onerror = err => reject(err);
                            reader.readAsDataURL(file);
                        });
                    }
                    return {
                        title: document.getElementById('edDocTitle').value,
                        category: document.getElementById('edDocCat').value,
                        author: document.getElementById('edDocAuth').value,
                        size: docSize,
                        fileData: fileData,
                        url: fileData,
                        fileName: fileName || document.getElementById('edDocTitle').value,
                        fileType: fileType || ''
                    };
                }
            });
            if (vals) {
                await dataService.update('documents', id, vals);
                Swal.fire('Updated', 'Document details & attachment updated.', 'success');
                this.app.renderCurrentModule();
            }
        }
        async delDoc(id) {
            if (authService.getCurrentUser()?.role === 'viewer') return;
            if (confirm("Delete document?")) {
                await dataService.delete('documents', id);
                this.app.renderCurrentModule();
            }
        }
    }

    class AdminController {
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
                                <a href="#" class="list-group-item list-group-item-action d-flex align-items-center justify-content-between rounded ${this.activeTab === 'columns' ? 'active bg-primary text-white fw-bold' : 'border-0 text-dark'}" onclick="window.app.controllers.admin.switchTab('columns'); return false;" style="padding: 10px 14px; font-size: 13.5px;">
                                    <span class="d-flex align-items-center gap-2">
                                        <i class="fas fa-columns width-20 text-center"></i> Table Columns Control
                                    </span>
                                    <span class="badge ${this.activeTab === 'columns' ? 'bg-white text-primary' : 'bg-light text-dark border'} rounded-pill" style="font-size: 11px;">Fields</span>
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
                                                <button class="btn btn-sm btn-erp-outline py-1 px-2 text-primary" onclick="window.app.controllers.admin.editAreaModal('${a.code}')"><i class="fas fa-edit"></i> Edit</button>
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
                                                <button class="btn btn-sm btn-erp-outline py-1 px-2 text-primary" onclick="window.app.controllers.admin.editCategoryModal('${c.id}')"><i class="fas fa-edit"></i> Edit</button>
                                                <button class="btn btn-sm btn-erp-outline py-1 px-2 text-danger" onclick="window.app.controllers.admin.deleteCategory('${c.id}')"><i class="fas fa-trash"></i> Delete</button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `;
            } else if (this.activeTab === 'columns') {
                const dbData = dataService.getDatabase();
                const hiddenCols = dbData.hiddenInspectionColumns || [];
                const customCols = dbData.customInspectionColumns || [];
                let allCols = [
                    { key: 'id', label: 'Sl', isCustom: false },
                    { key: 'category', label: 'Activity', isCustom: false },
                    { key: 'area', label: 'Area', isCustom: false },
                    { key: 'frequency', label: 'Frequency', isCustom: false },
                    { key: 'plannedDate', label: 'Planned Date', isCustom: false },
                    { key: 'completedDate', label: 'Completed Date', isCustom: false },
                    { key: 'status', label: 'Status', isCustom: false },
                    { key: 'responsiblePerson', label: 'Responsible', isCustom: false },
                    { key: 'remarks', label: 'Remarks', isCustom: false },
                    ...customCols.map(c => ({ key: c.key, label: c.label, isCustom: true }))
                ];

                if (dbData.inspectionColOrder && Array.isArray(dbData.inspectionColOrder)) {
                    allCols.sort((a, b) => {
                        let idxA = dbData.inspectionColOrder.indexOf(a.key);
                        let idxB = dbData.inspectionColOrder.indexOf(b.key);
                        if (idxA === -1) idxA = 999;
                        if (idxB === -1) idxB = 999;
                        return idxA - idxB;
                    });
                }

                return `
                    <div class="erp-table-container">
                        <div class="erp-card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <span>Master Table Columns & Visibility Controller</span>
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-erp-primary" onclick="window.app.controllers.admin.adminAddCustomColumn()">
                                    <i class="fas fa-plus me-1"></i> Add Table Column
                                </button>
                                <button class="btn btn-sm btn-erp-outline" onclick="window.app.controllers.inspections.manageColumns()">
                                    <i class="fas fa-columns me-1"></i> Manage Checkbox Modal
                                </button>
                            </div>
                        </div>
                        <div class="table-responsive">
                            <table class="table-erp mb-0">
                                <thead>
                                    <tr>
                                        <th>Column Identifier</th>
                                        <th>Header Display Label</th>
                                        <th>Field Status</th>
                                        <th>Visibility</th>
                                        <th>Admin Controls</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${allCols.map(c => {
                    const isHidden = hiddenCols.includes(c.key);
                    return `
                                            <tr>
                                                <td class="font-mono text-primary fw-bold">${c.key}</td>
                                                <td class="fw-bold">${c.label}</td>
                                                <td><span class="badge ${c.isCustom ? 'bg-info text-dark' : 'bg-light text-dark border'}">${c.isCustom ? 'Added Table Column' : 'Standard Table Column'}</span></td>
                                                <td>
                                                    <span class="badge ${!isHidden ? 'bg-success' : 'bg-secondary'}">${!isHidden ? 'Visible' : 'Hidden'}</span>
                                                </td>
                                                <td>
                                                    <button class="btn btn-sm btn-erp-outline py-1 px-2 ${!isHidden ? 'text-warning' : 'text-success'}" onclick="window.app.controllers.admin.adminToggleVisibility('${c.key}')">
                                                        <i class="fas ${!isHidden ? 'fa-eye-slash' : 'fa-eye'}"></i> ${!isHidden ? 'Hide' : 'Show'}
                                                    </button>
                                                    ${c.isCustom ? `
                                                        <button class="btn btn-sm btn-erp-outline py-1 px-2 text-danger" onclick="window.app.controllers.admin.adminDeleteCustomColumn('${c.key}')">
                                                            <i class="fas fa-trash"></i> Delete
                                                        </button>
                                                    ` : ''}
                                                </td>
                                            </tr>
                                        `;
                }).join('')}
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

        adminToggleVisibility(colKey) {
            const dbData = dataService.getDatabase();
            if (!dbData.hiddenInspectionColumns) dbData.hiddenInspectionColumns = [];
            const idx = dbData.hiddenInspectionColumns.indexOf(colKey);
            if (idx !== -1) {
                dbData.hiddenInspectionColumns.splice(idx, 1);
            } else {
                dbData.hiddenInspectionColumns.push(colKey);
            }
            dataService.saveDatabase(dbData);
            this.app.renderCurrentModule();
        }

        async adminAddCustomColumn() {
            const { value: colLabel } = await Swal.fire({
                title: '<strong style="color:#0A2647;">Add Standard Table Column</strong>',
                input: 'text',
                inputLabel: 'Enter Column Header Label (e.g. Contractor Name, Hazard Level)',
                inputPlaceholder: 'Column Label',
                showCancelButton: true,
                confirmButtonText: 'Create Column',
                confirmButtonColor: '#0A2647'
            });
            if (colLabel && colLabel.trim()) {
                const dbData = dataService.getDatabase();
                if (!dbData.customInspectionColumns) dbData.customInspectionColumns = [];
                const key = 'col_' + colLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Math.floor(100 + Math.random() * 900);
                dbData.customInspectionColumns.push({ key, label: colLabel.trim() });
                if (dbData.inspectionColOrder && Array.isArray(dbData.inspectionColOrder)) {
                    const statusIdx = dbData.inspectionColOrder.indexOf('status');
                    if (statusIdx !== -1) {
                        dbData.inspectionColOrder.splice(statusIdx, 0, key);
                    } else {
                        dbData.inspectionColOrder.push(key);
                    }
                }
                dataService.saveDatabase(dbData);
                Swal.fire('Column Created!', `${colLabel.trim()} added as standard active column successfully.`, 'success');
                this.app.renderCurrentModule();
            }
        }

        adminDeleteCustomColumn(colKey) {
            if (confirm(`Remove custom column ${colKey}?`)) {
                const dbData = dataService.getDatabase();
                if (dbData.customInspectionColumns) {
                    dbData.customInspectionColumns = dbData.customInspectionColumns.filter(c => c.key !== colKey);
                    dataService.saveDatabase(dbData);
                    this.app.renderCurrentModule();
                }
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
                title: disabledMods.includes(modId) ? `Module '${modId}' is now disabled and hidden from Left Sidebar.` : `Module '${modId}' is now enabled and active on Left Sidebar.`,
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
                title: 'All modules restored to active state!',
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
                    id: dataService.getNextSerialId('users', 'USR'),
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
                preConfirm: () => ({ id: document.getElementById('newDeptId').value || dataService.getNextSerialId('departments', 'DEPT'), name: document.getElementById('newDeptName').value, head: document.getElementById('newDeptHead').value || 'TBD', headcount: document.getElementById('newDeptCount').value || 0 })
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
            const { value: vals } = await Swal.fire({
                title: '<strong style="color:#0A2647;">Add Plant Area</strong>',
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Area Short Code (ID)</label>
                        <input id="newAreaCode" class="form-control font-mono" placeholder="e.g. SPB or FGD">
                        <label class="fw-bold mt-2">Plant Area Designation Name</label>
                        <input id="newAreaName" class="form-control" placeholder="e.g. Solar Plant Bay / FGD Unit">
                    </div>
                `,
                showCancelButton: true, confirmButtonColor: '#0A2647', confirmButtonText: 'Save Plant Area',
                preConfirm: () => ({ code: document.getElementById('newAreaCode').value.trim().toUpperCase(), name: document.getElementById('newAreaName').value.trim() })
            });
            if (vals && vals.code && vals.name) {
                PLANT_AREAS.push({ id: vals.code.toLowerCase(), name: vals.name, code: vals.code });
                const dbData = dataService.getDatabase();
                dbData.plantAreas = PLANT_AREAS;
                dataService.saveDatabase(dbData);
                Swal.fire('Plant Area Added', `${vals.name} (${vals.code}) added successfully.`, 'success');
                this.app.renderCurrentModule();
            }
        }

        async editAreaModal(code) {
            const areaObj = PLANT_AREAS.find(a => a.code === code || a.id === code.toLowerCase());
            if (!areaObj) return;
            const { value: vals } = await Swal.fire({
                title: `<strong style="color:#0A2647;">Edit Plant Area: ${areaObj.code}</strong>`,
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Area Short Code</label>
                        <input id="edAreaCode" class="form-control font-mono" value="${areaObj.code}">
                        <label class="fw-bold mt-2">Plant Area Designation Name</label>
                        <input id="edAreaName" class="form-control" value="${areaObj.name}">
                    </div>
                `,
                showCancelButton: true, confirmButtonColor: '#0A2647', confirmButtonText: 'Update Area',
                preConfirm: () => ({ code: document.getElementById('edAreaCode').value.trim().toUpperCase(), name: document.getElementById('edAreaName').value.trim() })
            });
            if (vals && vals.code && vals.name) {
                areaObj.code = vals.code;
                areaObj.id = vals.code.toLowerCase();
                areaObj.name = vals.name;
                const dbData = dataService.getDatabase();
                dbData.plantAreas = PLANT_AREAS;
                dataService.saveDatabase(dbData);
                Swal.fire('Updated', `Plant area updated to ${vals.name} (${vals.code}).`, 'success');
                this.app.renderCurrentModule();
            }
        }

        deleteArea(idOrCode) {
            if (confirm(`Remove plant area ${idOrCode}?`)) {
                const idx = PLANT_AREAS.findIndex(a => a.id === idOrCode || a.code === idOrCode);
                if (idx !== -1) PLANT_AREAS.splice(idx, 1);
                const dbData = dataService.getDatabase();
                dbData.plantAreas = PLANT_AREAS;
                dataService.saveDatabase(dbData);
                this.app.renderCurrentModule();
            }
        }

        async openCreateCategoryModal() {
            const { value: vals } = await Swal.fire({
                title: '<strong style="color:#0A2647;">Add Inspection Category</strong>',
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Category Title</label>
                        <input id="newCatName" class="form-control" placeholder="e.g. Conveyor Belt Safety Check">
                        <label class="fw-bold mt-2">Audit Frequency</label>
                        <select id="newCatFreq" class="form-select">
                            <option value="Monthly">Monthly</option>
                            <option value="Quarterly">Quarterly</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Bi-Annual">Bi-Annual</option>
                        </select>
                        <label class="fw-bold mt-2">Applicable Plant Areas (Comma separated)</label>
                        <input id="newCatAreas" class="form-control" value="Main Plant, CHP, Switchyard">
                    </div>
                `,
                showCancelButton: true, confirmButtonColor: '#0A2647', confirmButtonText: 'Save Category',
                preConfirm: () => ({
                    name: document.getElementById('newCatName').value.trim(),
                    frequency: document.getElementById('newCatFreq').value,
                    areas: document.getElementById('newCatAreas').value.split(',').map(s => s.trim()).filter(Boolean)
                })
            });
            if (vals && vals.name) {
                const id = vals.name.toLowerCase().replace(/\s+/g, '_');
                INSPECTION_CATEGORIES.push({ id, name: vals.name, frequency: vals.frequency, areas: vals.areas });
                const dbData = dataService.getDatabase();
                dbData.inspectionCategories = INSPECTION_CATEGORIES;
                dataService.saveDatabase(dbData);
                Swal.fire('Category Added', `${vals.name} added successfully.`, 'success');
                this.app.renderCurrentModule();
            }
        }

        async editCategoryModal(catId) {
            const catObj = INSPECTION_CATEGORIES.find(c => c.id === catId);
            if (!catObj) return;
            const { value: vals } = await Swal.fire({
                title: `<strong style="color:#0A2647;">Edit Category: ${catObj.name}</strong>`,
                html: `
                    <div style="text-align:left; font-size:13px;">
                        <label class="fw-bold mt-2">Category Title</label>
                        <input id="edCatName" class="form-control" value="${catObj.name}">
                        <label class="fw-bold mt-2">Audit Frequency</label>
                        <select id="edCatFreq" class="form-select">
                            <option value="Monthly" ${catObj.frequency === 'Monthly' ? 'selected' : ''}>Monthly</option>
                            <option value="Quarterly" ${catObj.frequency === 'Quarterly' ? 'selected' : ''}>Quarterly</option>
                            <option value="Weekly" ${catObj.frequency === 'Weekly' ? 'selected' : ''}>Weekly</option>
                            <option value="Bi-Annual" ${catObj.frequency === 'Bi-Annual' ? 'selected' : ''}>Bi-Annual</option>
                        </select>
                        <label class="fw-bold mt-2">Applicable Plant Areas</label>
                        <input id="edCatAreas" class="form-control" value="${(catObj.areas || ['Main Plant', 'CHP', 'Switchyard']).join(', ')}">
                    </div>
                `,
                showCancelButton: true, confirmButtonColor: '#0A2647', confirmButtonText: 'Update Category',
                preConfirm: () => ({
                    name: document.getElementById('edCatName').value.trim(),
                    frequency: document.getElementById('edCatFreq').value,
                    areas: document.getElementById('edCatAreas').value.split(',').map(s => s.trim()).filter(Boolean)
                })
            });
            if (vals && vals.name) {
                catObj.name = vals.name;
                catObj.frequency = vals.frequency;
                catObj.areas = vals.areas;
                const dbData = dataService.getDatabase();
                dbData.inspectionCategories = INSPECTION_CATEGORIES;
                dataService.saveDatabase(dbData);
                Swal.fire('Updated', `Category updated successfully.`, 'success');
                this.app.renderCurrentModule();
            }
        }

        deleteCategory(catId) {
            if (confirm(`Remove inspection category ${catId}?`)) {
                const idx = INSPECTION_CATEGORIES.findIndex(c => c.id === catId);
                if (idx !== -1) INSPECTION_CATEGORIES.splice(idx, 1);
                const dbData = dataService.getDatabase();
                dbData.inspectionCategories = INSPECTION_CATEGORIES;
                dataService.saveDatabase(dbData);
                this.app.renderCurrentModule();
            }
        }

        handleRestore(input) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
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

    // ==========================================
    // 7. MASTER APPLICATION CONTROLLER
    // ==========================================
    class AppController {
        constructor() {
            this.state = { activeModule: 'dashboard', fy: APP_CONFIG.DEFAULT_FY, month: APP_CONFIG.DEFAULT_MONTH, area: 'all' };
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
            this.render();
        }

        navigateTo(mod) {
            this.state.activeModule = mod;
            this.render();
        }

        renderCurrentModule() {
            const area = document.getElementById('moduleContentArea');
            if (!area) return;
            if (this.controllers[this.state.activeModule]) {
                this.controllers[this.state.activeModule].render().then(html => {
                    area.innerHTML = html;
                    if (this.controllers[this.state.activeModule].afterRender) {
                        this.controllers[this.state.activeModule].afterRender();
                    }
                });
            }
        }

        exportCSV(col) {
            dataService.getAll(col).then(items => {
                if (!items.length) return;
                const keys = Object.keys(items[0]);
                const rows = items.map(i => keys.map(k => i[k]));
                exportService.exportToCSV(keys, rows, `NTPC_NKSTPP_${col.toUpperCase()}`);
            });
        }

        printReport(title) {
            const container = document.querySelector('.erp-table-container') || document.getElementById('moduleContentArea');
            if (!container) return;
            const clone = container.cloneNode(true);
            const origFields = container.querySelectorAll('input, select, textarea');
            const cloneFields = clone.querySelectorAll('input, select, textarea');
            cloneFields.forEach((cel, idx) => {
                const orig = origFields[idx];
                const val = orig ? (orig.tagName === 'SELECT' && orig.selectedIndex >= 0 ? orig.options[orig.selectedIndex].text : orig.value) : (cel.value || '');
                const span = document.createElement('span');
                if (cel.classList.contains('text-success')) span.className = 'text-success fw-bold';
                else if (cel.classList.contains('text-danger')) span.className = 'text-danger fw-bold';
                else if (cel.classList.contains('text-warning')) span.className = 'text-warning fw-bold';
                span.textContent = val;
                cel.parentNode.replaceChild(span, cel);
            });
            clone.querySelectorAll('.btn, button, .filter-bar, small, .cursor-pointer, i.fa-times, .d-print-none').forEach(el => el.remove());
            const content = clone.innerHTML;

            const printWin = window.open('', '_blank', 'width=1000,height=800');
            printWin.document.write(`
                <html>
                <head>
                    <title>${title} - NTPC North Karanpura</title>
                    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #0A2647; }
                        .print-header { border-bottom: 3px solid #0A2647; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
                        .print-title { font-size: 20px; font-weight: bold; color: #0A2647; text-transform: uppercase; }
                        .print-sub { font-size: 12px; color: #555; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th, td { border: 1px solid #ddd; padding: 8px 10px; font-size: 12px; text-align: left; }
                        th { background-color: #0A2647 !important; color: #fff !important; -webkit-print-color-adjust: exact; }
                        .btn, button, .filter-bar, small, .cursor-pointer, i.fa-times, .d-print-none { display: none !important; }
                    </style>
                </head>
                <body>
                    <div class="print-header d-flex justify-content-between align-items-center">
                        <div class="d-flex align-items-center gap-3">
                            <img src="https://careers.ntpc.co.in/recruitment/images/logo50yr.png" alt="NTPC 50 Years Logo" style="height:48px; object-fit:contain;">
                            <div>
                                <div class="print-title">NTPC LIMITED - NORTH KARANPURA THERMAL POWER STATION</div>
                                <div class="print-sub">Safety Governance Report • ${title}</div>
                            </div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-weight:bold; font-size:14px;">Date: ${new Date().toLocaleDateString('en-GB')}</div>
                            <div class="print-sub">Official Safety Record</div>
                        </div>
                    </div>
                    <div>${content}</div>
                    <script>
                        setTimeout(() => { window.print(); }, 500);
                    </script>
                </body>
                </html>
            `);
            printWin.document.close();
        }

        exportBackup() { dataService.exportBackupJSON(); }

        toggleSidebar() {
            const sidebar = document.querySelector('.erp-sidebar');
            const main = document.querySelector('.erp-main');
            if (!sidebar) return;
            if (window.innerWidth <= 992) {
                sidebar.classList.toggle('open');
            } else {
                sidebar.classList.toggle('collapsed');
                if (main) main.classList.toggle('collapsed');
            }
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
            } catch (e) { }

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
            } catch (e) { }

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

        async forceCloudSync() {
            if (!USE_LIVE_FIREBASE || !fbDb) {
                if (typeof window.initFirebaseConnection === 'function') window.initFirebaseConnection();
                if (!fbDb) {
                    Swal.fire({ icon: 'error', title: 'Firebase Not Connected', text: 'Please check internet connection or Firebase configuration.' });
                    return;
                }
            }
            Swal.fire({
                title: 'Syncing to Firebase Cloud...',
                text: 'Uploading all local categories and records to your live Firestore database...',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });
            const collections = [
                'inspections', 'tbts', 'trainings', 'incidents',
                'calendarItems', 'gallery', 'documents', 'logs',
                'users', 'departments'
            ];
            let totalRecords = 0;
            let permError = false;
            for (const colName of collections) {
                try {
                    const dbData = dataService.getDatabase();
                    if (dbData[colName] && dbData[colName].length > 0) {
                        const batch = fbDb.batch();
                        let count = 0;
                        for (const item of dbData[colName]) {
                            if (item && item.id) {
                                batch.set(fbDb.collection(colName).doc(String(item.id)), item);
                                count++;
                                totalRecords++;
                                if (count >= 450) break;
                            }
                        }
                        if (count > 0) await batch.commit();
                    }
                } catch (err) {
                    console.error(`[ForceSync] Error on ${colName}:`, err);
                    if (err.code === 'permission-denied' || (err.message && err.message.toLowerCase().includes('permission'))) {
                        permError = true;
                    }
                }
            }
            if (permError) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Firebase Database Rules Blocked!',
                    html: `<div class="text-start" style="font-size: 13.5px;">
                        <p>Your Firebase Cloud Firestore is blocking read/write access because of Security Rules.</p>
                        <p><b>How to fix in 10 seconds:</b></p>
                        <ol>
                            <li>Go to your <b>Firebase Console</b> &rarr; <b>Firestore Database</b> &rarr; <b>Rules</b> tab.</li>
                            <li>Change <code>allow read, write: if false;</code> to:<br><code style="background:#e8f5e9;color:#2e7d32;padding:2px 6px;border-radius:4px;font-weight:bold;">allow read, write: if true;</code></li>
                            <li>Click <b>Publish</b> and try again!</li>
                        </ol>
                    </div>`,
                    confirmButtonText: 'I understand, let me fix Rules'
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Live Cloud Sync Complete!',
                    html: `Successfully verified and synchronized <b>${totalRecords} records</b> across all 10 ERP categories with your Firebase Cloud Firestore!`,
                    timer: 3000,
                    showConfirmButton: true
                });
            }
        }

        logout() {
            authService.logout();
            this.render();
        }

        render() {
            const root = document.getElementById('appRoot');
            if (!root) return;

            if (!authService.isAuthenticated()) {
                root.innerHTML = `
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
                                    <label class="form-label fw-bold text-muted" style="font-size:11px;">USERNAME OR EMAIL</label>
                                    <input type="text" id="loginUser" class="form-control" placeholder="e.g. admin or user@ntpc.co.in" value="" required>
                                </div>
                                <div class="mb-4">
                                    <label class="form-label fw-bold text-muted" style="font-size:11px;">PASSWORD</label>
                                    <input type="password" id="loginPass" class="form-control" placeholder="Enter Security Password" value="" required>
                                </div>
                                <button type="submit" class="btn btn-erp-primary w-100 py-2 justify-content-center fw-bold shadow-sm">Login</button>
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
                            <div class="login-footer mt-4 text-center">
                                <small>© ${APP_CONFIG.YEAR} ${APP_CONFIG.COMPANY}</small>
                            </div>
                        </div>
                    </div>
                `;
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

                const loginU = document.getElementById('loginUser');
                const loginP = document.getElementById('loginPass');
                const clrErr = () => { const el = document.getElementById('loginErrorMessage'); if (el) el.innerHTML = ''; };
                if (loginU) loginU.addEventListener('input', clrErr);
                if (loginP) loginP.addEventListener('input', clrErr);

                document.getElementById('loginForm').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const uVal = document.getElementById('loginUser').value.trim();
                    const pVal = document.getElementById('loginPass').value.trim();
                    if (typeof USE_LIVE_FIREBASE !== 'undefined' && USE_LIVE_FIREBASE && typeof fbAuth !== 'undefined' && fbAuth && uVal.includes('@')) {
                        try {
                            await fbAuth.signInWithEmailAndPassword(uVal, pVal);
                        } catch (err) {
                            console.warn("[FirebaseAuth] Email login note:", err.message);
                        }
                    }
                    const res = authService.login(uVal, pVal);
                    if (res.success) {
                        Swal.fire({ title: 'Login Successful', text: `Welcome, ${res.user.name}`, icon: 'success', timer: 1200, showConfirmButton: false });
                        this.render();
                    } else {
                        const errEl = document.getElementById('loginErrorMessage');
                        if (errEl) {
                            errEl.innerHTML = res.message;
                        } else {
                            Swal.fire('Login Error', res.message, 'error');
                        }
                    }
                });

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

                const regEl = document.getElementById('registerForm');
                if (regEl) {
                    regEl.addEventListener('submit', async (e) => {
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

                        const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
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
                return;
            }

            const currentUser = authService.getCurrentUser();
            root.innerHTML = `
                <div class="erp-wrapper">
                    <aside class="erp-sidebar">
                        <div class="sidebar-header d-flex align-items-center gap-2 px-3">
                            <button id="sidebarToggleBtn" class="btn btn-sm text-white d-flex align-items-center justify-content-center flex-shrink-0 p-0 shadow-sm" onclick="window.app.toggleSidebar()" title="Toggle Sidebar" style="width:34px; height:34px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.22); border-radius: 6px;">
                                <i class="fas fa-bars fs-6"></i>
                            </button>
                            <div class="sidebar-brand-wrapper overflow-hidden">
                                <div class="sidebar-brand-text text-truncate" style="font-size:17px; font-weight:800; letter-spacing:0.8px; color:#fff; line-height: 1.2;">NTPC</div>
                                <div class="sidebar-brand-subtext text-truncate" style="color:#94A3B8; font-size:10px; font-weight:500; line-height: 1.1;">powered by Abhinaw Mishra</div>
                            </div>
                        </div>
                        <div class="sidebar-menu-container">
                            <ul class="p-0 m-0 py-2">
                                ${(() => {
                    const disabledMods = JSON.parse(localStorage.getItem('ntpc_erp_disabled_modules') || '[]');
                    const navMods = [
                        { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
                        { id: 'inspections', label: 'Inspections', icon: 'fas fa-clipboard-check' },
                        { id: 'tbt', label: 'Daily TBT Register', icon: 'fas fa-users' },
                        { id: 'training', label: 'Module Training', icon: 'fas fa-graduation-cap' },
                        { id: 'incidents', label: 'Incident Recall', icon: 'fas fa-exclamation-triangle' },
                        { id: 'reports', label: 'Safety Reports', icon: 'fas fa-file-alt' },
                        { id: 'calendar', label: 'Safety Calendar', icon: 'fas fa-calendar-check' },
                        { id: 'gallery', label: 'Photo Gallery', icon: 'fas fa-images' },
                        { id: 'documents', label: 'Document Library', icon: 'fas fa-folder-open' },
                        { id: 'admin', label: 'Admin & RBAC', icon: 'fas fa-cogs' }
                    ];
                    return navMods.map(mod => {
                        if (disabledMods.includes(mod.id) && mod.id !== 'admin') return '';
                        const isActive = this.state.activeModule === mod.id ? 'active' : '';
                        return `<li class="sidebar-nav-item"><a href="#" class="sidebar-nav-link ${isActive}" title="${mod.label}" onclick="window.app.navigateTo('${mod.id}'); return false;"><i class="${mod.icon}"></i><span>${mod.label}</span></a></li>`;
                    }).join('');
                })()}
                            </ul>
                        </div>
                        <div class="sidebar-footer">
                            <span>© ${APP_CONFIG.YEAR} NTPC Ltd.</span>
                            <a href="#" onclick="window.app.logout()" class="text-danger" title="Logout"><i class="fas fa-power-off"></i></a>
                        </div>
                    </aside>
                    <main class="erp-main">
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
                                <div class="erp-selector-group flex-shrink-0">
                                    <span class="selector-label">FY:</span>
                                    <select class="selector-dropdown" onchange="window.app.state.fy = this.value; window.app.renderCurrentModule();">
                                        ${FINANCIAL_YEARS.map(fy => `<option value="${fy}" ${this.state.fy === fy ? 'selected' : ''}>${fy}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="navbar-right d-flex align-items-center gap-2 flex-shrink-0 ms-auto">
                                <button id="liveCloudSyncBtn" class="btn btn-sm d-flex align-items-center gap-1 px-2 py-1 shadow-sm flex-shrink-0" onclick="window.app.forceCloudSync(); return false;" title="Click to Force Push/Pull All Data to Live Firebase Cloud" style="background: rgba(46, 125, 50, 0.15); border: 1px solid #2E7D32; color: #2E7D32; font-size: 11px; font-weight: 700; border-radius: 20px;">
                                    <i class="fas fa-cloud-upload-alt fs-6"></i>
                                    <span id="cloudSyncStatusText">Cloud Sync Active</span>
                                </button>
                                <div id="liveHeaderClockPill" class="live-clock-pill font-mono flex-shrink-0">Loading...</div>
                                <div class="d-flex align-items-center gap-2 cursor-pointer p-1 px-2 rounded shadow-sm flex-shrink-0" onclick="window.app.openProfileEditModal()" title="Tap to edit your photo, details & password" style="cursor: pointer; transition: all 0.2s; background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(10, 38, 71, 0.15);">
                                    ${currentUser.photo && currentUser.photo !== 'assets/power-plant-bg.svg' ? `<img src="${currentUser.photo}" alt="${currentUser.name}" class="rounded-circle shadow-sm" style="width:32px;height:32px;object-fit:cover;border:2px solid #0A2647;">` : `<div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style="width:32px;height:32px;font-size:13px;">${currentUser.name.charAt(0)}</div>`}
                                    <div class="text-start d-none d-xl-block">
                                        <div class="fw-bold text-primary d-flex align-items-center gap-1" style="font-size:12px; line-height: 1.2;">${currentUser.name} <i class="fas fa-edit text-muted" style="font-size:10px;" title="Click to Edit Profile"></i></div>
                                        <div class="text-muted text-uppercase fw-semibold" style="font-size:9.5px; line-height: 1.1;">${currentUser.role || 'USER'}</div>
                                    </div>
                                </div>
                                <button class="btn btn-sm btn-erp-outline text-danger flex-shrink-0" onclick="window.app.logout()" title="Logout"><i class="fas fa-sign-out-alt"></i></button>
                            </div>
                        </header>
                        <div id="moduleContentArea" class="erp-content"></div>
                    </main>
                </div>
            `;
            this.renderCurrentModule();
            if (!window.headerClockInterval) {
                const updateHeaderClock = () => {
                    const el = document.getElementById('liveHeaderClockPill');
                    if (el) {
                        const now = new Date();
                        const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
                        el.textContent = `${dateStr} ${timeStr} | ACTIVE SHIFT`;
                    }
                };
                updateHeaderClock();
                window.headerClockInterval = setInterval(updateHeaderClock, 1000);
            }
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        window.app = new AppController();
        window.app.init();
    });
})();
