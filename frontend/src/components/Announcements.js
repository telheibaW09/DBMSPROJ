import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Megaphone, Calendar } from 'lucide-react';
import { announcementsAPI } from '../services/api';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);

  const [formData, setFormData] = useState({
    message: ''
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementsAPI.getAll();
      setAnnouncements(response.data);
    } catch (error) {
      toast.error('Error fetching announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAnnouncement) {
        await announcementsAPI.update(editingAnnouncement.announcement_id, formData);
        toast.success('Announcement updated successfully');
      } else {
        await announcementsAPI.create(formData);
        toast.success('Announcement created successfully');
      }
      fetchAnnouncements();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving announcement');
    }
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      message: announcement.message
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await announcementsAPI.delete(id);
        toast.success('Announcement deleted successfully');
        fetchAnnouncements();
      } catch (error) {
        toast.error('Error deleting announcement');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      message: ''
    });
    setEditingAnnouncement(null);
    setShowModal(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
            Announcements
          </h1>
          <p style={{ color: '#6b7280' }}>
            Manage gym announcements and notifications
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Add Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {announcements.length === 0 ? (
          <div className="card">
            <div className="card-body" style={{ textAlign: 'center', padding: '3rem' }}>
              <Megaphone size={48} color="#d1d5db" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#6b7280', marginBottom: '0.5rem' }}>No announcements yet</h3>
              <p style={{ color: '#9ca3af' }}>Create your first announcement to get started</p>
            </div>
          </div>
        ) : (
          announcements.map((announcement) => (
            <div key={announcement.announcement_id} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <Megaphone size={16} color="#3b82f6" />
                      <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        {formatDate(announcement.created_at)}
                      </span>
                    </div>
                    <p style={{ 
                      fontSize: '1rem', 
                      lineHeight: '1.5', 
                      color: '#111827',
                      margin: 0,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {announcement.message}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.5rem' }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.announcement_id)}
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.5rem', color: '#ef4444' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Announcement Modal */}
      {showModal && (
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
          <div className="card" style={{ width: '90%', maxWidth: '600px' }}>
            <div className="card-header">
              <h3 className="card-title">
                {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="form-input"
                    rows={6}
                    placeholder="Enter your announcement message..."
                    required
                    style={{ resize: 'vertical' }}
                  />
                  <small style={{ color: '#6b7280', fontSize: '0.75rem' }}>
                    {formData.message.length} characters
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    {editingAnnouncement ? 'Update' : 'Create'} Announcement
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

export default Announcements;
