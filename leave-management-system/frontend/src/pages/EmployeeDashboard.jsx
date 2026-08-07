import React, { useEffect, useState } from 'react';
import { apiCall } from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Plus, Calendar, Clock, CheckCircle2, XCircle, FileText, AlertCircle } from 'lucide-react';

export default function EmployeeDashboard({ user, logout }) {
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState(user?.leaveBalances || {});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [leaveType, setLeaveType] = useState('sickLeave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [leavesData, profileData] = await Promise.all([
        apiCall('/leaves/myleaves'),
        apiCall('/auth/profile')
      ]);
      setLeaves(leavesData);
      setBalances(profileData.leaveBalances);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);

    try {
      await apiCall('/leaves', {
        method: 'POST',
        body: JSON.stringify({ leaveType, startDate, endDate, reason })
      });
      
      setStartDate('');
      setEndDate('');
      setReason('');
      setIsModalOpen(false);
      fetchDashboardData();
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit request.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getLeaveName = (key) => {
    switch (key) {
      case 'sickLeave': return 'Sick Leave';
      case 'casualLeave': return 'Casual Leave';
      case 'paidLeave': return 'Paid Leave';
      case 'unpaidLeave': return 'Unpaid Leave';
      default: return key;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved': return 'badge badge-approved';
      case 'rejected': return 'badge badge-rejected';
      default: return 'badge badge-pending';
    }
  };

  return (
    <div className="app-wrapper">
      <Sidebar user={user} logout={logout} />
      
      <div className="main-content">
        <Navbar title="My Leave Dashboard" user={user} />
        
        <main className="content-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Overview</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Track your leave balances and request history</p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <Plus size={18} />
              <span>Apply for Leave</span>
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--info)' }}>
              <div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Sick Leave</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{balances.sickLeave}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Days Available</span>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--info-light)', color: 'var(--info)' }}>
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--warning)' }}>
              <div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Casual Leave</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{balances.casualLeave}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Days Available</span>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
                <Clock size={24} />
              </div>
            </div>

            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>
              <div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Paid Leave</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{balances.paidLeave}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Days Available</span>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                <Calendar size={24} />
              </div>
            </div>

            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Unpaid Leave</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{balances.unpaidLeave}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Days Used</span>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <FileText size={24} />
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>My Requests History</h3>
            
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                <span>Loading requests...</span>
              </div>
            ) : leaves.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                <AlertCircle size={40} style={{ marginBottom: '0.5rem' }} />
                <span>You haven't requested any leaves yet.</span>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Leave Type</th>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Approver Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave._id}>
                        <td style={{ fontWeight: 600 }}>{getLeaveName(leave.leaveType)}</td>
                        <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                        <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                        <td>{leave.daysCount}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>
                          {leave.reason}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(leave.status)}>{leave.status}</span>
                        </td>
                        <td style={{ color: leave.statusRemarks ? 'var(--text-primary)' : 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
                          {leave.statusRemarks || 'No remarks yet'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Apply for Leave</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleApplyLeave}>
              <div className="modal-body">
                {submitError && (
                  <div style={{
                    backgroundColor: 'var(--danger-light)',
                    color: 'var(--danger)',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.875rem',
                    marginBottom: '1rem',
                    border: '1px solid rgba(239, 68, 68, 0.1)'
                  }}>
                    {submitError}
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">Leave Type</label>
                  <select 
                    className="form-control"
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                  >
                    <option value="sickLeave">Sick Leave</option>
                    <option value="casualLeave">Casual Leave</option>
                    <option value="paidLeave">Paid Leave</option>
                    <option value="unpaidLeave">Unpaid Leave</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Start Date</label>
                    <input 
                      type="date" 
                      required 
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End Date</label>
                    <input 
                      type="date" 
                      required 
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <textarea 
                    required 
                    rows="3" 
                    className="form-control"
                    placeholder="Provide a reason for leave request..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={{ resize: 'none' }}
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submitLoading} className="btn btn-primary">
                  {submitLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
