import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  Package, 
  Megaphone,
  Menu
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/members', icon: Users, label: 'Members' },
    { path: '/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/plans', icon: Package, label: 'Plans' },
    { path: '/announcements', icon: Megaphone, label: 'Announcements' },
  ];

  return (
    <div style={{
      width: '250px',
      backgroundColor: '#1e293b',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000
    }}>
      {/* Logo */}
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #334155',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#ef4444',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          letterSpacing: '1px'
        }}>
          ⚡ X-TREME FITNESS
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          marginTop: '0.25rem',
          fontWeight: '500'
        }}>
          Management System
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                color: isActive ? '#3b82f6' : '#cbd5e1',
                textDecoration: 'none',
                backgroundColor: isActive ? '#1e40af' : 'transparent',
                borderRight: isActive ? '3px solid #3b82f6' : '3px solid transparent',
                transition: 'all 0.2s',
                fontSize: '0.875rem',
                fontWeight: isActive ? '500' : '400'
              })}
            >
              <Icon size={18} style={{ marginRight: '0.75rem' }} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid #334155',
        fontSize: '0.75rem',
        color: '#94a3b8',
        textAlign: 'center'
      }}>
        © 2024 X-TREME FITNESS
      </div>
    </div>
  );
};

export default Sidebar;
