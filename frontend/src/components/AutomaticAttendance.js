import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { QrCode, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { attendanceAPI } from '../services/api';

const AutomaticAttendance = () => {
  const [memberCode, setMemberCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);

  const handleCheckIn = async () => {
    if (!memberCode.trim()) {
      toast.error('Please enter a member code');
      return;
    }

    setLoading(true);
    try {
      const response = await attendanceAPI.checkIn({ member_code: memberCode.trim() });
      setLastAction({
        type: 'checkin',
        member: response.data.member_name,
        time: response.data.check_in_time
      });
      toast.success(`${response.data.member_name} checked in successfully!`);
      setMemberCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!memberCode.trim()) {
      toast.error('Please enter a member code');
      return;
    }

    setLoading(true);
    try {
      const response = await attendanceAPI.checkOut({ member_code: memberCode.trim() });
      setLastAction({
        type: 'checkout',
        member: response.data.member_name,
        time: response.data.check_out_time
      });
      toast.success(`${response.data.member_name} checked out successfully!`);
      setMemberCode('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      // Auto-detect if member is checking in or out
      // For now, default to check-in, but you can implement logic to detect
      handleCheckIn();
    }
  };

  return (
    <div style={{ marginLeft: '250px', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          ⚡ X-TREME FITNESS
        </h1>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
          Automatic Check-In/Check-Out System
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Check-In Panel */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: 'white'
        }}>
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2rem'
            }}>
              <CheckCircle />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              CHECK IN
            </h2>
            <p style={{ opacity: 0.9, marginBottom: '2rem' }}>
              Scan QR code or enter member ID to check in
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Enter Member ID"
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  letterSpacing: '1px'
                }}
                disabled={loading}
              />
              <button
                onClick={handleCheckIn}
                disabled={loading || !memberCode.trim()}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading || !memberCode.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !memberCode.trim() ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Processing...' : 'CHECK IN'}
              </button>
            </div>
          </div>
        </div>

        {/* Check-Out Panel */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
          color: 'white'
        }}>
          <div className="card-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2rem'
            }}>
              <XCircle />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              CHECK OUT
            </h2>
            <p style={{ opacity: 0.9, marginBottom: '2rem' }}>
              Scan QR code or enter member ID to check out
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <input
                type="text"
                value={memberCode}
                onChange={(e) => setMemberCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Enter Member ID"
                style={{
                  flex: 1,
                  padding: '1rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  textAlign: 'center',
                  letterSpacing: '1px'
                }}
                disabled={loading}
              />
              <button
                onClick={handleCheckOut}
                disabled={loading || !memberCode.trim()}
                style={{
                  padding: '1rem 2rem',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading || !memberCode.trim() ? 'not-allowed' : 'pointer',
                  opacity: loading || !memberCode.trim() ? 0.5 : 1,
                  transition: 'all 0.2s'
                }}
              >
                {loading ? 'Processing...' : 'CHECK OUT'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Last Action Display */}
      {lastAction && (
        <div className="card" style={{ 
          backgroundColor: lastAction.type === 'checkin' ? '#dcfce7' : '#fee2e2',
          border: `2px solid ${lastAction.type === 'checkin' ? '#10b981' : '#ef4444'}`
        }}>
          <div className="card-body" style={{ textAlign: 'center' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {lastAction.type === 'checkin' ? (
                <CheckCircle size={32} color="#10b981" />
              ) : (
                <XCircle size={32} color="#ef4444" />
              )}
              <h3 style={{ 
                margin: 0, 
                color: lastAction.type === 'checkin' ? '#10b981' : '#ef4444',
                fontSize: '1.25rem',
                fontWeight: 'bold'
              }}>
                {lastAction.type === 'checkin' ? 'CHECKED IN' : 'CHECKED OUT'}
              </h3>
            </div>
            <p style={{ 
              margin: '0.5rem 0', 
              fontSize: '1.125rem', 
              fontWeight: '600',
              color: '#111827'
            }}>
              {lastAction.member}
            </p>
            <p style={{ 
              margin: 0, 
              color: '#6b7280',
              fontSize: '0.875rem'
            }}>
              {new Date(lastAction.time).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-body">
          <h3 style={{ marginBottom: '1rem', color: '#111827' }}>How to Use:</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                1
              </div>
              <span>Enter member ID in the input field</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                2
              </div>
              <span>Click CHECK IN when arriving at the gym</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                3
              </div>
              <span>Click CHECK OUT when leaving the gym</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#8b5cf6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold'
              }}>
                4
              </div>
              <span>System automatically records date and time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomaticAttendance;
