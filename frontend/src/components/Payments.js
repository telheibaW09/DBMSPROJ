import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Search, Calendar, DollarSign } from 'lucide-react';
import { paymentsAPI, membersAPI, plansAPI } from '../services/api';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    member_id: '',
    plan_id: '',
    amount: '',
    payment_date: '',
    receipt_no: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsResponse, membersResponse, plansResponse] = await Promise.all([
        paymentsAPI.getAll(),
        membersAPI.getAll(),
        plansAPI.getAll()
      ]);
      setPayments(paymentsResponse.data);
      setMembers(membersResponse.data);
      setPlans(plansResponse.data);
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPayment) {
        await paymentsAPI.update(editingPayment.payment_id, formData);
        toast.success('Payment updated successfully');
      } else {
        await paymentsAPI.create(formData);
        toast.success('Payment recorded successfully');
      }
      fetchData();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving payment');
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      member_id: payment.member_id,
      plan_id: payment.plan_id,
      amount: payment.amount,
      payment_date: payment.payment_date,
      receipt_no: payment.receipt_no
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await paymentsAPI.delete(id);
        toast.success('Payment deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Error deleting payment');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      member_id: '',
      plan_id: '',
      amount: '',
      payment_date: '',
      receipt_no: ''
    });
    setEditingPayment(null);
    setShowModal(false);
  };

  const handlePlanChange = (planId) => {
    const selectedPlan = plans.find(plan => plan.plan_id == planId);
    if (selectedPlan) {
      setFormData({
        ...formData,
        plan_id: planId,
        amount: selectedPlan.charge
      });
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.member_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.receipt_no?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
            Payments
          </h1>
          <p style={{ color: '#6b7280' }}>
            Track member payments and revenue
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus size={16} />
          Record Payment
        </button>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280'
            }} />
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Payment Date</th>
                  <th>Receipt No</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment.payment_id}>
                    <td style={{ fontWeight: '500' }}>{payment.member_name}</td>
                    <td>{payment.plan_name}</td>
                    <td style={{ fontWeight: '500', color: '#10b981' }}>
                      ${payment.amount}
                    </td>
                    <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                    <td>{payment.receipt_no}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(payment)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(payment.payment_id)}
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.5rem', color: '#ef4444' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Payment Modal */}
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
                {editingPayment ? 'Edit Payment' : 'Record New Payment'}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Member *</label>
                  <select
                    value={formData.member_id}
                    onChange={(e) => setFormData({ ...formData, member_id: e.target.value })}
                    className="form-select"
                    required
                  >
                    <option value="">Select Member</option>
                    {members.map(member => (
                      <option key={member.member_id} value={member.member_id}>
                        {member.name} - {member.contact}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Plan *</label>
                  <select
                    value={formData.plan_id}
                    onChange={(e) => handlePlanChange(e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Select Plan</option>
                    {plans.map(plan => (
                      <option key={plan.plan_id} value={plan.plan_id}>
                        {plan.plan_name} - ${plan.charge}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Amount *</label>
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
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Date *</label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Receipt Number</label>
                  <input
                    type="text"
                    value={formData.receipt_no}
                    onChange={(e) => setFormData({ ...formData, receipt_no: e.target.value })}
                    className="form-input"
                    placeholder="e.g., RCPT-1001"
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
                    {editingPayment ? 'Update' : 'Record'} Payment
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

export default Payments;
