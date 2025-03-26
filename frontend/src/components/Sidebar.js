// src/components/Sidebar.js
import React from 'react';
import '../styles/Sidebar.css';

function Sidebar({ onLogout, isOpen , onDashboard}) {
    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <h1>Expense Tracker</h1>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <button className="sidebar-item" onClick={onDashboard}>Dashboard</button>
                    </li>
                    <li>
                        <button className="sidebar-item">Profile</button>
                    </li>
                    <li>
                        <button className="sidebar-item">Settings</button>
                    </li>
                    <li>
                        <button className="sidebar-item" onClick={onLogout}>
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;