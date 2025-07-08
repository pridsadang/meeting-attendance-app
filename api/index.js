const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin'); // Import Firebase Admin SDK
const path = require('path');
const fs = require('fs'); // Still needed to read service account key

const app = express();

// --- Firebase Admin SDK Initialization ---
// IMPORTANT: For Vercel, you should set this service account key as an Environment Variable
// DO NOT commit your serviceAccountKey.json directly to Git!
//
// Method 1: Load from JSON file (for local development ONLY, and ensure .gitignore ignores it)
// const serviceAccount = require('./path/to/your/serviceAccountKey.json'); // Adjust path as needed
//
// Method 2: Load from Environment Variable (RECOMMENDED for Vercel/production)
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
    // Exit if Firebase fails to initialize to prevent further errors
    process.exit(1); 
}

const db = admin.firestore(); // Get a reference to the Firestore database
const COLLECTION_NAME = 'documentData'; // Name of your Firestore collection

app.use(cors());
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
        res.status(500).json({ message: 'Failed to load data', error: error.message });
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
        res.status(500).json({ message: 'Failed to save data to Firestore', error: error.message });
    }
});

// Export the Express app for Vercel Serverless Function
module.exports = app;
