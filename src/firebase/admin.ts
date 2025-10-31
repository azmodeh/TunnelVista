import { initializeApp, getApps, cert, App } from 'firebase-admin/app';

let adminApp: App;

// This logic ensures that we initialize the app only once.
if (!getApps().length) {
    try {
        // Ensure the environment variable is set.
        if (!process.env.FIREBASE_ADMIN_CREDENTIALS) {
            throw new Error("The FIREBASE_ADMIN_CREDENTIALS environment variable is not set.");
        }
        const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS);
        adminApp = initializeApp({
            credential: cert(serviceAccount),
        });
    } catch (e: any) {
        console.error("Failed to initialize Firebase Admin SDK:", e.message);
        // In a server environment, failing to initialize is critical.
        // We throw an error to prevent the app from running with a broken configuration.
        // A dummy app won't work for server-side operations like verifying sessions.
        throw new Error("Could not initialize Firebase Admin SDK. Please check your FIREBASE_ADMIN_CREDENTIALS.");
    }
} else {
  adminApp = getApps()[0];
}

export { adminApp };
