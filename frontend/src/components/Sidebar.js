import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

function Sidebar({ onLogout, isOpen, onDashboard }) {
    const navigate = useNavigate();

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
                        <button className="sidebar-item" onClick={() => navigate('/expenses')}>Expenses</button>
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
