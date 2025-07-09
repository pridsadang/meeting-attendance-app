const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// ... (ส่วน Firebase Admin SDK Initialization ของคุณ ยังคงเหมือนเดิม) ...

const db = admin.firestore();
const COLLECTION_NAME = 'documentData';

// *** ส่วนนี้คือการแก้ไข CORS ***
// อนุญาตให้ทุก subdomain ของ .vercel.app เข้าถึงได้
const corsOptions = {
  origin: (origin, callback) => {
    // อนุญาตถ้า origin ไม่มี หรือถ้ามาจาก *.vercel.app
    if (!origin || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // อนุญาต Methods ที่ต้องการ
  allowedHeaders: ['Content-Type', 'Authorization'], // อนุญาต Headers ที่ใช้
};

app.use(cors(corsOptions)); // ใช้ cors พร้อม options ที่กำหนด

app.use(bodyParser.json());

// ... (ส่วน API Endpoints (GET /api/data และ POST /api/data) ของคุณ ยังคงเหมือนเดิม) ...

module.exports = app;
