import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [monthlyBudget, setMonthlyBudget] = useState(null);
    const [annualBudget, setAnnualBudget] = useState(null);
    const [monthlyCategorySummary, setMonthlyCategorySummary] = useState({});
    const [annualCategorySummary, setAnnualCategorySummary] = useState({});

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                const userData = await apiService.getUserInfo();
                const monthlyBudgetData = await apiService.getCurrentMonthlyBudget();
                const annualBudgetData = await apiService.getAnnualBudget();
                const monthlySummaryData = await apiService.getCurrentMonthCategorySummary();
                const annualSummaryData = await apiService.getCurrentYearCategorySummary();

                if (mounted) {
                    setUser(userData);
                    setMonthlyBudget(monthlyBudgetData);
                    setAnnualBudget(annualBudgetData);
                    setMonthlyCategorySummary(monthlySummaryData);
                    setAnnualCategorySummary(annualSummaryData);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };

        fetchData();

        return () => {
            mounted = false;
        };
    }, []);

    const currentDate = new Date();
    const monthName = currentDate.toLocaleString('en', { month: 'long' });
    const year = currentDate.getFullYear();

    if (!user) return <div className="dashboard-loading">Loading...</div>;

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Welcome, {user.username}</h1>
            <div className="budget-grid">
                <div className="budget-panel monthly">
                    <div className="panel-header">
                        <h2>Monthly Budget</h2>
                        <span className="panel-subtitle">{monthName} {year}</span>
                    </div>
                    <div className="panel-value">
                        <span className={monthlyBudget < 0 ? 'negative' : 'positive'}>
                            {monthlyBudget !== null ? `${monthlyBudget} USD` : 'Loading...'}
                        </span>
                    </div>
                    <div className="category-summary">
                        <h3>Category Breakdown</h3>
                        {Object.keys(monthlyCategorySummary).length > 0 ? (
                            <ul>
                                {Object.entries(monthlyCategorySummary).map(([category, summary]) => (
                                    <li key={category}>
                                        <span className="category-name">{category}</span>
                                        <span className="category-details">
                                            {summary.transactionCount} transactions,
                                            {summary.totalAmount.toFixed(2)} USD spent
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No data available</p>
                        )}
                    </div>
                </div>
                <div className="budget-panel annual">
                    <div className="panel-header">
                        <h2>Annual Budget</h2>
                        <span className="panel-subtitle">{year}</span>
                    </div>
                    <div className="panel-value">
                        <span className={annualBudget < 0 ? 'negative' : 'positive'}>
                            {annualBudget !== null ? `${annualBudget} USD` : 'Loading...'}
                        </span>
                    </div>
                    <div className="category-summary">
                        <h3>Category Breakdown</h3>
                        {Object.keys(annualCategorySummary).length > 0 ? (
                            <ul>
                                {Object.entries(annualCategorySummary).map(([category, summary]) => (
                                    <li key={category}>
                                        <span className="category-name">{category}</span>
                                        <span className="category-details">
                                            {summary.transactionCount} transactions,
                                            {summary.totalAmount.toFixed(2)} USD spent
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No data available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;