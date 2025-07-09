// api/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // ตรวจสอบว่า import ถูกต้อง

// ... (ส่วน Firebase Admin SDK Initialization) ...

const app = express();

// *** เปลี่ยนกลับไปใช้แบบง่ายที่สุดเพื่อการทดสอบ ***
app.use(cors()); // อนุญาตทุก Origin

app.use(bodyParser.json());

// ... (API Endpoints ของคุณ) ...

module.exports = app;
