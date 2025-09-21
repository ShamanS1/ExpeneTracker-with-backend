const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const router = express.Router();

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

module.exports = router;
