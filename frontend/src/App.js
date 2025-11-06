import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Members from './components/Members';
import AutomaticAttendance from './components/AutomaticAttendance';
import Payments from './components/Payments';
import Plans from './components/Plans';
import Announcements from './components/Announcements';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ToastContainer />
      </>
    );
  }

  return (
    <NotificationProvider>
      <Router>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Header user={user} onLogout={handleLogout} />
            <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/members" element={<Members />} />
                <Route path="/attendance" element={<AutomaticAttendance />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/announcements" element={<Announcements />} />
              </Routes>
            </main>
          </div>
        </div>
        <ToastContainer />
      </Router>
    </NotificationProvider>
  );
}

export default App;
