import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EmployeesList from './pages/EmployeesList';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setAuthLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)',
        fontSize: '1rem',
        fontWeight: 500
      }}>
        Loading session...
      </div>
    );
  }

  const isAdmin = user && (user.role === 'admin' || user.role === 'manager');

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? (
              isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
            ) : (
              <Login setUser={setUser} />
            )
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            user ? (
              isAdmin ? <Navigate to="/admin" replace /> : <EmployeeDashboard user={user} logout={logout} />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/admin" 
          element={
            user ? (
              isAdmin ? <AdminDashboard user={user} logout={logout} /> : <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/employees" 
          element={
            user ? (
              isAdmin ? <EmployeesList user={user} logout={logout} /> : <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="*" 
          element={
            user ? (
              isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}
