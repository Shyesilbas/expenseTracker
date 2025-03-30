import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [annualIncome, setAnnualIncome] = useState(0);
    const [annualOutgoings, setAnnualOutgoings] = useState(0);
    const navigate = useNavigate();

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
                const annualIncomeData = await apiService.getAnnualIncome();
                const annualOutgoingsData = await apiService.getAnnualOutgoings();

                // Debugging API responses
                console.log('Monthly Category Summary:', monthlySummaryData);
                console.log('Annual Category Summary:', annualSummaryData);
                console.log('Current Monthly Outgoings:', currentMonthlyOutgoings);

                if (mounted) {
                    setUser(userData);
                    setMonthlyBudget(monthlyBudgetData);
                    setAnnualBudget(annualBudgetData);
                    setMonthlyCategorySummary(monthlySummaryData);
                    setAnnualCategorySummary(annualSummaryData);
                    setCurrentMonthlyIncome(currentMonthlyIncome);
                    setCurrentMonthlyOutgoings(currentMonthlyOutgoings);
                    setAnnualIncome(annualIncomeData);
                    setAnnualOutgoings(annualOutgoingsData);
                    // Debugging state after setting
                    console.log('State after set - Monthly Summary:', monthlySummaryData);
                    console.log('State after set - Current Monthly Outgoings:', currentMonthlyOutgoings);
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

    const renderCategorySummary = (categorySummary, status) => {
        // Flatten the nested arrays and filter by status
        const filteredSummary = Object.entries(categorySummary)
            .flatMap(([category, summaries]) =>
                summaries.map(summary => ({ category, ...summary }))
            )
            .filter(summary => summary.status === status);

        // Debugging filtered result
        console.log(`Filtering for ${status}:`, filteredSummary);

        return filteredSummary.length > 0 ? (
            <ul>
                {filteredSummary.map((summary, index) => (
                    <li key={`${summary.category}-${index}`} className="category-item">
                        <span className="category-name">{summary.category}</span>
                        <span className="category-details">
                            {summary.transactionCount} transaction(s) • {summary.totalAmount.toFixed(2)} USD
                        </span>
                    </li>
                ))}
            </ul>
        ) : (
            <p>No data available</p>
        );
    };

    const handleIncomeClick = () => {
        navigate('/expenses', { state: { status: 'INCOME' } });
    };

    const handleOutgoingsClick = () => {
        navigate('/expenses', { state: { status: 'OUTGOING' } });
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Welcome, {user.username}</h1>
            <div className="budget-grid">
                <div className="budget-panel monthly" onClick={() => navigate('/expenses')} style={{ cursor: 'pointer' }}>
                    <div className="panel-header">
                        <h2>Monthly Budget</h2>
                        <span className="panel-subtitle">{monthName} {year}</span>
                    </div>
                    <div className="panel-value">
                        <span className={monthlyBudget < 0 ? 'negative' : 'positive'}>
                            {monthlyBudget !== null ? `${monthlyBudget.toFixed(2)} USD` : 'Loading...'}
                        </span>
                    </div>
                    <div className="sub-cards">
                        <div
                            className="income-card"
                            onClick={handleIncomeClick}
                            style={{ cursor: 'pointer' }}
                        >
                            <h3>Income</h3>
                            <span className="positive">
                                {currentMonthlyIncome !== null ? `${currentMonthlyIncome.toFixed(2)} USD` : 'Loading...'}
                            </span>
                            <div className="category-summary">
                                <h3>Category Breakdown</h3>
                                {renderCategorySummary(monthlyCategorySummary, 'INCOME')}
                            </div>
                        </div>
                        <div
                            className="outgoings-card"
                            onClick={handleOutgoingsClick}
                            style={{ cursor: 'pointer' }}
                        >
                            <h3>Outgoings</h3>
                            <span className="negative">
                                {currentMonthlyOutgoings !== null ? `${currentMonthlyOutgoings.toFixed(2)} USD` : 'Loading...'}
                            </span>
                            <div className="category-summary">
                                <h3>Category Breakdown</h3>
                                {renderCategorySummary(monthlyCategorySummary, 'OUTGOING')}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="budget-panel annual">
                    <div className="panel-header">
                        <h2>Annual Budget</h2>
                        <span className="panel-subtitle">{year}</span>
                    </div>
                    <div className="panel-value">
                        <span className={annualBudget < 0 ? 'negative' : 'positive'}>
                            {annualBudget !== null ? `${annualBudget.toFixed(2)} USD` : 'Loading...'}
                        </span>
                    </div>
                    <div className="sub-cards">
                        <div className="income-card">
                            <h3>Income</h3>
                            <span className="positive">
                                {annualIncome !== null ? `${annualIncome.toFixed(2)} USD` : 'Loading...'}
                            </span>
                            <div className="category-summary">
                                <h3>Category Breakdown</h3>
                                {renderCategorySummary(annualCategorySummary, 'INCOME')}
                            </div>
                        </div>
                        <div className="outgoings-card">
                            <h3>Outgoings</h3>
                            <span className="negative">
                                {annualOutgoings !== null ? `${annualOutgoings.toFixed(2)} USD` : 'Loading...'}
                            </span>
                            <div className="category-summary">
                                <h3>Category Breakdown</h3>
                                {renderCategorySummary(annualCategorySummary, 'OUTGOING')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;