const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all members
router.get('/', (req, res) => {
  const query = `
    SELECT m.*, p.plan_name, p.duration_months, p.charge, p.service_type
    FROM members m
    LEFT JOIN plans p ON m.plan_id = p.plan_id
    ORDER BY m.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching members:', err);
      return res.status(500).json({ message: 'Error fetching members' });
    }
    res.json(results);
  });
});

// Get member by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT m.*, p.plan_name, p.duration_months, p.charge, p.service_type
    FROM members m
    LEFT JOIN plans p ON m.plan_id = p.plan_id
    WHERE m.member_id = ?
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching member:', err);
      return res.status(500).json({ message: 'Error fetching member' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json(results[0]);
  });
});

// Generate unique member code
const generateMemberCode = async () => {
  try {
    // Get the last member code
    const query = 'SELECT member_code FROM members ORDER BY member_id DESC LIMIT 1';
    const result = await new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
    
    let nextNumber = 1;
    if (result.length > 0) {
      const lastCode = result[0].member_code;
      const lastNumber = parseInt(lastCode.replace('XF', ''));
      nextNumber = lastNumber + 1;
    }
    
    return `XF${nextNumber.toString().padStart(3, '0')}`;
  } catch (error) {
    console.error('Error generating member code:', error);
    return `XF${Date.now().toString().slice(-3)}`; // Fallback
  }
};

// Create new member
router.post('/', async (req, res) => {
  const { name, gender, contact, email, join_date, plan_id, status } = req.body;
  
  try {
    // Generate unique member code
    const memberCode = await generateMemberCode();
    
    // Always use current system date for join_date
    const currentDate = new Date().toISOString().split('T')[0];
    
    const query = `
      INSERT INTO members (member_code, name, gender, contact, email, join_date, plan_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.query(query, [memberCode, name, gender, contact, email, currentDate, plan_id, status || 'Active'], (err, result) => {
      if (err) {
        console.error('Error creating member:', err);
        return res.status(500).json({ message: 'Error creating member' });
      }
      res.status(201).json({ 
        message: 'Member created successfully', 
        member_id: result.insertId,
        member_code: memberCode
      });
    });
  } catch (error) {
    console.error('Error in member creation:', error);
    res.status(500).json({ message: 'Error creating member' });
  }
});

// Update member
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, gender, contact, email, join_date, plan_id, status } = req.body;
  
  const query = `
    UPDATE members 
    SET name = ?, gender = ?, contact = ?, email = ?, join_date = ?, plan_id = ?, status = ?
    WHERE member_id = ?
  `;
  
  db.query(query, [name, gender, contact, email, join_date, plan_id, status, id], (err, result) => {
    if (err) {
      console.error('Error updating member:', err);
      return res.status(500).json({ message: 'Error updating member' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Member updated successfully' });
  });
});

// Delete member
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM members WHERE member_id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting member:', err);
      return res.status(500).json({ message: 'Error deleting member' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    res.json({ message: 'Member deleted successfully' });
  });
});

module.exports = router;
