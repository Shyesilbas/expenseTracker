import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/RecurringTransactions.css';
import { showConfirmation, showSuccess, showError } from "../utils/SweetAlertUtils";

function RecurringTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    const [editForm, setEditForm] = useState({
        amount: '',
        description: '',
        category: '',
        status: '',
        currency: '',
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        dayOfMonth: ''
    });

    const CATEGORIES = ['SHOPPING', 'BILLS', 'SALARY' ,'ENTERTAINMENT', 'TRAVEL', 'FOOD', 'OTHER'];
    const STATUSES = ['INCOME', 'OUTGOING'];
    const CURRENCIES = ['USD', 'EUR', 'TRY', 'GBP'];

    useEffect(() => {
        async function fetchRecurringTransactions() {
            try {
                const data = await apiService.getRecurringTransactions();
                setTransactions(data);
                setLoading(false);

                const transactionId = location.state?.transactionId;
                if (transactionId) {
                    const transactionToEdit = data.find(t => t.transactionId === transactionId);
                    if (transactionToEdit) {
                        setEditingTransaction(transactionToEdit);
                        setEditForm({
                            amount: transactionToEdit.amount.toString(),
                            description: transactionToEdit.description || '',
                            category: transactionToEdit.category,
                            status: transactionToEdit.status,
                            currency: transactionToEdit.currency,
                            startMonth: transactionToEdit.startMonth.toString(),
                            startYear: transactionToEdit.startYear.toString(),
                            endMonth: transactionToEdit.endMonth.toString(),
                            endYear: transactionToEdit.endYear.toString(),
                            dayOfMonth: transactionToEdit.dayOfMonth.toString()
                        });
                    } else {
                        console.error(`Transaction with ID ${transactionId} not found`);
                        setError(`Transaction with ID ${transactionId} not found`);
                    }
                }
            } catch (err) {
                setError('Failed to load recurring transactions. Please try again.');
                setLoading(false);
            }
        }
        fetchRecurringTransactions();
    }, [location.state]);

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const updateRecurringTransaction = async (transactionId, data) => {
        // Make sure transactionId is a valid value
        if (!transactionId) {
            throw new Error("Transaction ID is missing or invalid");
        }

        try {
            const transactionData = {
                amount: parseFloat(data.amount),
                description: data.description || '',
                category: data.category,
                status: data.status,
                currency: data.currency,
                dayOfMonth: parseInt(data.dayOfMonth, 10),
                startMonth: parseInt(data.startMonth, 10),
                startYear: parseInt(data.startYear, 10),
                endMonth: parseInt(data.endMonth, 10),
                endYear: parseInt(data.endYear, 10)
            };

            console.log("Updating transaction with ID:", transactionId);
            console.log("Transaction data:", transactionData);

            const response = await apiService.put(`/api/expenses/update/recurring/${transactionId}`, transactionData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();

        if (!editingTransaction || !editingTransaction.transactionId) {
            showError({ text: "No transaction selected or transaction ID is missing" });
            return;
        }

        const confirmed = await showConfirmation({
            title: 'Update Recurring Transaction',
            text: 'Are you sure you want to update this recurring transaction?',
            confirmButtonText: 'Yes, update it!'
        });

        if (!confirmed) return;

        try {
            const updatedData = {
                amount: editForm.amount,
                description: editForm.description || '',
                category: editForm.category,
                status: editForm.status,
                currency: editForm.currency,
                startMonth: editForm.startMonth,
                startYear: editForm.startYear,
                endMonth: editForm.endMonth,
                endYear: editForm.endYear,
                dayOfMonth: editForm.dayOfMonth
            };

            // Log the transaction ID to verify it's correct
            console.log("Transaction ID before update:", editingTransaction.transactionId);

            await updateRecurringTransaction(editingTransaction.transactionId, updatedData);
            showSuccess({ text: 'Recurring transaction updated successfully!' });
            setEditingTransaction(null);
            setEditForm({
                amount: '',
                description: '',
                category: '',
                status: '',
                currency: '',
                startMonth: '',
                startYear: '',
                endMonth: '',
                endYear: '',
                dayOfMonth: ''
            });
            const updatedDataList = await apiService.getRecurringTransactions();
            setTransactions(updatedDataList);
            navigate('/transactions/recurring', { replace: true });
        } catch (err) {
            showError({ text: `Error: ${err.message}` });
        }
    };

    const handleEditClick = (transaction) => {
        // Check if transaction has a valid ID before editing
        if (!transaction || !transaction.transactionId) {
            showError({ text: "Cannot edit: Transaction is missing an ID" });
            return;
        }

        console.log("Selected transaction for editing:", transaction);
        console.log("Transaction ID:", transaction.transactionId);

        setEditingTransaction(transaction);
        setEditForm({
            amount: transaction.amount.toString(),
            description: transaction.description || '',
            category: transaction.category,
            status: transaction.status,
            currency: transaction.currency,
            startMonth: transaction.startMonth.toString(),
            startYear: transaction.startYear.toString(),
            endMonth: transaction.endMonth.toString(),
            endYear: transaction.endYear.toString(),
            dayOfMonth: transaction.dayOfMonth.toString()
        });
    };

    const handleDeleteClick = async (transaction) => {
        // Check if transaction has a valid ID before deleting
        if (!transaction || !transaction.transactionId) {
            showError({ text: "Cannot delete: Transaction is missing an ID" });
            return;
        }

        const confirmed = await showConfirmation({
            title: 'Delete Recurring Transaction Series',
            text: 'Are you sure you want to delete this entire recurring transaction series? This will delete all instances of this recurring transaction.',
            confirmButtonText: 'Yes, delete entire series!',
            confirmButtonColor: '#d33'
        });

        if (!confirmed) return;

        try {
            await apiService.deleteRecurringSeries(transaction.transactionId);
            showSuccess({ text: 'Recurring transaction series deleted successfully!' });

            // Refresh the transactions list
            const updatedDataList = await apiService.getRecurringTransactions();
            setTransactions(updatedDataList);
        } catch (err) {
            showError({ text: `Error: ${err.message}` });
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="recurring-transactions-container">
            <h1 className="page-title">Recurring Transactions</h1>

            {editingTransaction ? (
                <div className="edit-form-container">
                    <h2>Update Recurring Transaction</h2>
                    <form onSubmit={handleUpdateSubmit} className="edit-form">
                        {/* Hidden field to store transaction ID */}
                        <input type="hidden" name="transactionId" value={editingTransaction.transactionId} />

                        <div className="form-row">
                            <div className="form-group">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={editForm.amount}
                                    onChange={handleEditChange}
                                    required
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label>Currency</label>
                                <select
                                    name="currency"
                                    value={editForm.currency}
                                    onChange={handleEditChange}
                                    required
                                >
                                    {CURRENCIES.map(currency => (
                                        <option key={currency} value={currency}>{currency}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={editForm.description}
                                onChange={handleEditChange}
                                rows="3"
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={editForm.category}
                                    onChange={handleEditChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {CATEGORIES.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select
                                    name="status"
                                    value={editForm.status}
                                    onChange={handleEditChange}
                                    required
                                >
                                    {STATUSES.map(status => (
                                        <option key={status} value={status}>{status}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Month</label>
                                <input
                                    type="number"
                                    name="startMonth"
                                    value={editForm.startMonth}
                                    onChange={handleEditChange}
                                    required
                                    min="1"
                                    max="12"
                                />
                            </div>
                            <div className="form-group">
                                <label>Start Year</label>
                                <input
                                    type="number"
                                    name="startYear"
                                    value={editForm.startYear}
                                    onChange={handleEditChange}
                                    required
                                    min="2000"
                                    max="2100"
                                />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>End Month</label>
                                <input
                                    type="number"
                                    name="endMonth"
                                    value={editForm.endMonth}
                                    onChange={handleEditChange}
                                    required
                                    min="1"
                                    max="12"
                                />
                            </div>
                            <div className="form-group">
                                <label>End Year</label>
                                <input
                                    type="number"
                                    name="endYear"
                                    value={editForm.endYear}
                                    onChange={handleEditChange}
                                    required
                                    min="2000"
                                    max="2100"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Day of Month</label>
                            <input
                                type="number"
                                name="dayOfMonth"
                                value={editForm.dayOfMonth}
                                onChange={handleEditChange}
                                required
                                min="1"
                                max="31"
                            />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={() => setEditingTransaction(null)}>
                                Cancel
                            </button>
                            <button type="submit" className="update-btn">Update</button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="transactions-grid">
                    {transactions.length === 0 ? (
                        <p className="no-transactions">No recurring transactions found.</p>
                    ) : (
                        transactions.map((transaction) => (
                            <div key={transaction.transactionId} className="transaction-card">
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
                                <div className="card-actions">
                                    <button
                                        className="edit-btn"
                                        onClick={() => handleEditClick(transaction)}
                                    >
                                        Update
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteClick(transaction)}
                                    >
                                        Delete Series
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default RecurringTransactions;