import React, { useEffect, useState } from 'react';
import { apiCall } from '../utils/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

export default function EmployeesList({ user, logout }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedEmp, setSelectedEmp] = useState(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [sickLeave, setSickLeave] = useState(12);
  const [casualLeave, setCasualLeave] = useState(12);
  const [paidLeave, setPaidLeave] = useState(15);
  const [submitError, setSubmitError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/employees');
      setEmployees(data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedEmp(null);
    setName('');
    setEmail('');
    setPassword('');
    setRole('employee');
    setDepartment('Engineering');
    setDesignation('Software Engineer');
    setSickLeave(12);
    setCasualLeave(12);
    setPaidLeave(15);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const openEditModal = (emp) => {
    setModalMode('edit');
    setSelectedEmp(emp);
    setName(emp.name);
    setEmail(emp.email);
    setPassword('');
    setRole(emp.role);
    setDepartment(emp.department);
    setDesignation(emp.designation);
    setSickLeave(emp.leaveBalances?.sickLeave || 0);
    setCasualLeave(emp.leaveBalances?.casualLeave || 0);
    setPaidLeave(emp.leaveBalances?.paidLeave || 0);
    setSubmitError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitLoading(true);

    try {
      if (modalMode === 'create') {
        await apiCall('/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            name, email, password, role, department, designation
          })
        });
      } else {
        await apiCall(`/employees/${selectedEmp._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name, email, role, department, designation,
            leaveBalances: {
              sickLeave,
              casualLeave,
              paidLeave
            }
          })
        });
      }
      setIsModalOpen(false);
      fetchEmployees();
    } catch (err) {
      setSubmitError(err.message || 'Action failed.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee? This will also remove all their leave requests.')) {
      return;
    }

    try {
      await apiCall(`/employees/${id}`, { method: 'DELETE' });
      fetchEmployees();
    } catch (err) {
      alert(err.message || 'Failed to delete employee.');
    }
  };

  return (
    <div className="app-wrapper">
      <Sidebar user={user} logout={logout} />
      
      <div className="main-content">
        <Navbar title="Staff Roster Management" user={user} />
        
        <main className="content-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Staff Registry</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>View, add, edit, or remove company employees and override leave credits</p>
            </div>
            <button onClick={openCreateModal} className="btn btn-primary" style={{ gap: '0.5rem' }}>
              <Plus size={18} />
              <span>Register Employee</span>
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                <span>Loading employees...</span>
              </div>
            ) : employees.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                <AlertCircle size={40} style={{ marginBottom: '0.5rem' }} />
                <span>No employees found. Register some users to populate the directory.</span>
              </div>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Name / Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Sick Leave Bal</th>
                      <th>Casual Leave Bal</th>
                      <th>Paid Leave Bal</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp) => (
                      <tr key={emp._id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{emp.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{emp.email}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.125rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: emp.role === 'manager' || emp.role === 'admin' ? 'var(--info-light)' : 'var(--bg-tertiary)',
                            color: emp.role === 'manager' || emp.role === 'admin' ? 'var(--info)' : 'var(--text-secondary)',
                            textTransform: 'capitalize'
                          }}>
                            {emp.role}
                          </span>
                        </td>
                        <td>{emp.department}</td>
                        <td>{emp.designation}</td>
                        <td>{emp.leaveBalances?.sickLeave} days</td>
                        <td>{emp.leaveBalances?.casualLeave} days</td>
                        <td>{emp.leaveBalances?.paidLeave} days</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => openEditModal(emp)} 
                              className="btn btn-outline" 
                              style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)' }}
                              title="Edit Employee"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(emp._id)} 
                              className="btn btn-outline" 
                              style={{ padding: '0.375rem', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.1)' }}
                              title="Delete Employee"
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
            )}
          </div>
        </main>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                {modalMode === 'create' ? 'Register New Employee' : `Edit Registry for ${selectedEmp?.name}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
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
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    required 
                    className="form-control"
                    placeholder="E.g. Michael Scott"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    required 
                    className="form-control"
                    placeholder="E.g. michael@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {modalMode === 'create' && (
                  <div className="form-group">
                    <label className="form-label">Initial Password</label>
                    <input 
                      type="password" 
                      required 
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input 
                      type="text" 
                      required 
                      className="form-control"
                      placeholder="E.g. Sales"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation</label>
                    <input 
                      type="text" 
                      required 
                      className="form-control"
                      placeholder="E.g. Regional Manager"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">System Role</label>
                  <select 
                    className="form-control"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="employee">Employee (Normal User)</option>
                    <option value="manager">Manager (Can approve leaves)</option>
                  </select>
                </div>

                {modalMode === 'edit' && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '1rem' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                      Override Leave Balances (Days)
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label className="form-label">Sick Leave</label>
                        <input 
                          type="number" 
                          required 
                          className="form-control"
                          value={sickLeave}
                          onChange={(e) => setSickLeave(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Casual Leave</label>
                        <input 
                          type="number" 
                          required 
                          className="form-control"
                          value={casualLeave}
                          onChange={(e) => setCasualLeave(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Paid Leave</label>
                        <input 
                          type="number" 
                          required 
                          className="form-control"
                          value={paidLeave}
                          onChange={(e) => setPaidLeave(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={submitLoading} className="btn btn-primary">
                  {submitLoading ? 'Saving...' : 'Save Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
