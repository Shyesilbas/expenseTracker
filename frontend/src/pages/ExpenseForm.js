import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/ExpenseForm.css';
import { DateUtils } from '../utils/DateUtils';
import { CATEGORIES, CURRENCIES } from '../constants/constants';
import {showConfirmation, showError, showSuccess} from "../utils/SweetAlertUtils";

function ExpenseForm() {
    const today = new Date();
    today.setHours(today.getHours() + 3);
    const formattedDate = today.toISOString().split('T')[0];
    const [expense, setExpense] = useState({
        amount: '',
        date: formattedDate,
        category: '',
        status: 'OUTGOING',
        description: '',
        currency: 'TL',
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setExpense((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const confirmed = await showConfirmation({
            title: 'Add Transaction',
            text: 'Are you sure you want to add this transaction?',
            confirmButtonText: 'Yes, add it!',
        });

        if (!confirmed) return;

        try {
            const formattedDate = DateUtils.formatDate(expense.date);
            const expenseToSend = {
                ...expense,
                date: formattedDate,
            };
            await apiService.createExpense(expenseToSend);
            showSuccess({ text: 'Transaction added successfully!' });
            navigate('/expenses');
        } catch (err) {
            showError({
                text: `Error: ${err.response?.status || 'Unknown'} - ${err.response?.data?.message || err.message}`,
            });
        }
    };

    return (
        <div className="modern-expense-form-container">
            <h2>Add Transaction</h2>
            <form onSubmit={handleSubmit} className="modern-expense-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Amount</label>
                        <input
                            type="number"
                            name="amount"
                            value={expense.amount}
                            onChange={handleChange}
                            required
                            step="0.01"
                            placeholder="0.00"
                        />
                    </div>
                    <div className="form-group">
                        <label>Currency</label>
                        <select
                            name="currency"
                            value={expense.currency}
                            onChange={handleChange}
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
                        value={expense.date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Category</label>
                        <select
                            name="category"
                            value={expense.category}
                            onChange={handleChange}
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
                    <label>Status</label>
                    <div className="status-toggle">
                        <button
                            type="button"
                            className={`toggle-btn ${expense.status === 'INCOME' ? 'active' : ''}`}
                            onClick={() => setExpense((prev) => ({ ...prev, status: 'INCOME' }))}
                        >
                            Income
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${expense.status === 'OUTGOING' ? 'active' : ''}`}
                            onClick={() => setExpense((prev) => ({ ...prev, status: 'OUTGOING' }))}
                        >
                            Outgoing
                        </button>
                    </div>
                </div>
                <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                        name="description"
                        value={expense.description}
                        onChange={handleChange}
                        placeholder="Add your notes here"
                        rows="2"
                    />
                </div>
                <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => navigate('/expenses')}>
                        Cancel
                    </button>
                    <button type="submit" className="submit-btn">Save Expense</button>
                </div>
            </form>
        </div>
    );
}

export default ExpenseForm;