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
app.use(express.static('frontend'));
app.use('/uploads', express.static('uploads'));

// SIMPLE JSON Database - NO lowdb
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
        students = [];
        results = {};
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

// Multer for uploads
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

// API Routes
app.get('/api/students', (req, res) => {
    res.json(students);
});

app.post('/api/students', (req, res) => {
    const { name, password } = req.body;
    if (students.find(s => s.name === name)) {
        return res.json({ success: false, message: 'Student exists!' });
    }
    const newStudent = { name, password, createdAt: new Date().toISOString() };
    students.push(newStudent);
    saveDB();
    res.json({ success: true, student: newStudent });
});

app.post('/api/students/login', (req, res) => {
    const { name, password } = req.body;
    const student = students.find(s => s.name === name && s.password === password);
    res.json({ success: !!student, student });
});

app.get('/api/students/:name/result', (req, res) => {
    const result = results[req.params.name] || {};
    res.json(result);
});

app.post('/api/marksheet', upload.single('marksheet'), (req, res) => {
    const studentName = req.body.studentName;
    const filename = req.file.filename;
    results[studentName] = {
        marksheet: `/uploads/${filename}`,
        uploadedAt: new Date().toISOString()
    };
    saveDB();
    res.json({ success: true, marksheet: `/uploads/${filename}` });
});

// Serve Frontend
app.get(['/', '/index.html', '/about.html', '/courses.html', '/contact.html', '/form.html', '/login.html', '/result.html'], (req, res) => {
    const page = req.path === '/' ? 'index.html' : req.path.replace('/', '');
    res.sendFile(path.join(__dirname, 'frontend', page));
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`✅ GVS Server LIVE on port ${PORT}`);
});