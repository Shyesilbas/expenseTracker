import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/ExpenseForm.css';
import { DateUtils } from '../utils/DateUtils';
import { CATEGORIES, CURRENCIES } from '../constants/constants';
import { showConfirmation, showError, showSuccess } from "../utils/SweetAlertUtils";

function TransactionForm() {
    const today = new Date();
    today.setHours(today.getHours() + 3);
    const formattedDate = today.toISOString().split('T')[0];

    const [activeTab, setActiveTab] = useState('oneTime');
    const [oneTimeExpense, setOneTimeExpense] = useState({
        amount: '',
        date: formattedDate,
        category: '',
        status: 'OUTGOING',
        description: '',
        currency: 'TL',
    });

    const [recurringExpense, setRecurringExpense] = useState({
        amount: '',
        category: '',
        status: 'OUTGOING',
        description: '',
        currency: 'TL',
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        dayOfMonth: '', // Yeni alan eklendi
    });

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserInfo() {
            try {
                const userInfo = await apiService.getUserInfo();
                const favoriteCurrency = userInfo.favoriteCurrency || 'USD';
                setOneTimeExpense((prev) => ({ ...prev, currency: favoriteCurrency }));
                setRecurringExpense((prev) => ({ ...prev, currency: favoriteCurrency }));
            } catch (err) {
                console.error('Error fetching user info:', err);
            }
        }
        fetchUserInfo();
    }, []);

    const handleOneTimeChange = (e) => {
        const { name, value } = e.target;
        setOneTimeExpense((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleRecurringChange = (e) => {
        const { name, value } = e.target;
        setRecurringExpense((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleOneTimeSubmit = async (e) => {
        e.preventDefault();

        const confirmed = await showConfirmation({
            title: 'Add One-Time Transaction',
            text: 'Are you sure you want to add this one-time transaction?',
            confirmButtonText: 'Yes, add it!',
        });

        if (!confirmed) return;

        try {
            const formattedDate = DateUtils.formatDate(oneTimeExpense.date);
            const expenseToSend = {
                ...oneTimeExpense,
                date: formattedDate,
                transactionType: 'ONE_TIME',
            };
            await apiService.createTransaction(expenseToSend);
            showSuccess({ text: 'One-time transaction added successfully!' });
            navigate('/transactions');
        } catch (err) {
            showError({
                text: `Error: ${err.response?.status || 'Unknown'} - ${err.response?.data?.message || err.message}`,
            });
        }
    };

    const handleRecurringSubmit = async (e) => {
        e.preventDefault();

        const confirmed = await showConfirmation({
            title: 'Add Recurring Transaction',
            text: 'Are you sure you want to add this recurring transaction?',
            confirmButtonText: 'Yes, add it!',
        });

        if (!confirmed) return;

        try {
            const expenseToSend = {
                ...recurringExpense,
                transactionType: 'RECURRING',
                startMonth: parseInt(recurringExpense.startMonth, 10),
                startYear: parseInt(recurringExpense.startYear, 10),
                endMonth: parseInt(recurringExpense.endMonth, 10),
                endYear: parseInt(recurringExpense.endYear, 10),
                dayOfMonth: recurringExpense.dayOfMonth ? parseInt(recurringExpense.dayOfMonth, 10) : undefined, // Yeni alan eklendi
            };
            await apiService.createTransaction(expenseToSend);
            showSuccess({ text: 'Recurring transaction added successfully!' });
            navigate('/transactions');
        } catch (err) {
            showError({
                text: `Error: ${err.response?.status || 'Unknown'} - ${err.response?.data?.message || err.message}`,
            });
        }
    };

    return (
        <div className="modern-expense-form-container">
            <div className="tab-header">
                <button
                    className={`tab-btn ${activeTab === 'oneTime' ? 'active' : ''}`}
                    onClick={() => setActiveTab('oneTime')}
                >
                    One Time Transaction
                </button>
                <button
                    className={`tab-btn ${activeTab === 'recurring' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recurring')}
                >
                    Recurring Transaction
                </button>
            </div>

            {activeTab === 'oneTime' && (
                <form onSubmit={handleOneTimeSubmit} className="modern-expense-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={oneTimeExpense.amount}
                                onChange={handleOneTimeChange}
                                required
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="form-group">
                            <label>Currency</label>
                            <select
                                name="currency"
                                value={oneTimeExpense.currency}
                                onChange={handleOneTimeChange}
                                required
                            >
                                {CURRENCIES.map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label>Date</label>
                        <input
                            type="date"
                            name="date"
                            value={oneTimeExpense.date}
                            onChange={handleOneTimeChange}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={oneTimeExpense.category}
                                onChange={handleOneTimeChange}
                                required
                            >
                                <option value="">Choose a category</option>
                                {CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={oneTimeExpense.description}
                            onChange={handleOneTimeChange}
                            placeholder="Enter a description"
                            rows="3"
                        />
                    </div>
                    <div className="form-group full-width">
                        <label>Status</label>
                        <div className="status-toggle">
                            <button
                                type="button"
                                className={`toggle-btn ${oneTimeExpense.status === 'INCOME' ? 'active' : ''}`}
                                onClick={() => setOneTimeExpense((prev) => ({ ...prev, status: 'INCOME' }))}
                            >
                                Income
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${oneTimeExpense.status === 'OUTGOING' ? 'active' : ''}`}
                                onClick={() => setOneTimeExpense((prev) => ({ ...prev, status: 'OUTGOING' }))}
                            >
                                Outgoing
                            </button>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate('/transactions')}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn">Save One-Time Transaction</button>
                    </div>
                </form>
            )}

            {activeTab === 'recurring' && (
                <form onSubmit={handleRecurringSubmit} className="modern-expense-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={recurringExpense.amount}
                                onChange={handleRecurringChange}
                                required
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="form-group">
                            <label>Currency</label>
                            <select
                                name="currency"
                                value={recurringExpense.currency}
                                onChange={handleRecurringChange}
                                required
                            >
                                {CURRENCIES.map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
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
                                value={recurringExpense.startMonth}
                                onChange={handleRecurringChange}
                                required
                                min="1"
                                max="12"
                                placeholder="1-12"
                            />
                        </div>
                        <div className="form-group">
                            <label>Start Year</label>
                            <input
                                type="number"
                                name="startYear"
                                value={recurringExpense.startYear}
                                onChange={handleRecurringChange}
                                required
                                min="2000"
                                max="2100"
                                placeholder="YYYY"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>End Month</label>
                            <input
                                type="number"
                                name="endMonth"
                                value={recurringExpense.endMonth}
                                onChange={handleRecurringChange}
                                required
                                min="1"
                                max="12"
                                placeholder="1-12"
                            />
                        </div>
                        <div className="form-group">
                            <label>End Year</label>
                            <input
                                type="number"
                                name="endYear"
                                value={recurringExpense.endYear}
                                onChange={handleRecurringChange}
                                required
                                min="2000"
                                max="2100"
                                placeholder="YYYY"
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Day of Month</label>
                            <input
                                type="number"
                                name="dayOfMonth"
                                value={recurringExpense.dayOfMonth}
                                onChange={handleRecurringChange}
                                min="1"
                                max="31"
                                placeholder="1-31"
                            />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={recurringExpense.category}
                                onChange={handleRecurringChange}
                                required
                            >
                                <option value="">Choose a category</option>
                                {CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="form-group full-width">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={recurringExpense.description}
                            onChange={handleRecurringChange}
                            placeholder="Enter a description"
                            rows="3"
                        />
                    </div>
                    <div className="form-group full-width">
                        <label>Status</label>
                        <div className="status-toggle">
                            <button
                                type="button"
                                className={`toggle-btn ${recurringExpense.status === 'INCOME' ? 'active' : ''}`}
                                onClick={() => setRecurringExpense((prev) => ({ ...prev, status: 'INCOME' }))}
                            >
                                Income
                            </button>
                            <button
                                type="button"
                                className={`toggle-btn ${recurringExpense.status === 'OUTGOING' ? 'active' : ''}`}
                                onClick={() => setRecurringExpense((prev) => ({ ...prev, status: 'OUTGOING' }))}
                            >
                                Outgoing
                            </button>
                        </div>
                    </div>
                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate('/transactions')}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn">Save Recurring Transaction</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default TransactionForm;