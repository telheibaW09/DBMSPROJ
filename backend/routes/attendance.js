const express = require('express');
const db = require('../db');
const router = express.Router();

// Get all attendance records
router.get('/', (req, res) => {
  const query = `
    SELECT a.*, m.name as member_name, m.contact
    FROM attendance a
    JOIN members m ON a.member_id = m.member_id
    ORDER BY a.check_in DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching attendance:', err);
      return res.status(500).json({ message: 'Error fetching attendance records' });
    }
    res.json(results);
  });
});

// Get attendance by member ID
router.get('/member/:id', (req, res) => {
  const { id } = req.params;
  const query = `
    SELECT a.*, m.name as member_name
    FROM attendance a
    JOIN members m ON a.member_id = m.member_id
    WHERE a.member_id = ?
    ORDER BY a.check_in DESC
  `;
  
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error fetching member attendance:', err);
      return res.status(500).json({ message: 'Error fetching attendance records' });
    }
    res.json(results);
  });
});

// Get today's attendance
router.get('/today', (req, res) => {
  const query = `
    SELECT a.*, m.name as member_name, m.contact
    FROM attendance a
    JOIN members m ON a.member_id = m.member_id
    WHERE DATE(a.check_in) = CURDATE()
    ORDER BY a.check_in DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching today\'s attendance:', err);
      return res.status(500).json({ message: 'Error fetching today\'s attendance' });
    }
    res.json(results);
  });
});

// Automatic check-in (member scans QR code or enters member code)
router.post('/checkin', (req, res) => {
  const { member_code } = req.body;
  
  if (!member_code) {
    return res.status(400).json({ message: 'Member code is required' });
  }
  
  // First, find the member by member_code
  const findMemberQuery = 'SELECT member_id, name, status FROM members WHERE member_code = ?';
  
  db.query(findMemberQuery, [member_code], (err, memberResults) => {
    if (err) {
      console.error('Error finding member:', err);
      return res.status(500).json({ message: 'Error finding member' });
    }
    
    if (memberResults.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const member = memberResults[0];
    
    if (member.status !== 'Active') {
      return res.status(400).json({ message: 'Member account is not active' });
    }
    
    // Check if member is already checked in (no check-out time)
    const checkExistingQuery = `
      SELECT attendance_id FROM attendance 
      WHERE member_id = ? AND check_out IS NULL 
      ORDER BY check_in DESC LIMIT 1
    `;
    
    db.query(checkExistingQuery, [member.member_id], (err, existingResults) => {
      if (err) {
        console.error('Error checking existing attendance:', err);
        return res.status(500).json({ message: 'Error checking attendance' });
      }
      
      if (existingResults.length > 0) {
        return res.status(400).json({ message: 'Member is already checked in' });
      }
      
      // Record automatic check-in with current system time
      const checkInTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const insertQuery = `
        INSERT INTO attendance (member_id, check_in)
        VALUES (?, ?)
      `;
      
      db.query(insertQuery, [member.member_id, checkInTime], (err, result) => {
        if (err) {
          console.error('Error recording check-in:', err);
          return res.status(500).json({ message: 'Error recording check-in' });
        }
        res.status(201).json({ 
          message: 'Check-in successful', 
          attendance_id: result.insertId,
          member_name: member.name,
          check_in_time: checkInTime
        });
      });
    });
  });
});

// Automatic check-out (member scans QR code or enters member code)
router.post('/checkout', (req, res) => {
  const { member_code } = req.body;
  
  if (!member_code) {
    return res.status(400).json({ message: 'Member code is required' });
  }
  
  // First, find the member by member_code
  const findMemberQuery = 'SELECT member_id, name FROM members WHERE member_code = ?';
  
  db.query(findMemberQuery, [member_code], (err, memberResults) => {
    if (err) {
      console.error('Error finding member:', err);
      return res.status(500).json({ message: 'Error finding member' });
    }
    
    if (memberResults.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    const member = memberResults[0];
    
    // Find the latest check-in without check-out
    const findAttendanceQuery = `
      SELECT attendance_id, check_in FROM attendance 
      WHERE member_id = ? AND check_out IS NULL 
      ORDER BY check_in DESC LIMIT 1
    `;
    
    db.query(findAttendanceQuery, [member.member_id], (err, attendanceResults) => {
      if (err) {
        console.error('Error finding attendance record:', err);
        return res.status(500).json({ message: 'Error finding attendance record' });
      }
      
      if (attendanceResults.length === 0) {
        return res.status(400).json({ message: 'No active check-in found for this member' });
      }
      
      const attendance = attendanceResults[0];
      
      // Record automatic check-out with current system time
      const checkOutTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const updateQuery = `
        UPDATE attendance 
        SET check_out = ?
        WHERE attendance_id = ?
      `;
      
      db.query(updateQuery, [checkOutTime, attendance.attendance_id], (err, result) => {
        if (err) {
          console.error('Error recording check-out:', err);
          return res.status(500).json({ message: 'Error recording check-out' });
        }
        
        res.json({ 
          message: 'Check-out successful',
          member_name: member.name,
          check_in_time: attendance.check_in,
          check_out_time: checkOutTime
        });
      });
    });
  });
});

// Get attendance statistics
router.get('/stats/summary', (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_visits,
      COUNT(DISTINCT member_id) as unique_members_today,
      COUNT(CASE WHEN check_out IS NULL THEN 1 END) as currently_checked_in
    FROM attendance 
    WHERE DATE(check_in) = CURDATE()
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching attendance stats:', err);
      return res.status(500).json({ message: 'Error fetching attendance statistics' });
    }
    res.json(results[0]);
  });
});

// Get monthly attendance report
router.get('/report/monthly', (req, res) => {
  const { month, year } = req.query;
  const targetMonth = month || new Date().getMonth() + 1;
  const targetYear = year || new Date().getFullYear();
  
  const query = `
    SELECT 
      DATE(check_in) as date,
      COUNT(*) as total_visits,
      COUNT(DISTINCT member_id) as unique_members
    FROM attendance 
    WHERE MONTH(check_in) = ? AND YEAR(check_in) = ?
    GROUP BY DATE(check_in)
    ORDER BY date DESC
  `;
  
  db.query(query, [targetMonth, targetYear], (err, results) => {
    if (err) {
      console.error('Error fetching monthly report:', err);
      return res.status(500).json({ message: 'Error fetching monthly report' });
    }
    res.json(results);
  });
});

module.exports = router;
