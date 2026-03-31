const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('frontend'));
app.use('/uploads', express.static('uploads'));

// Database
let students = [];
let results = {};
const dbPath = path.join(__dirname, 'database.json');

// Load Database
function loadDB() {
    try {
        if (fs.existsSync(dbPath)) {
            const data = fs.readFileSync(dbPath, 'utf8');
            const parsed = JSON.parse(data);
            students = parsed.students || [];
            results = parsed.results || {};
        }
    } catch (error) {
        console.log('Database load error, starting fresh');
    }
}

// Save Database
function saveDB() {
    try {
        fs.writeFileSync(dbPath, JSON.stringify({ students, results }, null, 2));
    } catch (error) {
        console.log('Database save error');
    }
}

loadDB();

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, 'marksheet-' + req.body.studentName + '-' + Date.now() + '.jpg');
    }
});
const upload = multer({ storage });

// Auth Routes
app.post('/api/auth/login', (req, res) => {
    const { id, password, type } = req.body;
    
    if (type === 'self' && id === 'gvs-website' && password === 'hacker-gvs-website-anmol') {
        res.json({ success: true, isAdmin: true, user: 'ADMIN' });
    } else if (type === 'student') {
        const student = students.find(s => s.name === id && s.password === password);
        if (student) {
            res.json({ success: true, isAdmin: false, user: student.name });
        } else {
            res.json({ success: false });
        }
    } else {
        res.json({ success: false });
    }
});

// Students Routes
app.get('/api/students', (req, res) => {
    res.json(students);
});

app.post('/api/students', (req, res) => {
    const { name, password, rollNo } = req.body;
    if (students.find(s => s.name === name)) {
        return res.json({ success: false, message: 'Student exists!' });
    }
    const newStudent = { name, password, rollNo: rollNo || 'N/A', createdAt: new Date().toISOString() };
    students.push(newStudent);
    saveDB();
    res.json({ success: true, student: newStudent });
});

// Results Routes
app.get('/api/results/:studentName', (req, res) => {
    const result = results[req.params.studentName] || {};
    res.json(result);
});

app.post('/api/results/upload', upload.single('marksheet'), (req, res) => {
    const studentName = req.body.studentName;
    const filename = req.file.filename;
    
    if (!results[studentName]) {
        results[studentName] = {};
    }
    results[studentName].marksheet = `/uploads/${filename}`;
    results[studentName].uploadedAt = new Date().toISOString();
    saveDB();
    res.json({ success: true, marksheet: `/uploads/${filename}` });
});

// Serve Frontend
app.get('*', (req, res) => {
    const filePath = req.path === '/' ? 'index.html' : req.path.replace('/', '');
    const fullPath = path.join(__dirname, 'frontend', filePath);
    
    if (fs.existsSync(fullPath)) {
        res.sendFile(fullPath);
    } else {
        res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
    }
});

app.listen(PORT, () => {
    console.log(`✅ GVS Server LIVE on port ${PORT}`);
});
