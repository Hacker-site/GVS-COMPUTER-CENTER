const express = require('express');
const router = express.Router();
const db = require('../db'); // database.json

// Get all students (Admin only)
router.get('/', (req, res) => {
    res.json(db.data.students || []);
});

// Add new student (Admin only)
router.post('/', (req, res) => {
    const { name, password } = req.body;
    const newStudent = { name, password, createdAt: new Date().toISOString() };
    db.data.students.push(newStudent);
    db.write();
    res.json({ success: true, student: newStudent });
});

// Student login
router.post('/login', (req, res) => {
    const { name, password } = req.body;
    const student = db.data.students.find(s => s.name === name && s.password === password);
    if (student) {
        res.json({ success: true, student });
    } else {
        res.json({ success: false });
    }
});

module.exports = router;