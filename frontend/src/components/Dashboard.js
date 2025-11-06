import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';
import { dashboardAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        dashboardAPI.getStats(),
        dashboardAPI.getRecentActivity()
      ]);
      
      setStats(statsResponse.data || {});
      setRecentActivity(activityResponse.data || {});
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default values to prevent crashes
      setStats({
        members: { total_members: 0, active_members: 0, inactive_members: 0 },
        payments: { total_payments: 0, total_revenue: 0 },
        attendance: { total_visits: 0, visits_today: 0, currently_checked_in: 0 },
        plans: { total_plans: 0, average_plan_price: 0 }
      });
      setRecentActivity({
        recent_members: [],
        recent_payments: [],
        recent_attendance: [],
        recent_announcements: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="card">
      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              {title}
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              {value}
            </p>
            {subtitle && (
              <p style={{ fontSize: '0.75rem', color: '#10b981', margin: '0.25rem 0 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: color + '20',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}>
            <Icon size={24} />
          </div>
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ icon: Icon, title, time, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0' }}>
      <div style={{
        width: '32px',
        height: '32px',
        backgroundColor: color + '20',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        <Icon size={16} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>
          {title}
        </p>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
          {time}
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ marginLeft: '250px', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          Dashboard
        </h1>
        <p style={{ color: '#6b7280' }}>
          Overview of your gym's performance and activities
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <StatCard
          title="Total Members"
          value={stats?.members?.total_members || 0}
          icon={Users}
          color="#3b82f6"
          subtitle={`${stats?.members?.active_members || 0} active`}
        />
        <StatCard
          title="Today's Visits"
          value={stats?.attendance?.visits_today || 0}
          icon={Calendar}
          color="#10b981"
          subtitle={`${stats?.attendance?.currently_checked_in || 0} currently in gym`}
        />
        <StatCard
          title="Total Revenue"
          value={`$${Number(stats?.payments?.total_revenue || 0).toLocaleString()}`}
          icon={DollarSign}
          color="#f59e0b"
          subtitle={`${stats?.payments?.total_payments || 0} payments`}
        />
        <StatCard
          title="Active Plans"
          value={stats?.plans?.total_plans || 0}
          icon={Activity}
          color="#8b5cf6"
          subtitle={`Avg: $${Number(stats?.plans?.average_plan_price || 0).toFixed(0)}`}
        />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Revenue Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Monthly Revenue</h3>
          </div>
          <div className="card-body">
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={[
                  { month: 'Jan', revenue: 12000 },
                  { month: 'Feb', revenue: 15000 },
                  { month: 'Mar', revenue: 18000 },
                  { month: 'Apr', revenue: 16000 },
                  { month: 'May', revenue: 20000 },
                  { month: 'Jun', revenue: 22000 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
          </div>
          <div className="card-body">
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {recentActivity?.recent_members?.slice(0, 3).map((member, index) => (
                <ActivityItem
                  key={index}
                  icon={Users}
                  title={`${member.name} joined`}
                  time={new Date(member.join_date).toLocaleDateString()}
                  color="#3b82f6"
                />
              ))}
              {recentActivity?.recent_payments?.slice(0, 2).map((payment, index) => (
                <ActivityItem
                  key={index}
                  icon={DollarSign}
                  title={`${payment.member_name} paid $${payment.amount}`}
                  time={new Date(payment.payment_date).toLocaleDateString()}
                  color="#10b981"
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Member Status Chart */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Member Status Distribution</h3>
        </div>
        <div className="card-body">
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { status: 'Active', count: stats?.members?.active_members || 0 },
                { status: 'Inactive', count: stats?.members?.inactive_members || 0 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
