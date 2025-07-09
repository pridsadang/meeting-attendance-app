const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin'); // Import Firebase Admin SDK

const app = express();

// --- Firebase Admin SDK Initialization ---
// IMPORTANT: For Vercel, you should set this service account key as an Environment Variable.
// DO NOT commit your serviceAccountKey.json directly to Git!
//
// This assumes you set a Vercel Environment Variable named FIREBASE_SERVICE_ACCOUNT_KEY
// with the entire content of your downloaded serviceAccountKey.json as a single string.
// Example: FIREBASE_SERVICE_ACCOUNT_KEY = {"type": "service_account", "project_id": "...", "private_key_id": "...", ...}
try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountString) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set.");
    }
    const serviceAccount = JSON.parse(serviceAccountString);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    // In a production app, you might want to log this error and gracefully handle it.
    // For Vercel Serverless, an error here usually means incorrect ENV var, so exiting might be appropriate.
    // process.exit(1); // Removed process.exit(1) to allow Vercel to fully deploy and show error in logs if needed.
}

const db = admin.firestore(); // Get a reference to the Firestore database
const COLLECTION_NAME = 'documentData'; // Name of your Firestore collection

// CORS configuration:
// For development, allow all origins: app.use(cors());
// For production, specify your frontend domain:
// const allowedOrigins = ['https://your-frontend-app.vercel.app']; // Replace with your actual Vercel frontend URL
// app.use(cors({
//     origin: function (origin, callback) {
//         if (!origin || allowedOrigins.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     }
// }));
app.use(cors()); // Allow all origins for simplicity in this example

app.use(bodyParser.json());

// API to get data from Firestore
app.get('/api/data', async (req, res) => {
    try {
        const docRef = db.collection(COLLECTION_NAME).doc('latest'); // We'll store data in a single document named 'latest'
        const doc = await docRef.get();

        if (doc.exists) {
            res.status(200).json(doc.data());
            console.log("Data loaded from Firestore.");
        } else {
            console.log("No data found in Firestore. Returning empty object.");
            res.status(200).json({}); // Return empty object if no data, so frontend can set defaults
        }
    } catch (error) {
        console.error('Error loading data from Firestore:', error);
        // Ensure error is sent back correctly even if Firebase init failed
        if (!admin.apps.length) { // Check if Firebase was not initialized
            res.status(500).json({ message: 'Server initialization error (Firebase)', error: error.message });
        } else {
            res.status(500).json({ message: 'Failed to load data from Firestore', error: error.message });
        }
    }
});

// API to save data to Firestore
app.post('/api/data', async (req, res) => {
    const newData = req.body;
    try {
        const docRef = db.collection(COLLECTION_NAME).doc('latest'); // Save to the same 'latest' document
        await docRef.set(newData); // set() will create or overwrite the document
        console.log("Data saved to Firestore.");
        res.status(200).json({ message: 'Data saved successfully to Firestore' });
    } catch (error) {
        console.error('Error saving data to Firestore:', error);
        if (!admin.apps.length) { // Check if Firebase was not initialized
            res.status(500).json({ message: 'Server initialization error (Firebase)', error: error.message });
        } else {
            res.status(500).json({ message: 'Failed to save data to Firestore', error: error.message });
        }
    }
});

// Export the Express app for Vercel Serverless Function
module.exports = app;
