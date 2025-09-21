const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const fs = require('fs');

const router = express.Router();
const upload = multer({ storage });

// Helper: read & write db.json
function readDB() {
  return JSON.parse(fs.readFileSync('db.json', 'utf-8'));
}
function writeDB(data) {
  fs.writeFileSync('db.json', JSON.stringify(data, null, 2));
}

// Signup
router.post('/signup', (req, res) => {
  const db = readDB();
  const { name, email, password } = req.body;

  if (db.users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword,
    profileImage: ''
  };

  db.users.push(newUser);
  writeDB(db);

  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { ...newUser, password: undefined } });
});

// Login
router.post('/login', (req, res) => {
  const db = readDB();
  const { email, password } = req.body;

  const user = db.users.find(u => u.email === email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { ...user, password: undefined } });
});

// Get Profile
router.get('/profile', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = readDB();
    const user = db.users.find(u => u.id === decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ ...user, password: undefined });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Update Profile (with image)
router.put('/profile', upload.single('profileImage'), (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = readDB();
    const user = db.users.find(u => u.id === decoded.id);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name } = req.body;
    if (name) user.name = name;
    if (req.file?.path) user.profileImage = req.file.path;

    writeDB(db);
    res.json({ ...user, password: undefined });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
