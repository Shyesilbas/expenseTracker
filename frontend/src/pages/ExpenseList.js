import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import '../styles/ExpenseList.css';

function ExpenseList() {
    const [expenses, setExpenses] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    useEffect(() => {
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

        if (year && month) {
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
                            <th>Payment Method</th>
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
                                <td>{expense.paymentMethod}</td>
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