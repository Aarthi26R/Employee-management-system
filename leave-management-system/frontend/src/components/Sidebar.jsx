import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarDays, LogOut } from 'lucide-react';

export default function Sidebar({ user, logout }) {
  const isAdmin = user && (user.role === 'admin' || user.role === 'manager');

  return (
    <aside className="glass-panel" style={{
      width: 'var(--sidebar-w)',
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border-color)',
      padding: '1.5rem 1rem'
    }}>
      {/* Brand Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, #a855f7 100%)',
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <CalendarDays size={20} />
        </div>
        <span style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          background: 'linear-gradient(to right, var(--text-primary), #6366f1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.5px'
        }}>Talent<span style={{ color: 'var(--primary)', WebkitTextFillColor: 'initial' }}>Flow</span></span>
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flexGrow: 1 }}>
        {!isAdmin ? (
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
            style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', border: 'none' }}
          >
            <LayoutDashboard size={18} />
            <span>My Leaves</span>
          </NavLink>
        ) : (
          <>
            <NavLink
              to="/admin"
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', border: 'none' }}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink
              to="/employees"
              className={({ isActive }) => `btn ${isActive ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', border: 'none' }}
            >
              <Users size={18} />
              <span>Employees</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* Footer Profile & Logout */}
      <div style={{
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.875rem'
          }}>
            {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>
              {user?.role} • {user?.department}
            </span>
          </div>
        </div>

        <button 
          onClick={logout} 
          className="btn btn-outline" 
          style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%', borderColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
