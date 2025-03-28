import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import '../styles/ExpenseList.css';

function ExpenseList() {
    const [expenses, setExpenses] = useState([]);
    const [monthlyBudget, setMonthlyBudget] = useState(null);
    const [totalIncome, setTotalIncome] = useState(0.00);
    const [totalSpent, setTotalSpent] = useState(0.00);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const isCurrentMonth = year === currentYear && month === currentMonth;

        const fetchExpenses = async () => {
            try {
                const data = await apiService.getExpenses();
                setExpenses(data);
            } catch (error) {
                console.error('Failed to fetch expenses:', error);
            }
        };

        const fetchMonthlyExpenses = async () => {
            try {
                const data = await apiService.getMonthlyExpenses(year, month);
                setExpenses(data);
            } catch (error) {
                console.error('Failed to fetch monthly expenses:', error);
            }
        };

        const fetchMonthlyBudget = async () => {
            try {
                const data = isCurrentMonth
                    ? await apiService.getCurrentMonthlyBudget()
                    : await apiService.getMonthlyBudget(year, month);
                setMonthlyBudget(data);
            } catch (error) {
                console.error('Failed to fetch monthly budget:', error);
            }
        };

        const fetchTotalIncome = async () => {
            try {
                const income = isCurrentMonth
                    ? await apiService.getCurrentMonthlyIncome()
                    : 0.00;
                setTotalIncome(income);
            } catch (error) {
                console.error('Failed to fetch total income:', error);
            }
        };

        const fetchTotalSpent = async () => {
            try {
                const spent = isCurrentMonth
                    ? await apiService.getCurrentMonthlyOutgoings()
                    : 0.00;
                setTotalSpent(spent);
            } catch (error) {
                console.error('Failed to fetch total spent:', error);
            }
        };

        fetchMonthlyBudget();
        fetchTotalIncome();
        fetchTotalSpent();

        if (year && month && !isCurrentMonth) {
            fetchMonthlyExpenses();
        } else {
            fetchExpenses();
        }
    }, [year, month]);

    const handleYearChange = (e) => {
        setYear(parseInt(e.target.value));
    };

    const handleMonthChange = (e) => {
        setMonth(parseInt(e.target.value));
    };

    return (
        <div className="expense-list-container">
            <h1>All Expenses</h1>

            {/* Year and Month Selector */}
            <div className="filters">
                <select
                    value={year}
                    onChange={handleYearChange}
                    className="modern-select"
                >
                    {[...Array(101).keys()].map(i => {
                        const yearOption = 2020 + i;
                        return <option key={yearOption} value={yearOption}>{yearOption}</option>;
                    })}
                </select>
                <select
                    value={month}
                    onChange={handleMonthChange}
                    className="modern-select"
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>
                            {new Date(0, month - 1).toLocaleString('en', { month: 'long' })}
                        </option>
                    ))}
                </select>
                <button onClick={() => {}} className="fetch-btn">Refresh</button>
            </div>

            {/* Monthly Budget Status */}
            <div className="budget-status">
                <span className="budget-label">Monthly Budget Status: </span>
                <span className={monthlyBudget && monthlyBudget < 0 ? 'negative' : 'positive'}>
                    {monthlyBudget !== null ? `${monthlyBudget} USD` : 'Loading...'}
                </span>
            </div>

            {/* Total Income and Total Spent */}
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

            {/* Expense Table */}
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
                                <td>{expense.description}</td>
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
