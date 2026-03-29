const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));
app.use('/uploads', express.static('uploads'));

// Database Setup
const dbPath = path.join(__dirname, 'database.json');
const defaultData = {
    students: [],
    results: {}
};

const adapter = new JSONFile(dbPath, defaultData);
const db = new Low(adapter);

// Initialize database
async function initDb() {
    await db.read();
    db.data ||= defaultData;
    await db.write();
}
initDb();

// Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'marksheet-' + req.body.studentName + '-' + uniqueSuffix + '.jpg');
    }
});

const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Student Routes
app.post('/api/students/login', async (req, res) => {
    await db.read();
    const { name, password } = req.body;
    const student = db.data.students.find(s => s.name === name && s.password === password);
    
    if (student) {
        res.json({ success: true, student });
    } else {
        res.json({ success: false });
    }
});

app.get('/api/students', async (req, res) => {
    await db.read();
    res.json(db.data.students);
});

app.post('/api/students', async (req, res) => {
    await db.read();
    const { name, password } = req.body;
    
    // Check if student already exists
    if (db.data.students.find(s => s.name === name)) {
        return res.json({ success: false, message: 'Student already exists!' });
    }
    
    const newStudent = {
        name,
        password,
        createdAt: new Date().toISOString()
    };
    
    db.data.students.push(newStudent);
    await db.write();
    
    res.json({ success: true, student: newStudent });
});

app.get('/api/students/:name/result', async (req, res) => {
    await db.read();
    const student = db.data.students.find(s => s.name === req.params.name);
    const result = db.data.results[req.params.name];
    
    if (student && result) {
        res.json({
            name: student.name,
            course: result.course || 'N/A',
            marksheet: result.marksheet,
            photo: result.photo
        });
    } else {
        res.json({ name: student?.name || req.params.name });
    }
});

// Marksheet Upload
app.post('/api/marksheet', upload.single('marksheet'), async (req, res) => {
    await db.read();
    const studentName = req.body.studentName;
    const marksheetPath = `/uploads/${req.file.filename}`;
    
    if (!db.data.results[studentName]) {
        db.data.results[studentName] = {};
    }
    
    db.data.results[studentName].marksheet = marksheetPath;
    db.data.results[studentName].uploadedAt = new Date().toISOString();
    
    await db.write();
    
    res.json({ success: true, marksheet: marksheetPath });
});

// Serve other HTML pages
app.get('/form.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'form.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'login.html'));
});

app.get('/result.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'result.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'about.html'));
});

app.get('/courses.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'courses.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'contact.html'));
});

app.listen(PORT, () => {
    console.log(`GVS Server running on port ${PORT}`);
});