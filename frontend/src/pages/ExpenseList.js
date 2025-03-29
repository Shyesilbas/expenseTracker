import React, { useEffect, useState, useCallback } from 'react';
import apiService from '../services/api';
import PieChart from '../components/PieChart';
import '../styles/ExpenseList.css';
import _ from 'lodash';

function ExpenseList() {
    const currentDate = new Date();
    const [expenses, setExpenses] = useState([]);
    const [monthlyBudget, setMonthlyBudget] = useState(null);
    const [totalIncome, setTotalIncome] = useState(0.00);
    const [totalSpent, setTotalSpent] = useState(0.00);
    const [filters, setFilters] = useState({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        category: '',
        status: '',
        currency: '',
        date: '',
    });
    const [editingExpenseId, setEditingExpenseId] = useState(null);
    const [editForm, setEditForm] = useState({
        amount: '',
        currency: '',
        status: '',
        category: '',
        date: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { year, month } = filters;
            const budget = await apiService.getMonthlyBudget(year, month);
            const income = await apiService.getMonthlyIncome(year, month);
            const spent = await apiService.getMonthlyOutgoings(year, month);

            setMonthlyBudget(budget);
            setTotalIncome(income);
            setTotalSpent(spent);

            const apiFilters = {
                ...filters,
                category: filters.category || undefined,
                status: filters.status || undefined,
                currency: filters.currency || undefined,
                date: filters.date || undefined,
            };

            const expenseData = await apiService.getExpensesByFilters(apiFilters);
            setExpenses(expenseData);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Create a debounced version of fetchData
    const debouncedFetchData = useCallback(_.debounce(() => {
        fetchData();
    }, 300), [fetchData]);

    useEffect(() => {
        debouncedFetchData();
        // Cleanup function to cancel any pending debounced calls when filters change again or component unmounts
        return () => {
            debouncedFetchData.cancel();
        };
    }, [debouncedFetchData]);

    const handleDeleteExpense = async (expenseId) => {
        if (!expenseId || isNaN(expenseId)) {
            console.error("Invalid expense ID:", expenseId);
            return;
        }
        try {
            await apiService.deleteExpense(expenseId);
            fetchData();
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const handleUpdateExpense = async (expenseId) => {
        const formatDate = (dateStr) => {
            if (!dateStr) return undefined;
            const [year, month, day] = dateStr.split('-');
            return `${day}-${month}-${year}`;
        };

        const updateData = {
            id: expenseId,
            amount: editForm.amount ? Number(editForm.amount) : undefined,
            currency: editForm.currency || undefined,
            status: editForm.status || undefined,
            category: editForm.category || undefined,
            date: editForm.date ? formatDate(editForm.date) : undefined,
        };

        try {
            await apiService.updateExpense(expenseId, updateData);
            setEditingExpenseId(null);
            setEditForm({ amount: '', currency: '', status: '', category: '', date: '' });
            fetchData();
        } catch (error) {
            console.error('Error updating expense:', error);
        }
    };

    const startEditing = (expense) => {
        setEditingExpenseId(expense.expenseId);
        setEditForm({
            amount: expense.amount || '',
            currency: expense.currency || '',
            status: expense.status || '',
            category: expense.category || '',
            date: expense.date.split('.').reverse().join('-') || '',
        });
    };

    const cancelEditing = () => {
        setEditingExpenseId(null);
        setEditForm({ amount: '', currency: '', status: '', category: '', date: '' });
    };

    // Use debounced version for filter changes
    const handleFilterChange = useCallback((e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'year' || name === 'month' ? { category: '', status: '', currency: '', date: '' } : {}),
        }));
    }, []);

    const categories = [
        '', 'SHOPPING', 'RENT', 'INVESTMENT', 'EDUCATION', 'DEBT_PAYMENT', 'SALARY',
        'TRAVEL', 'OTHER', 'BET', 'TELECOMMUNICATION', 'TRANSPORTATION', 'TAX'
    ];
    const statuses = ['', 'INCOME', 'OUTGOING'];
    const currencies = ['', 'USD', 'EUR', 'TL' , 'GBP'];

    return (
        <div className="expense-list-container">
            <h1>All Transactions - {new Date(filters.year, filters.month - 1).toLocaleString('en', { month: 'long', year: 'numeric' })}</h1>

            <div className="filters">
                <select name="year" value={filters.year} onChange={handleFilterChange} className="modern-select">
                    {[...Array(101).keys()].map(i => {
                        const yearOption = 2020 + i;
                        return <option key={yearOption} value={yearOption}>{yearOption}</option>;
                    })}
                </select>
                <select name="month" value={filters.month} onChange={handleFilterChange} className="modern-select">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>
                            {new Date(0, m - 1).toLocaleString('en', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <select name="category" value={filters.category} onChange={handleFilterChange} className="modern-select">
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat || 'All Categories'}</option>
                    ))}
                </select>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="modern-select">
                    {statuses.map(stat => (
                        <option key={stat} value={stat}>{stat || 'All Statuses'}</option>
                    ))}
                </select>
                <select name="currency" value={filters.currency} onChange={handleFilterChange} className="modern-select">
                    {currencies.map(curr => (
                        <option key={curr} value={curr}>{curr || 'All Currencies'}</option>
                    ))}
                </select>
                <input
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="modern-select"
                />
                <button onClick={() => fetchData()} className="fetch-btn" disabled={loading}>
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {error && <p className="error-message">{error}</p>}

            <div className="budget-status">
                <span className="budget-label">Monthly Budget Status: </span>
                <span className={monthlyBudget && monthlyBudget < 0 ? 'negative' : 'positive'}>
                    {monthlyBudget !== null ? `${monthlyBudget} USD` : 'Loading...'}
                </span>
            </div>

            <div className="budget-summary">
                <div className="budget-item">
                    <span className="budget-label">Total Income: </span>
                    <span className="positive">{totalIncome !== null ? `${totalIncome} USD` : 'Loading...'}</span>
                </div>
                <div className="budget-item">
                    <span className="budget-label">Total Spent: </span>
                    <span className={totalSpent < 0 ? 'negative' : 'positive'}>
                        {totalSpent !== null ? `${totalSpent} USD` : 'Loading...'}
                    </span>
                </div>
            </div>

            <div className="expense-table-container">
                {loading ? (
                    <p className="loading-message">Loading expenses...</p>
                ) : expenses.length === 0 ? (
                    <p className="no-data">No expenses found for this period.</p>
                ) : (
                    <table className="expense-table">
                        <thead>
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Currency</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {expenses.map((expense) => (
                            <tr key={expense.expenseId}>
                                {editingExpenseId === expense.expenseId ? (
                                    <>
                                        <td>
                                            <input
                                                type="date"
                                                value={editForm.date}
                                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <input
                                                type="number"
                                                value={editForm.amount}
                                                onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                value={editForm.currency}
                                                onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
                                            >
                                                {currencies.map(curr => (
                                                    <option key={curr} value={curr}>{curr || 'Select'}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>{expense.description || '-'}</td>
                                        <td>
                                            <select
                                                value={editForm.category}
                                                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat} value={cat}>{cat || 'Select'}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                value={editForm.status}
                                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                            >
                                                {statuses.map(stat => (
                                                    <option key={stat} value={stat}>{stat || 'Select'}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                className="update-btn"
                                                onClick={() => handleUpdateExpense(expense.expenseId)}
                                            >
                                                Save
                                            </button>
                                            <button
                                                className="cancel-btn"
                                                onClick={cancelEditing}
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </>
                                ) : (
                                    <>
                                        <td>{expense.date}</td>
                                        <td className={expense.status === 'OUTGOING' ? 'outgoing' : 'incoming'}>
                                            {expense.amount}
                                        </td>
                                        <td>{expense.currency}</td>
                                        <td>{expense.description || '-'}</td>
                                        <td>{expense.category}</td>
                                        <td>{expense.status}</td>
                                        <td>
                                            <button
                                                className="update-btn"
                                                onClick={() => startEditing(expense)}
                                            >
                                                Update
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteExpense(expense.expenseId)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </>
                                )}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="chart-container-wrapper">
                <div className="chart-container">
                    <h2>Expense Distribution by Category</h2>
                    <PieChart data={expenses.filter(exp => exp.status === 'OUTGOING')} title="Expenses" />
                </div>
                <div className="chart-container">
                    <h2>Income Distribution by Category</h2>
                    <PieChart data={expenses.filter(exp => exp.status === 'INCOME')} title="Income" />
                </div>
            </div>
        </div>
    );
}

export default ExpenseList;