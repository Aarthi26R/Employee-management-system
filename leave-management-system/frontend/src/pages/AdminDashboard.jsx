import React, { useEffect, useState } from 'react';
import { apiCall } from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Users, FileText, CheckCircle2, Clock, Check, X, AlertCircle } from 'lucide-react';

export default function AdminDashboard({ user, logout }) {
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0
  });
  const [loading, setLoading] = useState(true);
  
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [reviewAction, setReviewAction] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [leavesData, statsData] = await Promise.all([
        apiCall('/leaves'),
        apiCall('/employees/stats')
      ]);
      setLeaves(leavesData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const openReviewModal = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setRemarks('');
    setSubmitError('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);

    try {
      await apiCall(`/leaves/${selectedLeave._id}/review`, {
        method: 'PUT',
        body: JSON.stringify({
          status: reviewAction,
          statusRemarks: remarks
        })
      });
      setSelectedLeave(null);
      fetchAdminData();
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit review.');
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
        <Navbar title="HR Administration Dashboard" user={user} />
        
        <main className="content-body">
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Management Overview</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Monitor organization leave requests, tallies, and statistics</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2.5rem'
          }}>
            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Staff</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.totalEmployees}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Active Employees</span>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                <Users size={24} />
              </div>
            </div>

            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--warning)' }}>
              <div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Pending Review</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.pendingLeaves}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Awaiting Decision</span>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)' }}>
                <Clock size={24} />
              </div>
            </div>

            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--success)' }}>
              <div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Approved</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.approvedLeaves}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Granted Requests</span>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)' }}>
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div className="stat-card glass-panel" style={{ borderLeft: '4px solid var(--danger)' }}>
              <div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Rejected</span>
                <h3 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.rejectedLeaves}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Declined Requests</span>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)' }}>
                <FileText size={24} />
              </div>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Employee Leave Requests</h3>
            
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                <span>Loading requests...</span>
              </div>
            ) : leaves.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                <AlertCircle size={40} style={{ marginBottom: '0.5rem' }} />
                <span>No leave requests registered in the database.</span>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Employee Name</th>
                      <th>Department</th>
                      <th>Leave Type</th>
                      <th>Dates</th>
                      <th>Days</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map((leave) => (
                      <tr key={leave._id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{leave.employee?.name || 'Deleted User'}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{leave.employee?.email}</span>
                          </div>
                        </td>
                        <td>{leave.employee?.department || 'N/A'}</td>
                        <td style={{ fontWeight: 500 }}>{getLeaveName(leave.leaveType)}</td>
                        <td style={{ fontSize: '0.8125rem' }}>
                          <div>{new Date(leave.startDate).toLocaleDateString()} to</div>
                          <div>{new Date(leave.endDate).toLocaleDateString()}</div>
                        </td>
                        <td>{leave.daysCount}</td>
                        <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={leave.reason}>
                          {leave.reason}
                        </td>
                        <td>
                          <span className={getStatusBadgeClass(leave.status)}>{leave.status}</span>
                        </td>
                        <td>
                          {leave.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button 
                                onClick={() => openReviewModal(leave, 'approved')} 
                                className="btn btn-success" 
                                style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)' }}
                                title="Approve Leave"
                              >
                                <Check size={16} />
                              </button>
                              <button 
                                onClick={() => openReviewModal(leave, 'rejected')} 
                                className="btn btn-danger" 
                                style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)' }}
                                title="Reject Leave"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                              Reviewed by {leave.reviewedBy?.name || 'Admin'}
                            </span>
                          )}
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

      {selectedLeave && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, textTransform: 'capitalize' }}>
                {reviewAction} Request for {selectedLeave.employee?.name}
              </h3>
              <button onClick={() => setSelectedLeave(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleReviewSubmit}>
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

                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <div><strong>Leave Type:</strong> {getLeaveName(selectedLeave.leaveType)}</div>
                  <div><strong>Duration:</strong> {selectedLeave.daysCount} day(s) ({new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()})</div>
                  <div><strong>Reason:</strong> "{selectedLeave.reason}"</div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Review Remarks / Comments</label>
                  <textarea 
                    rows="3" 
                    className="form-control"
                    placeholder="Enter comment explaining your decision (optional)..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    style={{ resize: 'none' }}
                  ></textarea>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" onClick={() => setSelectedLeave(null)} className="btn btn-secondary">Cancel</button>
                <button 
                  type="submit" 
                  disabled={submitLoading} 
                  className={reviewAction === 'approved' ? 'btn btn-success' : 'btn btn-danger'}
                >
                  {submitLoading ? 'Saving...' : `Confirm ${reviewAction === 'approved' ? 'Approval' : 'Rejection'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
