import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/RecurringTransactions.css';
import { showConfirmation, showSuccess, showError } from '../utils/SweetAlertUtils';

function RecurringTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
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

    const location = useLocation();
    const navigate = useNavigate();

    const CATEGORIES = ['SHOPPING', 'BILLS','RENT','SALARY', 'ENTERTAINMENT', 'TRAVEL', 'FOOD', 'OTHER'];
    const STATUSES = ['INCOME', 'OUTGOING'];
    const CURRENCIES = ['USD', 'EUR', 'TRY', 'GBP'];
    const MONTHS = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const YEARS = Array.from({ length: 11 }, (_, i) => (2020 + i).toString()); // 2020-2030

    const monthNumberToName = (num) => MONTHS[num - 1] || '';
    const monthNameToNumber = (name) => MONTHS.indexOf(name) + 1;

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await apiService.getRecurringTransactions();
                setTransactions(data);
                setLoading(false);

                const transactionId = location.state?.transactionId;
                if (transactionId) {
                    const transaction = data.find(t => t.transactionId === transactionId);
                    if (transaction) {
                        setEditingId(transactionId);
                        setFormData({
                            amount: transaction.amount.toString(),
                            description: transaction.description || '',
                            category: transaction.category,
                            status: transaction.status,
                            currency: transaction.currency,
                            startMonth: monthNumberToName(transaction.startMonth),
                            startYear: transaction.startYear.toString(),
                            endMonth: monthNumberToName(transaction.endMonth),
                            endYear: transaction.endYear.toString(),
                            dayOfMonth: transaction.dayOfMonth.toString()
                        });
                    } else {
                        setError(`Transaction with ID ${transactionId} not found`);
                    }
                }
            } catch (err) {
                setError('Failed to load transactions. Please try again.');
                setLoading(false);
            }
        };
        fetchTransactions();
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        const day = parseInt(formData.dayOfMonth, 10);
        if (isNaN(day) || day < 1 || day > 31) {
            showError({ text: 'Day of Month must be between 1 and 31.' });
            return false;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            showError({ text: 'Amount must be a positive number.' });
            return false;
        }
        if (!formData.category) {
            showError({ text: 'Please select a category.' });
            return false;
        }
        if (!formData.status) {
            showError({ text: 'Please select a status.' });
            return false;
        }
        if (!formData.currency) {
            showError({ text: 'Please select a currency.' });
            return false;
        }
        if (!formData.startMonth || !formData.endMonth) {
            showError({ text: 'Please select start and end months.' });
            return false;
        }
        if (!formData.startYear || !formData.endYear) {
            showError({ text: 'Please select start and end years.' });
            return false;
        }
        return true;
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!editingId) {
            showError({ text: 'No transaction selected for update.' });
            return;
        }

        if (!validateForm()) return;

        const confirmed = await showConfirmation({
            title: 'Update Recurring Transaction',
            text: 'Are you sure you want to update this transaction?',
            confirmButtonText: 'Yes, update it!'
        });

        if (!confirmed) return;

        try {
            const payload = {
                amount: parseFloat(formData.amount),
                description: formData.description,
                category: formData.category,
                status: formData.status,
                currency: formData.currency,
                startMonth: monthNameToNumber(formData.startMonth),
                startYear: parseInt(formData.startYear, 10),
                endMonth: monthNameToNumber(formData.endMonth),
                endYear: parseInt(formData.endYear, 10),
                dayOfMonth: parseInt(formData.dayOfMonth, 10)
            };

            console.log('Updating transaction with payload:', payload);

            await apiService.updateRecurringTransaction(editingId, payload);
            showSuccess({ text: 'Transaction updated successfully!' });

            setEditingId(null);
            setFormData({
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
            const updatedData = await apiService.getRecurringTransactions();
            setTransactions(updatedData);
            navigate('/transactions/recurring', { replace: true });
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update transaction.';
            showError({ text: `Error: ${errorMessage}` });
        }
    };

    const startEditing = (transaction) => {
        if (!transaction.transactionId) {
            showError({ text: 'Invalid transaction ID.' });
            return;
        }
        setEditingId(transaction.transactionId);
        setFormData({
            amount: transaction.amount.toString(),
            description: transaction.description || '',
            category: transaction.category,
            status: transaction.status,
            currency: transaction.currency,
            startMonth: monthNumberToName(transaction.startMonth),
            startYear: transaction.startYear.toString(),
            endMonth: monthNumberToName(transaction.endMonth),
            endYear: transaction.endYear.toString(),
            dayOfMonth: transaction.dayOfMonth.toString()
        });
    };

    const handleDelete = async (transactionId) => {
        if (!transactionId) {
            showError({ text: 'Invalid transaction ID.' });
            return;
        }

        const confirmed = await showConfirmation({
            title: 'Delete Recurring Transaction Series',
            text: 'Are you sure you want to delete this entire series?',
            confirmButtonText: 'Yes, delete it!',
            confirmButtonColor: '#d33'
        });

        if (!confirmed) return;

        try {
            await apiService.deleteRecurringSeries(transactionId);
            showSuccess({ text: 'Transaction series deleted successfully!' });
            const updatedData = await apiService.getRecurringTransactions();
            setTransactions(updatedData);
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to delete transaction series.';
            showError({ text: `Error: ${errorMessage}` });
        }
    };

    const cancelEditing = () => {
        setEditingId(null);
        setFormData({
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
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="recurring-transactions-container">
            <h1 className="page-title">Recurring Transactions</h1>

            {editingId ? (
                <div className="edit-form-container">
                    <h2>Update Recurring Transaction</h2>
                    <form onSubmit={handleUpdate} className="edit-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Amount</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    required
                                    step="0.01"
                                    min="0.01"
                                    placeholder="Enter amount"
                                />
                            </div>
                            <div className="form-group">
                                <label>Currency</label>
                                <select name="currency" value={formData.currency} onChange={handleChange} required>
                                    <option value="">Select Currency</option>
                                    {CURRENCIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                placeholder="Enter description (optional)"
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleChange} required>
                                    <option value="">Select Category</option>
                                    {CATEGORIES.map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange} required>
                                    <option value="">Select Status</option>
                                    {STATUSES.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Month</label>
                                <select name="startMonth" value={formData.startMonth} onChange={handleChange} required>
                                    <option value="">Select Month</option>
                                    {MONTHS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Start Year</label>
                                <select name="startYear" value={formData.startYear} onChange={handleChange} required>
                                    <option value="">Select Year</option>
                                    {YEARS.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>End Month</label>
                                <select name="endMonth" value={formData.endMonth} onChange={handleChange} required>
                                    <option value="">Select Month</option>
                                    {MONTHS.map(m => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>End Year</label>
                                <select name="endYear" value={formData.endYear} onChange={handleChange} required>
                                    <option value="">Select Year</option>
                                    {YEARS.map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Day of Month</label>
                            <input
                                type="number"
                                name="dayOfMonth"
                                value={formData.dayOfMonth}
                                onChange={handleChange}
                                required
                                min="1"
                                max="31"
                                placeholder="1-31"
                            />
                        </div>
                        <div className="form-actions">
                            <button type="button" className="cancel-btn" onClick={cancelEditing}>
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
                        transactions.map(t => (
                            <div key={t.transactionId} className="transaction-card">
                                <div className="card-header">
                                    <span className={`status-badge ${t.status.toLowerCase()}`}>
                                        {t.status}
                                    </span>
                                    <span className="amount">{t.amount} {t.currency}</span>
                                </div>
                                <div className="card-body">
                                    <p><strong>Category:</strong> {t.category}</p>
                                    <p><strong>Description:</strong> {t.description || 'N/A'}</p>
                                    <p><strong>Day of Month:</strong> {t.dayOfMonth}</p>
                                    <p>
                                        <strong>Period:</strong> {monthNumberToName(t.startMonth)}/{t.startYear} -{' '}
                                        {monthNumberToName(t.endMonth)}/{t.endYear}
                                    </p>
                                </div>
                                <div className="card-actions">
                                    <button className="edit-btn" onClick={() => startEditing(t)}>
                                        Update
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDelete(t.transactionId)}>
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