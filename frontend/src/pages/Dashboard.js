import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [monthlyBudget, setMonthlyBudget] = useState(null);
    const [annualBudget, setAnnualBudget] = useState(null);
    const [monthlyCategorySummary, setMonthlyCategorySummary] = useState({});
    const [annualCategorySummary, setAnnualCategorySummary] = useState({});
    const [currentMonthlyIncome, setCurrentMonthlyIncome] = useState(0);
    const [currentMonthlyOutgoings, setCurrentMonthlyOutgoings] = useState(0);
    const [annualIncome, setAnnualIncome] = useState(0);  // New state for annual income
    const [annualOutgoings, setAnnualOutgoings] = useState(0);  // New state for annual outgoings

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                const userData = await apiService.getUserInfo();
                const monthlyBudgetData = await apiService.getCurrentMonthlyBudget();
                const annualBudgetData = await apiService.getAnnualBudget();
                const monthlySummaryData = await apiService.getCurrentMonthCategorySummary();
                const annualSummaryData = await apiService.getCurrentYearCategorySummary();
                const currentMonthlyIncome = await apiService.getCurrentMonthlyIncome();
                const currentMonthlyOutgoings = await apiService.getCurrentMonthlyOutgoings();
                const annualIncomeData = await apiService.getAnnualIncome();  // Fetch annual income
                const annualOutgoingsData = await apiService.getAnnualOutgoings();  // Fetch annual outgoings

                if (mounted) {
                    setUser(userData);
                    setMonthlyBudget(monthlyBudgetData);
                    setAnnualBudget(annualBudgetData);
                    setMonthlyCategorySummary(monthlySummaryData);
                    setAnnualCategorySummary(annualSummaryData);
                    setCurrentMonthlyIncome(currentMonthlyIncome);
                    setCurrentMonthlyOutgoings(currentMonthlyOutgoings);
                    setAnnualIncome(annualIncomeData);  // Set annual income state
                    setAnnualOutgoings(annualOutgoingsData);  // Set annual outgoings state
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

    const renderCategorySummary = (categorySummary) => {
        return Object.entries(categorySummary).map(([category, summary]) => (
            <li key={category}>
                <span className="category-name">{category}</span>
                <span className="category-details">
                    {summary.transactionCount} transactions,
                    {summary.status === "INCOME" ? (
                        `${summary.totalAmount.toFixed(2)} USD income`
                    ) : (
                        `${summary.totalAmount.toFixed(2)} USD spent`
                    )}
                </span>
            </li>
        ));
    };

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
                    <div className="sub-cards">
                        <div className="income-card">
                            <h3>Income</h3>
                            <span className={currentMonthlyIncome >= 0 ? 'positive' : 'negative'}>
                                {currentMonthlyIncome !== null ? `${currentMonthlyIncome} USD` : 'Loading...'}
                            </span>
                        </div>
                        <div className="outgoings-card">
                            <h3>Outgoings</h3>
                            <span className={currentMonthlyOutgoings >= 0 ? 'negative' : 'positive'}>
                                {currentMonthlyOutgoings !== null ? `${currentMonthlyOutgoings} USD` : 'Loading...'}
                            </span>
                        </div>
                    </div>
                    <div className="category-summary">
                        <h3>Category Breakdown</h3>
                        {Object.keys(monthlyCategorySummary).length > 0 ? (
                            <ul>
                                {renderCategorySummary(monthlyCategorySummary)}
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
                    <div className="sub-cards">
                        <div className="income-card">
                            <h3>Income</h3>
                            <span className={annualIncome >= 0 ? 'positive' : 'negative'}>
                                {annualIncome !== null ? `${annualIncome} USD` : 'Loading...'}
                            </span>
                        </div>
                        <div className="outgoings-card">
                            <h3>Outgoings</h3>
                            <span className={annualOutgoings >= 0 ? 'negative' : 'positive'}>
                                {annualOutgoings !== null ? `${annualOutgoings} USD` : 'Loading...'}
                            </span>
                        </div>
                    </div>
                    <div className="category-summary">
                        <h3>Category Breakdown</h3>
                        {Object.keys(annualCategorySummary).length > 0 ? (
                            <ul>
                                {renderCategorySummary(annualCategorySummary)}
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
