const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all plans
router.get('/', (req, res) => {
  const query = 'SELECT * FROM plans ORDER BY charge ASC';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching plans:', err);
      return res.status(500).json({ message: 'Error fetching plans' });
    }
    res.json(results);
  });
});

// Get plan by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM plans WHERE plan_id = ?';
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching plan:', err);
      return res.status(500).json({ message: 'Error fetching plan' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json(results[0]);
  });
});

// Create new plan
router.post('/', (req, res) => {
  const { plan_name, duration_months, charge, service_type } = req.body;
  
  const query = `
    INSERT INTO plans (plan_name, duration_months, charge, service_type)
    VALUES (?, ?, ?, ?)
  `;
  
  db.query(query, [plan_name, duration_months, charge, service_type], (err, result) => {
    if (err) {
      console.error('Error creating plan:', err);
      return res.status(500).json({ message: 'Error creating plan' });
    }
    res.status(201).json({ 
      message: 'Plan created successfully', 
      plan_id: result.insertId 
    });
  });
});

// Update plan
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { plan_name, duration_months, charge, service_type } = req.body;
  
  const query = `
    UPDATE plans 
    SET plan_name = ?, duration_months = ?, charge = ?, service_type = ?
    WHERE plan_id = ?
  `;
  
  db.query(query, [plan_name, duration_months, charge, service_type, id], (err, result) => {
    if (err) {
      console.error('Error updating plan:', err);
      return res.status(500).json({ message: 'Error updating plan' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json({ message: 'Plan updated successfully' });
  });
});

// Delete plan
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // Check if plan is being used by any members
  const checkQuery = 'SELECT COUNT(*) as count FROM members WHERE plan_id = ?';
  
  db.query(checkQuery, [id], (err, results) => {
    if (err) {
      console.error('Error checking plan usage:', err);
      return res.status(500).json({ message: 'Error checking plan usage' });
    }
    
    if (results[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete plan. It is currently assigned to members.' 
      });
    }
    
    const deleteQuery = 'DELETE FROM plans WHERE plan_id = ?';
    
    db.query(deleteQuery, [id], (err, result) => {
      if (err) {
        console.error('Error deleting plan:', err);
        return res.status(500).json({ message: 'Error deleting plan' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Plan not found' });
      }
      res.json({ message: 'Plan deleted successfully' });
    });
  });
});

module.exports = router;
