
const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    const { id, password, type } = req.body;
    
    if (type === 'self' && id === 'gvs-website' && password === 'hacker-gvs-website-anmol') {
        res.json({ success: true, isAdmin: true, user: 'ADMIN' });
    } else if (type === 'student') {
        // Student login logic
        res.json({ success: true, isAdmin: false, user: req.body.name });
    } else {
        res.json({ success: false });
    }
});

module.exports = router;