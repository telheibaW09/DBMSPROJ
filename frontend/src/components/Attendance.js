import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Clock, 
  LogOut, 
  Search, 
  Calendar,
  User,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { attendanceAPI, membersAPI } from '../services/api';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [selectedMember, setSelectedMember] = useState(null);

  const [checkInData, setCheckInData] = useState({
    member_id: '',
    check_in_time: ''
  });

  const [checkOutData, setCheckOutData] = useState({
    check_out_time: ''
  });

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const fetchData = async () => {
    try {
      let attendanceResponse;
      if (dateFilter === 'today') {
        attendanceResponse = await attendanceAPI.getToday();
      } else {
        attendanceResponse = await attendanceAPI.getAll();
      }
      
      const membersResponse = await membersAPI.getAll();
      setAttendance(attendanceResponse.data);
      setMembers(membersResponse.data);
    } catch (error) {
      toast.error('Error fetching attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    try {
      await attendanceAPI.checkIn(checkInData);
      toast.success('Check-in recorded successfully');
      fetchData();
      resetCheckInForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error recording check-in');
    }
  };

  const handleCheckOut = async (e) => {
    e.preventDefault();
    try {
      await attendanceAPI.checkOut(selectedMember.attendance_id, checkOutData);
      toast.success('Check-out recorded successfully');
      fetchData();
      resetCheckOutForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error recording check-out');
    }
  };

  const resetCheckInForm = () => {
    setCheckInData({
      member_id: '',
      check_in_time: ''
    });
    setShowCheckInModal(false);
  };

  const resetCheckOutForm = () => {
    setCheckOutData({
      check_out_time: ''
    });
    setSelectedMember(null);
    setShowCheckOutModal(false);
  };

  const openCheckOutModal = (attendanceRecord) => {
    setSelectedMember(attendanceRecord);
    setCheckOutData({
      check_out_time: new Date().toISOString().slice(0, 16)
    });
    setShowCheckOutModal(true);
  };

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.contact?.includes(searchTerm);
    return matchesSearch;
  });

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not checked out';
    return new Date(dateTime).toLocaleString();
  };

  const getDuration = (checkIn, checkOut) => {
    if (!checkOut) return 'In progress';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ marginLeft: '250px', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            Attendance
          </h1>
          <p style={{ color: '#6b7280' }}>
            Track member check-ins and check-outs
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => setShowCheckInModal(true)}
            className="btn btn-success"
          >
            <Plus size={16} />
            Check In
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }} />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={16} />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="form-select"
                style={{ width: '150px' }}
              >
                <option value="today">Today</option>
                <option value="all">All Records</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Contact</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => (
                  <tr key={record.attendance_id}>
                    <td style={{ fontWeight: '500' }}>{record.member_name}</td>
                    <td>{record.contact}</td>
                    <td>{formatDateTime(record.check_in)}</td>
                    <td>{formatDateTime(record.check_out)}</td>
                    <td>{getDuration(record.check_in, record.check_out)}</td>
                    <td>
                      {record.check_out ? (
                        <span className="badge badge-success">
                          <CheckCircle size={12} style={{ marginRight: '0.25rem' }} />
                          Completed
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <Clock size={12} style={{ marginRight: '0.25rem' }} />
                          In Gym
                        </span>
                      )}
                    </td>
                    <td>
                      {!record.check_out && (
                        <button
                          onClick={() => openCheckOutModal(record)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', color: '#ef4444' }}
                        >
                          <LogOut size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Check In Modal */}
      {showCheckInModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px' }}>
            <div className="card-header">
              <h3 className="card-title">Manual Check In</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleCheckIn}>
                <div className="form-group">
                  <label className="form-label">Member *</label>
                  <select
                    value={checkInData.member_id}
                    onChange={(e) => setCheckInData({ ...checkInData, member_id: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="">Select Member</option>
                    {members.filter(member => member.status === 'Active').map(member => (
                      <option key={member.member_id} value={member.member_id}>
                        {member.name} - {member.contact}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Check In Time</label>
                  <input
                    type="datetime-local"
                    value={checkInData.check_in_time}
                    onChange={(e) => setCheckInData({ ...checkInData, check_in_time: e.target.value })}
                    className="form-input"
                  />
                  <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    Leave empty to use current time
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={resetCheckInForm}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success"
                  >
                    Record Check In
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Check Out Modal */}
      {showCheckOutModal && selectedMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ width: '90%', maxWidth: '500px' }}>
            <div className="card-header">
              <h3 className="card-title">Manual Check Out</h3>
            </div>
            <div className="card-body">
              <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                <p style={{ margin: 0, fontWeight: '500' }}>Member: {selectedMember.member_name}</p>
                <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}>
                  Checked in: {formatDateTime(selectedMember.check_in)}
                </p>
              </div>

              <form onSubmit={handleCheckOut}>
                <div className="form-group">
                  <label className="form-label">Check Out Time</label>
                  <input
                    type="datetime-local"
                    value={checkOutData.check_out_time}
                    onChange={(e) => setCheckOutData({ ...checkOutData, check_out_time: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={resetCheckOutForm}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-danger"
                  >
                    Record Check Out
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
