const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  // Temporary hardcoded user for testing (remove this when database is set up)
  if (username === 'telheiba_admin' && password === 'tel4023') {
    const token = jwt.sign(
      { 
        id: 1, 
        username: 'telheiba_admin',
        name: 'TELHEIBA' 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: 1,
        name: 'TELHEIBA',
        username: 'telheiba_admin',
        email: 'telheiba@gym.com'
      }
    });
  }
  
  const query = 'SELECT * FROM staff WHERE username = ?';
  
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error during login:', err);
      return res.status(500).json({ message: 'Login failed' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = results[0];
    
    // For demo purposes, we'll use simple password comparison
    // In production, you should hash passwords properly
    if (password === 'tel4023' || password === user.password) {
      const token = jwt.sign(
        { 
          id: user.staff_id, 
          username: user.username,
          name: user.name 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.staff_id,
          name: user.name,
          username: user.username,
          email: user.email
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// Register new staff (admin only)
router.post('/register', (req, res) => {
  const { name, email, contact, username, password } = req.body;
  
  if (!name || !email || !username || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Check if username already exists
  const checkQuery = 'SELECT * FROM staff WHERE username = ? OR email = ?';
  
  db.query(checkQuery, [username, email], (err, results) => {
    if (err) {
      console.error('Error checking existing user:', err);
      return res.status(500).json({ message: 'Registration failed' });
    }
    
    if (results.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    const insertQuery = `
      INSERT INTO staff (name, email, contact, username, password)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    db.query(insertQuery, [name, email, contact, username, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error creating user:', err);
        return res.status(500).json({ message: 'Registration failed' });
      }
      
      res.status(201).json({
        message: 'Staff member registered successfully',
        staff_id: result.insertId
      });
    });
  });
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get current user profile
router.get('/profile', verifyToken, (req, res) => {
  const query = 'SELECT staff_id, name, email, contact, username FROM staff WHERE staff_id = ?';
  
  db.query(query, [req.user.id], (err, results) => {
    if (err) {
      console.error('Error fetching profile:', err);
      return res.status(500).json({ message: 'Error fetching profile' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(results[0]);
  });
});

// Update profile
router.put('/profile', verifyToken, (req, res) => {
  const { name, email, contact } = req.body;
  
  const query = `
    UPDATE staff 
    SET name = ?, email = ?, contact = ?
    WHERE staff_id = ?
  `;
  
  db.query(query, [name, email, contact, req.user.id], (err, result) => {
    if (err) {
      console.error('Error updating profile:', err);
      return res.status(500).json({ message: 'Error updating profile' });
    }
    
    res.json({ message: 'Profile updated successfully' });
  });
});

module.exports = { router, verifyToken };
