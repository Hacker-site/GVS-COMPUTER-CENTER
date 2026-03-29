const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const db = require('../db');

// Multer setup
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `marksheet-${req.body.studentName}-${Date.now()}.jpg`);
    }
});
const upload = multer({ storage });

router.get('/:studentName', (req, res) => {
    const result = db.data.results[req.params.studentName];
    res.json(result || {});
});

router.post('/upload', upload.single('marksheet'), (req, res) => {
    const studentName = req.body.studentName;
    const marksheetPath = `/uploads/${req.file.filename}`;
    
    if (!db.data.results[studentName]) {
        db.data.results[studentName] = {};
    }
    db.data.results[studentName].marksheet = marksheetPath;
    db.data.results[studentName].uploadedAt = new Date().toISOString();
    
    db.write();
    res.json({ success: true, marksheet: marksheetPath });
});

module.exports = router;