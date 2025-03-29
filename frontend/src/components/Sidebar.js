import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

function Sidebar({ onLogout, isOpen }) {
    const navigate = useNavigate();

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <h1>Expense Tracker</h1>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <button className="sidebar-item" onClick={() => navigate('/dashboard')}>Dashboard</button>
                    </li>
                    <li>
                        <button className="sidebar-item" onClick={() => navigate('/expenses/add')}>Add Transaction
                        </button>
                    </li>
                    <li>
                        <button className="sidebar-item" onClick={() => navigate('/expenses')}>Transactions</button>
                    </li>
                    <li>
                        <button className="sidebar-item" onClick={() => navigate('/savings')}>Savings Page</button>
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
