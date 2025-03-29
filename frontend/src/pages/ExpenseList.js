import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import ExpensePieChart from '../components/ExpensePieChart';
import '../styles/ExpenseList.css';

function ExpenseList() {
    const [expenses, setExpenses] = useState([]);
    const [monthlyBudget, setMonthlyBudget] = useState(null);
    const [totalIncome, setTotalIncome] = useState(0.00);
    const [totalSpent, setTotalSpent] = useState(0.00);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [currency, setCurrency] = useState('');
    const [date, setDate] = useState('');

    const fetchData = async () => {
        try {
            const expenseData = await apiService.getMonthlyExpenses(year, month);

            let filteredExpenses = expenseData;
            if (category) {
                filteredExpenses = filteredExpenses.filter(expense => expense.category === category);
            }
            if (status) {
                filteredExpenses = filteredExpenses.filter(expense => expense.status === status);
            }
            if (currency) {
                filteredExpenses = filteredExpenses.filter(expense => expense.currency === currency);
            }
            if (date) {
                filteredExpenses = filteredExpenses.filter(expense => expense.date === date);
            }

            setExpenses(filteredExpenses);
            setMonthlyBudget(await apiService.getMonthlyBudget(year, month));
            setTotalIncome(await apiService.getMonthlyIncome(year, month));
            setTotalSpent(await apiService.getMonthlyOutgoings(year, month));
        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [year, month, category, status, currency, date]);

    const handleYearChange = (e) => {
        setYear(parseInt(e.target.value));
        resetFilters();
    };

    const handleMonthChange = (e) => {
        setMonth(parseInt(e.target.value));
        resetFilters();
    };

    const resetFilters = () => {
        setCategory('');
        setStatus('');
        setCurrency('');
        setDate('');
    };

    const categories = [
        '', 'SHOPPING', 'RENT', 'INVESTMENT', 'EDUCATION', 'DEBT_PAYMENT', 'SALARY',
        'TRAVEL', 'OTHER', 'BET', 'TELECOMMUNICATION', 'TRANSPORTATION', 'TAX'
    ];
    const statuses = ['', 'INCOME', 'OUTGOING'];
    const currencies = ['', 'USD', 'EUR', 'TL'];

    return (
        <div className="expense-list-container">
            <h1>All Expenses</h1>

            <div className="filters">
                <select value={year} onChange={handleYearChange} className="modern-select">
                    {[...Array(101).keys()].map(i => {
                        const yearOption = 2020 + i;
                        return <option key={yearOption} value={yearOption}>{yearOption}</option>;
                    })}
                </select>
                <select value={month} onChange={handleMonthChange} className="modern-select">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>
                            {new Date(0, m - 1).toLocaleString('en', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="modern-select">
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat || 'All Categories'}</option>
                    ))}
                </select>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="modern-select">
                    {statuses.map(stat => (
                        <option key={stat} value={stat}>{stat || 'All Statuses'}</option>
                    ))}
                </select>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="modern-select">
                    {currencies.map(curr => (
                        <option key={curr} value={curr}>{curr || 'All Currencies'}</option>
                    ))}
                </select>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="modern-select"
                />
                <button onClick={fetchData} className="fetch-btn">Refresh</button>
            </div>

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

            <div className="chart-container">
                <h2>Expense Distribution by Category</h2>
                <ExpensePieChart expenses={expenses.filter(exp => exp.status === 'OUTGOING')} />
            </div>

            <div className="expense-table-container">
                {expenses.length === 0 ? (
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
                        </tr>
                        </thead>
                        <tbody>
                        {expenses.map((expense) => (
                            <tr key={expense.id}>
                                <td>{expense.date}</td>
                                <td className={expense.status === 'OUTGOING' ? 'outgoing' : 'incoming'}>
                                    {expense.amount}
                                </td>
                                <td>{expense.currency}</td>
                                <td>{expense.description || '-'}</td>
                                <td>{expense.category}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default ExpenseList;