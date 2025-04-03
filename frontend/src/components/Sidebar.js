import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

function Sidebar({ onLogout, isOpen }) {
    const navigate = useNavigate();
    const [transactionsExpanded, setTransactionsExpanded] = useState(false);

    const toggleTransactions = () => {
        setTransactionsExpanded(!transactionsExpanded);
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <div className="sidebar-header">
                <h1>Expense Tracker</h1>
            </div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <button className="sidebar-item" onClick={() => navigate('/dashboard')}>
                            Dashboard
                        </button>
                    </li>

                    {/* Transactions Section with Nested Items */}
                    <li>
                        <button className="sidebar-item transactions-parent" onClick={toggleTransactions}>
                            Transactions {transactionsExpanded ? '▼' : '►'}
                        </button>

                        {transactionsExpanded && (
                            <ul className="transaction-submenu">
                                <li>
                                    <button className="sidebar-item submenu-item" onClick={() => navigate('/transactions')}>
                                        All Transactions
                                    </button>
                                </li>
                                <li>
                                    <button className="sidebar-item submenu-item" onClick={() => navigate('/transactions/add')}>
                                        Add Transaction
                                    </button>
                                </li>
                                <li>
                                    <button className="sidebar-item submenu-item" onClick={() => navigate('/transactions/recurring')}>
                                        Recurring Transactions
                                    </button>
                                </li>
                            </ul>
                        )}
                    </li>

                    <li>
                        <button className="sidebar-item" onClick={() => navigate('/currency/convert')}>
                            Currency Converter
                        </button>
                    </li>
                    <li>
                        <button className="sidebar-item" onClick={() => navigate('/savings')}>
                            Savings Page
                        </button>
                    </li>
                    <li>
                        <button className="sidebar-item" onClick={() => navigate('/settings')}>
                            Settings Page
                        </button>
                    </li>
                    <li>
                        <button className="sidebar-item logout" onClick={onLogout}>
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

export default Sidebar;