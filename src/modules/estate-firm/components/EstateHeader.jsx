// src/modules/estate/components/EstateHeader.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import EstateNav from './EstateNav'
import './EstateHeader.css'; // Optional CSS for styling

const EstateHeader = () => {
  return (
    <header className="estate-header">
      <div className="logo">
        <h2 className ="estate-word">Estate Firm</h2>
      </div>
      <nav className="estate-nav">
        <NavLink to="/dashboard/estate-firm" end>
          Dashboard
        </NavLink>
        <NavLink to="profile">Profile</NavLink>
        <NavLink to="properties">Properties</NavLink>
        <NavLink to="clients">Clients</NavLink>
        <NavLink to="analytics">Analytics</NavLink>
        <NavLink to="reports">Reports</NavLink>
        <NavLink to="settings">Settings</NavLink>
      </nav>
      <EstateNav />
    </header>
  );
};

export default EstateHeader;