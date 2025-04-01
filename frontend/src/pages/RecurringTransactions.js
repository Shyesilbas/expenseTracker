import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import '../styles/RecurringTransactions.css';

function RecurringTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchRecurringTransactions() {
            try {
                const data = await apiService.getRecurringTransactions();
                setTransactions(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load recurring transactions. Please try again.');
                setLoading(false);
            }
        }
        fetchRecurringTransactions();
    }, []);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="recurring-transactions-container">
            <h1 className="page-title">Recurring Transactions</h1>
            <div className="transactions-grid">
                {transactions.length === 0 ? (
                    <p className="no-transactions">No recurring transactions found.</p>
                ) : (
                    transactions.map((transaction) => (
                        <div key={transaction.id} className="transaction-card">
                            <div className="card-header">
                                <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                                    {transaction.status}
                                </span>
                                <span className="amount">
                                    {transaction.amount} {transaction.currency}
                                </span>
                            </div>
                            <div className="card-body">
                                <p><strong>Category:</strong> {transaction.category}</p>
                                <p><strong>Description:</strong> {transaction.description || 'N/A'}</p>
                                <p><strong>Day of Month:</strong> {transaction.dayOfMonth}</p>
                                <p>
                                    <strong>Period:</strong> {transaction.startMonth}/{transaction.startYear} -{' '}
                                    {transaction.endMonth}/{transaction.endYear}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default RecurringTransactions;