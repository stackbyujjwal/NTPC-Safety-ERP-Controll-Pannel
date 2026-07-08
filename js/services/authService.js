/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Enterprise Authentication & Role-Based Access Control (RBAC) Service
 */

import { USER_ROLES } from '../config/constants.js';

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

    saveSession(user, rememberMe = false) {
        this.currentUser = user;
        try {
            localStorage.removeItem(this.SESSION_KEY);
            sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
        } catch (e) { }
    }

    login(username, password) {
        // Retrieve dynamic users from database if available
        let users = [];
        try {
            const dbRaw = localStorage.getItem("ntpc_safety_erp_database_v4");
            if (dbRaw) {
                const parsed = JSON.parse(dbRaw);
                if (parsed && parsed.users) users = parsed.users;
            }
        } catch(e) {}

        if (users.length === 0 || !users.some(u => u.username.toLowerCase() === 'admin')) {
            const adminUser = { id: "USR-001", username: "admin", password: "@NTPC&ERP@admin", name: "System Administrator", role: "admin", department: "Safety & Fire Services", email: "admin@ntpc.co.in", active: true, approved: true };
            users.unshift(adminUser);
            try {
                const dbRaw = localStorage.getItem("ntpc_safety_erp_database_v4");
                const parsed = dbRaw ? JSON.parse(dbRaw) : {};
                parsed.users = users;
                localStorage.setItem("ntpc_safety_erp_database_v4", JSON.stringify(parsed));
            } catch(e) {}
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
            } catch(e) {}
            const sessionUser = { ...adminObj, loginTime: new Date().toISOString() };
            this.saveSession(sessionUser, true);
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
        try { lockouts = JSON.parse(localStorage.getItem("ntpc_login_lockouts") || "{}"); } catch(e) {}
        let unknownAttempts = {};
        try { unknownAttempts = JSON.parse(localStorage.getItem("ntpc_unknown_login_attempts") || "{}"); } catch(e) {}

        const curLock = lockouts[actualKey] || lockouts[usrKey] || unknownAttempts[actualKey] || unknownAttempts[usrKey] || { count: 0, lockUntil: null };

        const saveUsersDb = () => {
            try {
                const dbRaw = localStorage.getItem("ntpc_safety_erp_database_v4");
                const parsed = dbRaw ? JSON.parse(dbRaw) : {};
                parsed.users = users;
                localStorage.setItem("ntpc_safety_erp_database_v4", JSON.stringify(parsed));
                if (typeof window !== 'undefined' && window.dataService && typeof window.dataService.saveDatabase === 'function') {
                    window.dataService.saveDatabase(parsed);
                }
            } catch(e) {}
        };

        const saveLockout = (count, lockTime) => {
            curLock.count = count;
            curLock.lockUntil = lockTime;
            lockouts[actualKey] = curLock;
            if (usrKey !== actualKey) lockouts[usrKey] = curLock;
            try { localStorage.setItem("ntpc_login_lockouts", JSON.stringify(lockouts)); } catch(e) {}
            try { localStorage.setItem("ntpc_unknown_login_attempts", JSON.stringify(lockouts)); } catch(e) {}
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

            const sessionUser = {
                id: targetUser.id,
                username: targetUser.username,
                name: targetUser.name,
                role: targetUser.role,
                department: targetUser.department,
                email: targetUser.email,
                loginTime: new Date().toISOString()
            };
            this.saveSession(sessionUser, true);
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

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hasPermission(requiredPermission) {
        if (!this.currentUser) return false;
        if (this.currentUser.role === 'admin') return true;
        if (this.currentUser.role === 'safety_officer' && ['read', 'write', 'approve'].includes(requiredPermission)) return true;
        if (this.currentUser.role === 'viewer' && requiredPermission === 'read') return true;
        return false;
    }
}

export const authService = new AuthService();
