/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Normalized Database Schema & Realistic Sample Data Generator
 * Collections: Users, Departments, Areas, Inspections, TBT, Training, Incidents, Documents, Notifications, Logs
 */

export const generateSeedData = () => {
    const seedData = {
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
    return seedData;
};
