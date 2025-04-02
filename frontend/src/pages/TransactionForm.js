import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/TransactionForm.css';
import { DateUtils } from '../utils/DateUtils';
import { CATEGORIES, CURRENCIES } from '../constants/constants';
import { showConfirmation, showError, showSuccess } from "../utils/SweetAlertUtils";

function TransactionForm() {
    const today = new Date();
    today.setHours(today.getHours() + 3);
    const formattedDate = today.toISOString().split('T')[0];

    const [activeTab, setActiveTab] = useState('oneTime');
    const [oneTimeTransaction, setOneTimeTransaction] = useState({
        amount: '',
        date: formattedDate,
        category: '',
        status: 'OUTGOING',
        description: '',
        currency: 'TL',
    });

    const [recurringTransaction, setRecurringTransaction] = useState({
        amount: '',
        category: '',
        status: 'OUTGOING',
        description: '',
        currency: 'TL',
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        dayOfMonth: '',
    });

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserInfo() {
            try {
                const userInfo = await apiService.getUserInfo();
                const favoriteCurrency = userInfo.favoriteCurrency || 'USD';
                setOneTimeTransaction((prev) => ({ ...prev, currency: favoriteCurrency }));
                setRecurringTransaction((prev) => ({ ...prev, currency: favoriteCurrency }));
            } catch (err) {
                console.error('Error fetching user info:', err);
            }
        }
        fetchUserInfo();
    }, []);

    const handleOneTimeChange = (e) => {
        const { name, value } = e.target;
        setOneTimeTransaction((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleRecurringChange = (e) => {
        const { name, value } = e.target;
        setRecurringTransaction((prevState) => ({
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
            const formattedDate = DateUtils.formatDate(oneTimeTransaction.date);
            const transactionToSend = {
                amount: oneTimeTransaction.amount,
                date: formattedDate,
                category: oneTimeTransaction.category,
                status: oneTimeTransaction.status,
                description: oneTimeTransaction.description,
                currency: oneTimeTransaction.currency,
            };
            await apiService.createOneTimeTransaction(transactionToSend);
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
            const transactionToSend = {
                amount: parseFloat(recurringTransaction.amount),
                description: recurringTransaction.description,
                category: recurringTransaction.category,
                status: recurringTransaction.status,
                currency: recurringTransaction.currency,
                startMonth: recurringTransaction.startMonth,
                startYear: recurringTransaction.startYear,
                endMonth: recurringTransaction.endMonth,
                endYear: recurringTransaction.endYear,
                dayOfMonth: recurringTransaction.dayOfMonth || undefined,
            };

            await apiService.createRecurringTransaction(transactionToSend);

            showSuccess({ text: 'Recurring transaction added successfully!' });
            navigate('/transactions');
        } catch (err) {
            showError({
                text: `Error: ${err.response?.status || 'Unknown'} - ${err.response?.data?.message || err.message}`,
            });
        }
    };


    return (
        <div className="transaction-form-container">
            <div className="transaction-tabs">
                <button
                    className={`transaction-tab-btn ${activeTab === 'oneTime' ? 'active' : ''}`}
                    onClick={() => setActiveTab('oneTime')}
                >
                    One-Time Transaction
                </button>
                <button
                    className={`transaction-tab-btn ${activeTab === 'recurring' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recurring')}
                >
                    Recurring Transaction
                </button>
            </div>

            {activeTab === 'oneTime' && (
                <form onSubmit={handleOneTimeSubmit} className="transaction-form">
                    <div className="transaction-form-row">
                        <div className="transaction-form-group">
                            <label>Amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={oneTimeTransaction.amount}
                                onChange={handleOneTimeChange}
                                required
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="transaction-form-group">
                            <label>Currency</label>
                            <select
                                name="currency"
                                value={oneTimeTransaction.currency}
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
                    <div className="transaction-form-group full-width">
                        <label>Date</label>
                        <input
                            type="date"
                            name="date"
                            value={oneTimeTransaction.date}
                            onChange={handleOneTimeChange}
                            required
                        />
                    </div>
                    <div className="transaction-form-row">
                        <div className="transaction-form-group full-width">
                            <label>Category</label>
                            <select
                                name="category"
                                value={oneTimeTransaction.category}
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
                    <div className="transaction-form-group full-width">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={oneTimeTransaction.description}
                            onChange={handleOneTimeChange}
                            placeholder="Enter a description"
                            rows="3"
                        />
                    </div>
                    <div className="transaction-form-group full-width">
                        <label>Status</label>
                        <div className="transaction-status-toggle">
                            <button
                                type="button"
                                className={`transaction-toggle-btn ${oneTimeTransaction.status === 'INCOME' ? 'active' : ''}`}
                                onClick={() => setOneTimeTransaction((prev) => ({ ...prev, status: 'INCOME' }))}
                            >
                                Income
                            </button>
                            <button
                                type="button"
                                className={`transaction-toggle-btn ${oneTimeTransaction.status === 'OUTGOING' ? 'active' : ''}`}
                                onClick={() => setOneTimeTransaction((prev) => ({ ...prev, status: 'OUTGOING' }))}
                            >
                                Outgoing
                            </button>
                        </div>
                    </div>
                    <div className="transaction-form-actions">
                        <button type="button" className="transaction-cancel-btn" onClick={() => navigate('/transactions')}>
                            Cancel
                        </button>
                        <button type="submit" className="transaction-submit-btn">Save One-Time Transaction</button>
                    </div>
                </form>
            )}

            {activeTab === 'recurring' && (
                <form onSubmit={handleRecurringSubmit} className="transaction-form">
                    <div className="transaction-form-row">
                        <div className="transaction-form-group">
                            <label>Amount</label>
                            <input
                                type="number"
                                name="amount"
                                value={recurringTransaction.amount}
                                onChange={handleRecurringChange}
                                required
                                step="0.01"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="transaction-form-group">
                            <label>Currency</label>
                            <select
                                name="currency"
                                value={recurringTransaction.currency}
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
                    <div className="transaction-form-row">
                        <div className="transaction-form-group">
                            <label>Start Month</label>
                            <input
                                type="number"
                                name="startMonth"
                                value={recurringTransaction.startMonth}
                                onChange={handleRecurringChange}
                                required
                                min="1"
                                max="12"
                                placeholder="1-12"
                            />
                        </div>
                        <div className="transaction-form-group">
                            <label>Start Year</label>
                            <input
                                type="number"
                                name="startYear"
                                value={recurringTransaction.startYear}
                                onChange={handleRecurringChange}
                                required
                                min="2000"
                                max="2100"
                                placeholder="YYYY"
                            />
                        </div>
                    </div>
                    <div className="transaction-form-row">
                        <div className="transaction-form-group">
                            <label>End Month</label>
                            <input
                                type="number"
                                name="endMonth"
                                value={recurringTransaction.endMonth}
                                onChange={handleRecurringChange}
                                required
                                min="1"
                                max="12"
                                placeholder="1-12"
                            />
                        </div>
                        <div className="transaction-form-group">
                            <label>End Year</label>
                            <input
                                type="number"
                                name="endYear"
                                value={recurringTransaction.endYear}
                                onChange={handleRecurringChange}
                                required
                                min="2000"
                                max="2100"
                                placeholder="YYYY"
                            />
                        </div>
                    </div>
                    <div className="transaction-form-row">
                        <div className="transaction-form-group">
                            <label>Day of Month</label>
                            <input
                                type="number"
                                name="dayOfMonth"
                                value={recurringTransaction.dayOfMonth}
                                onChange={handleRecurringChange}
                                min="1"
                                max="31"
                                placeholder="1-31"
                            />
                        </div>
                        <div className="transaction-form-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={recurringTransaction.category}
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
                    <div className="transaction-form-group full-width">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={recurringTransaction.description}
                            onChange={handleRecurringChange}
                            placeholder="Enter a description"
                            rows="3"
                        />
                    </div>
                    <div className="transaction-form-group full-width">
                        <label>Status</label>
                        <div className="transaction-status-toggle">
                            <button
                                type="button"
                                className={`transaction-toggle-btn ${recurringTransaction.status === 'INCOME' ? 'active' : ''}`}
                                onClick={() => setRecurringTransaction((prev) => ({ ...prev, status: 'INCOME' }))}
                            >
                                Income
                            </button>
                            <button
                                type="button"
                                className={`transaction-toggle-btn ${recurringTransaction.status === 'OUTGOING' ? 'active' : ''}`}
                                onClick={() => setRecurringTransaction((prev) => ({ ...prev, status: 'OUTGOING' }))}
                            >
                                Outgoing
                            </button>
                        </div>
                    </div>
                    <div className="transaction-form-actions">
                        <button type="button" className="transaction-cancel-btn" onClick={() => navigate('/transactions')}>
                            Cancel
                        </button>
                        <button type="submit" className="transaction-submit-btn">Save Recurring Transaction</button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default TransactionForm;