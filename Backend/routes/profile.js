const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const { storage } = require('../config/cloudinary');

const router = express.Router();
const upload = multer({ storage });

// Helper: read & write db.json
function readDB() {
  return JSON.parse(fs.readFileSync('db.json', 'utf-8'));
}
function writeDB(data) {
  fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
}

// Get profile
router.get('/', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = readDB();
    const user = db.users.find(u => u.id === decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ ...user, password: undefined });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Update profile (name + image) —
router.put('/', upload.single('profileImage'), (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = readDB();
    const user = db.users.find(u => u.id === decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    const { name } = req.body;
    if (name) user.name = name;
    if (req.file?.path) user.profileImage = req.file.path;

    writeDB(db);
    res.json({ ...user, password: undefined });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
