const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all payments
router.get('/', (req, res) => {
  const query = `
    SELECT p.*, m.name as member_name, m.contact, pl.plan_name
    FROM payments p
    JOIN members m ON p.member_id = m.member_id
    JOIN plans pl ON p.plan_id = pl.plan_id
    ORDER BY p.payment_date DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching payments:', err);
      return res.status(500).json({ message: 'Error fetching payments' });
    }
    res.json(results);
  });
});

// Get payments by member ID
router.get('/member/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT p.*, pl.plan_name
    FROM payments p
    JOIN plans pl ON p.plan_id = pl.plan_id
    WHERE p.member_id = ?
    ORDER BY p.payment_date DESC
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching member payments:', err);
      return res.status(500).json({ message: 'Error fetching payments' });
    }
    res.json(results);
  });
});

// Get payment by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT p.*, m.name as member_name, m.contact, pl.plan_name
    FROM payments p
    JOIN members m ON p.member_id = m.member_id
    JOIN plans pl ON p.plan_id = pl.plan_id
    WHERE p.payment_id = ?
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching payment:', err);
      return res.status(500).json({ message: 'Error fetching payment' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(results[0]);
  });
});

// Create new payment
router.post('/', (req, res) => {
  const { member_id, plan_id, amount, payment_date, receipt_no } = req.body;
  
  // Always use current system date for payments
  const payDate = new Date().toISOString().split('T')[0];
  
  const query = `
    INSERT INTO payments (member_id, plan_id, amount, payment_date, receipt_no)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  db.query(query, [member_id, plan_id, amount, payDate, receipt_no], (err, result) => {
    if (err) {
      console.error('Error creating payment:', err);
      return res.status(500).json({ message: 'Error creating payment' });
    }
    res.status(201).json({ 
      message: 'Payment recorded successfully', 
      payment_id: result.insertId 
    });
  });
});

// Update payment
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { member_id, plan_id, amount, payment_date, receipt_no } = req.body;
  
  const query = `
    UPDATE payments 
    SET member_id = ?, plan_id = ?, amount = ?, payment_date = ?, receipt_no = ?
    WHERE payment_id = ?
  `;
  
  db.query(query, [member_id, plan_id, amount, payment_date, receipt_no, id], (err, result) => {
    if (err) {
      console.error('Error updating payment:', err);
      return res.status(500).json({ message: 'Error updating payment' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ message: 'Payment updated successfully' });
  });
});

// Delete payment
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM payments WHERE payment_id = ?';
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting payment:', err);
      return res.status(500).json({ message: 'Error deleting payment' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  });
});

// Get payment statistics
router.get('/stats/summary', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_payments,
      SUM(amount) as total_revenue,
      AVG(amount) as average_payment,
      COUNT(DISTINCT member_id) as paying_members
    FROM payments
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching payment stats:', err);
      return res.status(500).json({ message: 'Error fetching payment statistics' });
    }
    res.json(results[0]);
  });
});

// Get monthly revenue report
router.get('/report/monthly', (req, res) => {
  const { month, year } = req.query;
  const targetMonth = month || new Date().getMonth() + 1;
  const targetYear = year || new Date().getFullYear();
  
  const query = `
    SELECT 
      DATE(payment_date) as date,
      COUNT(*) as payment_count,
      SUM(amount) as daily_revenue
    FROM payments 
    WHERE MONTH(payment_date) = ? AND YEAR(payment_date) = ?
    GROUP BY DATE(payment_date)
    ORDER BY date DESC
  `;
  
  db.query(query, [targetMonth, targetYear], (err, results) => {
    if (err) {
      console.error('Error fetching monthly revenue report:', err);
      return res.status(500).json({ message: 'Error fetching monthly revenue report' });
    }
    res.json(results);
  });
});

module.exports = router;
