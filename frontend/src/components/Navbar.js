import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = ({ onLogout, isAuth }) => {
  // Obtén el rol del usuario desde localStorage
  const role = localStorage.getItem('role');

  return (
    <nav style={{ background: '#222', color: '#fff', padding: '1rem', marginBottom: '2rem' }}>
      <Link to="/" style={{ color: '#fff', marginRight: '2rem', textDecoration: 'none', fontWeight: 'bold' }}>
        DAW
      </Link>
      {isAuth ? (
        <>
          <Link to="/dashboard" style={{ color: '#fff', marginRight: '2rem' }}>Dashboard</Link>
          {/* Enlace visible solo si el rol es admin */}
          {role === 'admin' && (
            <Link to="/admin" style={{ color: '#fff', marginRight: '2rem' }}>Panel Admin</Link>
          )}
          <button onClick={onLogout} style={{ background: '#f44336', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px' }}>Logout</button>
        </>
      ) : (
        <Link to="/login" style={{ color: '#fff' }}>Login</Link>
      )}
    </nav>
  );
};

export default Navbar;
