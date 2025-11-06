import React, { useState } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import NotificationBell from './NotificationBell';

const Header = ({ user, onLogout }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    onLogout();
    setShowUserMenu(false);
  };

  return (
    <header style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginLeft: '250px', // Account for sidebar width
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#111827',
          margin: 0
        }}>
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#6b7280',
          margin: '0.25rem 0 0 0'
        }}>
          Here's what's happening at your gym today.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '0.375rem',
              color: '#374151',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
              {user?.name || 'User'}
            </span>
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '100%',
              marginTop: '0.5rem',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              minWidth: '200px',
              zIndex: 1000
            }}>
              <div style={{ padding: '0.5rem 0' }}>
                <div style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  borderBottom: '1px solid #f3f4f6'
                }}>
                  <div style={{ fontWeight: '500', color: '#111827' }}>
                    {user?.name || 'User'}
                  </div>
                  <div>{user?.email || 'user@example.com'}</div>
                </div>
                
                <button style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#374151',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <User size={16} />
                  Profile
                </button>
                
                <button style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#374151',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <Settings size={16} />
                  Settings
                </button>
                
                <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: '#ef4444',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close user menu when clicking outside */}
      {showUserMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;
