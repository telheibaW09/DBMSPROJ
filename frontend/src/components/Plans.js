import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Package, DollarSign, Clock } from 'lucide-react';
import { plansAPI } from '../services/api';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    plan_name: '',
    duration_months: '',
    charge: '',
    service_type: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await plansAPI.getAll();
      setPlans(response.data);
    } catch (error) {
      toast.error('Error fetching plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await plansAPI.update(editingPlan.plan_id, formData);
        toast.success('Plan updated successfully');
      } else {
        await plansAPI.create(formData);
        toast.success('Plan created successfully');
      }
      fetchPlans();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      duration_months: plan.duration_months,
      charge: plan.charge,
      service_type: plan.service_type
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await plansAPI.delete(id);
        toast.success('Plan deleted successfully');
        fetchPlans();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error deleting plan');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      plan_name: '',
      duration_months: '',
      charge: '',
      service_type: ''
    });
    setEditingPlan(null);
    setShowModal(false);
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
            Plans
          </h1>
          <p style={{ color: '#6b7280' }}>
            Manage gym membership plans and pricing
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Add Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {plans.map((plan) => (
          <div key={plan.plan_id} className="card">
            <div className="card-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                    {plan.plan_name}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                    {plan.service_type}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(plan)}
                    className="btn btn-outline"
                    style={{ padding: '0.25rem 0.5rem' }}
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.plan_id)}
                    className="btn btn-outline"
                    style={{ padding: '0.25rem 0.5rem', color: '#ef4444' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <DollarSign size={16} color="#10b981" />
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                    ${plan.charge}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={16} color="#6b7280" />
                  <span style={{ color: '#6b7280' }}>
                    {plan.duration_months} months
                  </span>
                </div>
              </div>

              <div style={{
                padding: '0.75rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                color: '#6b7280'
              }}>
                <strong>Features:</strong> {plan.service_type}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Plan Modal */}
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
          <div className="card" style={{ width: '90%', maxWidth: '500px' }}>
            <div className="card-header">
              <h3 className="card-title">
                {editingPlan ? 'Edit Plan' : 'Add New Plan'}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Plan Name *</label>
                  <input
                    type="text"
                    value={formData.plan_name}
                    onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                    className="form-input"
                    placeholder="e.g., Premium Plan"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duration (Months) *</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.duration_months}
                    onChange={(e) => setFormData({ ...formData, duration_months: e.target.value })}
                    className="form-input"
                    placeholder="e.g., 12"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Price *</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={16} style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#6b7280'
                    }} />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.charge}
                      onChange={(e) => setFormData({ ...formData, charge: e.target.value })}
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Service Type *</label>
                  <input
                    type="text"
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    className="form-input"
                    placeholder="e.g., All Access + Personal Training"
                    required
                  />
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
                    {editingPlan ? 'Update' : 'Create'} Plan
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

export default Plans;
