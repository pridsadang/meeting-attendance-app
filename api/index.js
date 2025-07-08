const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();

// WARNING: Using a local file for data storage (/tmp/data.json) on Serverless Functions
// like Vercel is NOT PERSISTENT across invocations.
// For production, you MUST use a proper external database (e.g., MongoDB Atlas, PostgreSQL, Redis).
// This is for demonstration purposes only.
const DATA_FILE = path.join('/tmp', 'data.json'); 

// CORS configuration:
// For development, allow all origins: app.use(cors());
// For production, specify your frontend domain:
// const allowedOrigins = ['https://meeting-attendance-app-1zu8.vercel.app/']; // Replace with your actual Vercel frontend URL
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

// Function to load data from the temporary file
const loadDataFromFile = () => {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(data);
        }
        return null; // Return null if file doesn't exist
    } catch (error) {
        console.error('Error loading data from file:', error);
        return null;
    }
};

// Function to save data to the temporary file
const saveDataToFile = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log('Data saved to:', DATA_FILE);
        return true;
    } catch (error) {
        console.error('Error saving data to file:', error);
        return false;
    }
};

// API endpoint to get the latest data
app.get('/api/data', (req, res) => {
    const data = loadDataFromFile();
    if (data) {
        res.status(200).json(data);
    } else {
        // If no data or error loading, return an empty object to initialize frontend
        res.status(200).json({}); 
    }
});

// API endpoint to save new data
app.post('/api/data', (req, res) => {
    const newData = req.body;
    if (saveDataToFile(newData)) {
        res.status(200).json({ message: 'Data saved successfully' });
    } else {
        res.status(500).json({ message: 'Failed to save data' });
    }
});

// Export the Express app for Vercel Serverless Function
module.exports = app;
