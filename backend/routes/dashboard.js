const express = require('express');
const db = require('../db');
const router = express.Router();

// Get dashboard summary
router.get('/summary', (req, res) => {
  const query = 'SELECT * FROM dashboard_summary WHERE id = 1';
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching dashboard summary:', err);
      return res.status(500).json({ message: 'Error fetching dashboard summary' });
    }
    
    if (results.length === 0) {
      // Initialize dashboard summary if it doesn't exist
      const initQuery = `
        INSERT INTO dashboard_summary (id, total_members, active_members, total_revenue)
        VALUES (1, 0, 0, 0.00)
      `;
      
      db.query(initQuery, (initErr) => {
        if (initErr) {
          console.error('Error initializing dashboard summary:', initErr);
          return res.status(500).json({ message: 'Error initializing dashboard' });
        }
        res.json({ id: 1, total_members: 0, active_members: 0, total_revenue: 0.00 });
      });
    } else {
      res.json(results[0]);
    }
  });
});

// Get detailed dashboard statistics
router.get('/stats', (req, res) => {
  const queries = {
    members: `
      SELECT 
        COUNT(*) as total_members,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_members,
        COUNT(CASE WHEN status = 'Inactive' THEN 1 END) as inactive_members,
        COUNT(CASE WHEN DATE(join_date) = CURDATE() THEN 1 END) as new_members_today
      FROM members
    `,
    payments: `
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_revenue,
        COUNT(CASE WHEN DATE(payment_date) = CURDATE() THEN 1 END) as payments_today,
        SUM(CASE WHEN DATE(payment_date) = CURDATE() THEN amount ELSE 0 END) as revenue_today
      FROM payments
    `,
    attendance: `
      SELECT 
        COUNT(*) as total_visits,
        COUNT(CASE WHEN DATE(check_in) = CURDATE() THEN 1 END) as visits_today,
        COUNT(CASE WHEN check_out IS NULL THEN 1 END) as currently_checked_in
      FROM attendance
    `,
    plans: `
      SELECT 
        COUNT(*) as total_plans,
        AVG(charge) as average_plan_price,
        MIN(charge) as cheapest_plan,
        MAX(charge) as most_expensive_plan
      FROM plans
    `
  };
  
  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;
  
  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, queryResults) => {
      if (err) {
        console.error(`Error fetching ${key} stats:`, err);
        results[key] = { error: `Error fetching ${key} statistics` };
      } else {
        results[key] = queryResults[0];
      }
      
      completed++;
      if (completed === total) {
        res.json(results);
      }
    });
  });
});

// Get recent activity
router.get('/recent-activity', (req, res) => {
  const queries = {
    recent_members: `
      SELECT name, join_date, status
      FROM members 
      ORDER BY created_at DESC 
      LIMIT 5
    `,
    recent_payments: `
      SELECT p.amount, p.payment_date, m.name as member_name
      FROM payments p
      JOIN members m ON p.member_id = m.member_id
      ORDER BY p.created_at DESC 
      LIMIT 5
    `,
    recent_attendance: `
      SELECT a.check_in, m.name as member_name
      FROM attendance a
      JOIN members m ON a.member_id = m.member_id
      ORDER BY a.check_in DESC 
      LIMIT 5
    `,
    recent_announcements: `
      SELECT message, created_at
      FROM announcements 
      ORDER BY created_at DESC 
      LIMIT 3
    `
  };
  
  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;
  
  Object.keys(queries).forEach(key => {
    db.query(queries[key], (err, queryResults) => {
      if (err) {
        console.error(`Error fetching ${key}:`, err);
        results[key] = { error: `Error fetching ${key}` };
      } else {
        results[key] = queryResults;
      }
      
      completed++;
      if (completed === total) {
        res.json(results);
      }
    });
  });
});

// Get monthly trends
router.get('/trends/monthly', (req, res) => {
  const { year } = req.query;
  const targetYear = year || new Date().getFullYear();
  
  const query = `
    SELECT 
      MONTH(join_date) as month,
      COUNT(*) as new_members,
      SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as active_members
    FROM members 
    WHERE YEAR(join_date) = ?
    GROUP BY MONTH(join_date)
    ORDER BY month
  `;
  
  db.query(query, [targetYear], (err, results) => {
    if (err) {
      console.error('Error fetching monthly trends:', err);
      return res.status(500).json({ message: 'Error fetching monthly trends' });
    }
    res.json(results);
  });
});

module.exports = router;
