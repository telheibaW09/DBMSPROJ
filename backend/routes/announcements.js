const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all announcements
router.get('/', (req, res) => {
  const query = 'SELECT * FROM announcements ORDER BY created_at DESC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching announcements:', err);
      return res.status(500).json({ message: 'Error fetching announcements' });
    }
    res.json(results);
  });
});

// Get announcement by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM announcements WHERE announcement_id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching announcement:', err);
      return res.status(500).json({ message: 'Error fetching announcement' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json(results[0]);
  });
});

// Create new announcement
router.post('/', (req, res) => {
  const { message } = req.body;
  
  if (!message || message.trim() === '') {
    return res.status(400).json({ message: 'Message is required' });
  }
  
  const query = 'INSERT INTO announcements (message) VALUES (?)';
  
  db.query(query, [message.trim()], (err, result) => {
    if (err) {
      console.error('Error creating announcement:', err);
      return res.status(500).json({ message: 'Error creating announcement' });
    }
    res.status(201).json({ 
      message: 'Announcement created successfully', 
      announcement_id: result.insertId 
    });
  });
});

// Update announcement
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  
  if (!message || message.trim() === '') {
    return res.status(400).json({ message: 'Message is required' });
  }
  
  const query = 'UPDATE announcements SET message = ? WHERE announcement_id = ?';
  
  db.query(query, [message.trim(), id], (err, result) => {
    if (err) {
      console.error('Error updating announcement:', err);
      return res.status(500).json({ message: 'Error updating announcement' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ message: 'Announcement updated successfully' });
  });
});

// Delete announcement
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM announcements WHERE announcement_id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting announcement:', err);
      return res.status(500).json({ message: 'Error deleting announcement' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    res.json({ message: 'Announcement deleted successfully' });
  });
});

// Get recent announcements (last 5)
router.get('/recent/list', (req, res) => {
  const query = 'SELECT * FROM announcements ORDER BY created_at DESC LIMIT 5';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching recent announcements:', err);
      return res.status(500).json({ message: 'Error fetching recent announcements' });
    }
    res.json(results);
  });
});

module.exports = router;
