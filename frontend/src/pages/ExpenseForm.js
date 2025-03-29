import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/ExpenseForm.css';

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
        currency: 'TL'
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
        try {
            const formattedDate = expense.date.split('-').reverse().join('-'); // yyyy-MM-dd -> dd-MM-yyyy
            const expenseToSend = {
                ...expense,
                date: formattedDate,
            };
            console.log('Sending expense:', expenseToSend);
            await apiService.createExpense(expenseToSend);
            alert('Transaction added successfully!');
            navigate('/expenses');
        } catch (err) {
            console.error('Error adding expense:', err.response || err);
            alert(`Error: ${err.response?.status || 'Unknown'} - ${err.response?.data?.message || err.message}`);
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
                            <option value="TL">TL</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="GOLD">Gold</option>
                            <option value="SILVER">Silver</option>
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
                            <option value="SHOPPING">Shopping</option>
                            <option value="RENT">Rent</option>
                            <option value="INVESTMENT">Investment</option>
                            <option value="EDUCATION">Education</option>
                            <option value="DEBT_PAYMENT">Debt Payment</option>
                            <option value="SALARY">Salary</option>
                            <option value="TRAVEL">Travel</option>
                            <option value="OTHER">Other</option>
                            <option value="BET">Bet</option>
                            <option value="TELECOMMUNICATION">Telecommunication</option>
                            <option value="TRANSPORTATION">Transportation</option>
                            <option value="TAX">Tax</option>
                        </select>
                    </div>
                </div>
                <div className="form-group full-width">
                    <label>Status</label>
                    <div className="status-toggle">
                        <button
                            type="button"
                            className={`toggle-btn ${expense.status === 'INCOME' ? 'active' : ''}`}
                            onClick={() => setExpense(prev => ({ ...prev, status: 'INCOME' }))}
                        >
                            Income
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${expense.status === 'OUTGOING' ? 'active' : ''}`}
                            onClick={() => setExpense(prev => ({ ...prev, status: 'OUTGOING' }))}
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
                        placeholder="What was this expense for?"
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
