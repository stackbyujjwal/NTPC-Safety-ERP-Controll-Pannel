/**
 * NTPC SAFETY ERP MANAGEMENT SYSTEM
 * Firebase Configuration & Integration Layer
 * 
 * Instructions for Live Production Deployment:
 * 1. Replace the `firebaseConfig` object below with your production Firebase credentials from Firebase Console.
 * 2. Set `USE_LIVE_FIREBASE = true` to seamlessly switch from Local Enterprise Storage Engine to live Cloud Firestore.
 */

export const USE_LIVE_FIREBASE = true; // Set to true when valid Firebase API keys are provided

export const firebaseConfig = {
    apiKey: "AIzaSyBCzAeMt9xE9bzPDZEJPteBLq9_2UkZgG0",
    authDomain: "ntpc-safety-erp.firebaseapp.com",
    projectId: "ntpc-safety-erp",
    storageBucket: "ntpc-safety-erp.firebasestorage.app",
    messagingSenderId: "692804039913",
    appId: "1:692804039913:web:c186b8fd2652e47a886c78",
    measurementId: "G-75ZCF56Q4L"
};

// Initialize Firebase instances if SDK is loaded and live mode is active
let app = null;
let db = null;
let auth = null;
let storage = null;

if (USE_LIVE_FIREBASE && typeof firebase !== 'undefined') {
    try {
        app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();
        storage = firebase.storage();
        console.log("[Enterprise ERP] Connected to live Firebase Cloud Firestore instance.");
    } catch (e) {
        console.error("[Enterprise ERP] Firebase initialization error falling back to local hybrid engine:", e);
    }
} else {
    console.log("[Enterprise ERP] Running in High-Performance Local Enterprise Storage Mode (Full Hybrid CRUD enabled).");
}

export { app, db, auth, storage };
