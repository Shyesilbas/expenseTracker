import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [monthlySummary, setMonthlySummary] = useState(null);
    const [annualSummary, setAnnualSummary] = useState(null);
    const [convertedMonthlyTotal, setConvertedMonthlyTotal] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedAnnualYear, setSelectedAnnualYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const navigate = useNavigate();

    const availableCurrencies = ['USD', 'EUR', 'TRY', 'GBP'];
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                const userData = await apiService.getUserInfo();
                const monthlySummaryData = await apiService.getMonthlySummary(selectedYear, selectedMonth);
                const annualSummaryData = await apiService.getAnnualSummary(selectedAnnualYear);

                if (mounted) {
                    setUser(userData);
                    setMonthlySummary(monthlySummaryData);
                    setAnnualSummary(annualSummaryData);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        };

        fetchData();

        return () => {
            mounted = false;
        };
    }, [selectedYear, selectedMonth, selectedAnnualYear]);

    useEffect(() => {
        const convertMonthlyTotal = async () => {
            if (monthlySummary?.totalBudget && user?.favoriteCurrency && selectedCurrency !== user.favoriteCurrency) {
                try {
                    const converted = await apiService.convertCurrency(
                        user.favoriteCurrency,
                        selectedCurrency,
                        monthlySummary.totalBudget
                    );
                    setConvertedMonthlyTotal(converted);
                } catch (err) {
                    console.error('Failed to convert currency:', err);
                    setConvertedMonthlyTotal(null);
                }
            } else {
                setConvertedMonthlyTotal(null);
            }
        };

        convertMonthlyTotal();
    }, [monthlySummary, selectedCurrency, user]);

    const monthName = new Date(selectedYear, selectedMonth - 1).toLocaleString('en', { month: 'long' });

    if (!user) return <div className="db-dashboard-loading">Loading...</div>;

    const renderCategorySummary = (summary, status) => {
        if (!summary?.categories) return <div className="db-no-data">No data available</div>;

        const categoryData = {};
        Object.entries(summary.categories).forEach(([category, transactions]) => {
            const filtered = transactions.filter((tx) => tx.status === status);
            if (filtered.length > 0) {
                categoryData[category] = {
                    transactionCount: filtered.reduce((sum, tx) => sum + tx.transactionCount, 0),
                    amount: filtered.reduce((sum, tx) => sum + tx.totalAmount, 0),
                };
            }
        });

        const filteredCategories = Object.entries(categoryData);
        return filteredCategories.length > 0 ? (
            <ul className="db-category-list">
                {filteredCategories.map(([category, data], index) => (
                    <li key={`${category}-${index}`} className="db-category-item">
                        <span className="db-category-name">{category}</span>
                        <div className="db-category-details">
                            <span className="db-category-transactions">{data.transactionCount} tx</span>
                            <span className="db-category-amount">
                                {data.amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {user.favoriteCurrency}
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        ) : (
            <div className="db-no-data">No data available</div>
        );
    };

    const handleIncomeClick = (e) => {
        e.stopPropagation();
        navigate('/expenses', { state: { status: 'INCOME', year: selectedYear, month: selectedMonth } });
    };

    const handleOutgoingsClick = (e) => {
        e.stopPropagation();
        navigate('/expenses', { state: { status: 'OUTGOING', year: selectedYear, month: selectedMonth } });
    };

    return (
        <div className="db-dashboard-container">
            <h1 className="db-dashboard-title">Welcome, {user.username}</h1>
            <div className="db-budget-grid">
                <div className="db-budget-panel db-monthly" onClick={() => navigate('/expenses')} style={{ cursor: 'pointer' }}>
                    <div className="db-panel-header">
                        <h2>Monthly Summary</h2>
                        <div className="db-date-selector">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {months.map((month) => (
                                    <option key={month} value={month}>
                                        {new Date(selectedYear, month - 1).toLocaleString('en', { month: 'long' })}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="db-currency-converter">
                            <select
                                value={selectedCurrency}
                                onChange={(e) => setSelectedCurrency(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {availableCurrencies.map((currency) => (
                                    <option key={currency} value={currency}>{currency}</option>
                                ))}
                            </select>
                            {convertedMonthlyTotal !== null && convertedMonthlyTotal !== undefined && (
                                <span className="db-converted-value">
                                    ≈ {convertedMonthlyTotal.toFixed(2)} {selectedCurrency}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="db-panel-value">
                        <span className={monthlySummary?.totalBudget < 0 ? 'db-negative' : 'db-positive'}>
                            {monthlySummary?.totalBudget !== undefined
                                ? `${monthlySummary.totalBudget.toFixed(2)} ${user.favoriteCurrency}`
                                : 'Loading...'}
                        </span>
                    </div>
                    <div className="db-sub-cards">
                        <div className="db-income-card" onClick={handleIncomeClick} style={{ cursor: 'pointer' }}>
                            <h3>Income</h3>
                            <span className="db-positive">
                                {monthlySummary?.totalIncome !== undefined
                                    ? `${monthlySummary.totalIncome.toFixed(2)} ${user.favoriteCurrency}`
                                    : 'Loading...'}
                            </span>
                            <div className="db-category-summary">
                                <h3>Category Breakdown</h3>
                                {renderCategorySummary(monthlySummary, 'INCOME')}
                            </div>
                        </div>
                        <div className="db-outgoings-card" onClick={handleOutgoingsClick} style={{ cursor: 'pointer' }}>
                            <h3>Outgoings</h3>
                            <span className="db-negative">
                                {monthlySummary?.totalOutgoings !== undefined
                                    ? `${monthlySummary.totalOutgoings.toFixed(2)} ${user.favoriteCurrency}`
                                    : 'Loading...'}
                            </span>
                            <div className="db-category-summary">
                                <h3>Category Breakdown</h3>
                                {renderCategorySummary(monthlySummary, 'OUTGOING')}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="db-budget-panel db-annual">
                    <div className="db-panel-header">
                        <h2>Annual Summary</h2>
                        <div className="db-date-selector">
                            <select
                                value={selectedAnnualYear}
                                onChange={(e) => setSelectedAnnualYear(parseInt(e.target.value))}
                            >
                                {years.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="db-panel-value">
                        <span className={annualSummary?.totalBudget < 0 ? 'db-negative' : 'db-positive'}>
                            {annualSummary?.totalBudget !== undefined
                                ? `${annualSummary.totalBudget.toFixed(2)} ${user.favoriteCurrency}`
                                : 'Loading...'}
                        </span>
                    </div>
                    <div className="db-sub-cards">
                        <div className="db-income-card">
                            <h3>Income</h3>
                            <span className="db-positive">
                                {annualSummary?.totalIncome !== undefined
                                    ? `${annualSummary.totalIncome.toFixed(2)} ${user.favoriteCurrency}`
                                    : 'Loading...'}
                            </span>
                            <div className="db-category-summary">
                                <h3>Category Breakdown</h3>
                                {renderCategorySummary(annualSummary, 'INCOME')}
                            </div>
                        </div>
                        <div className="db-outgoings-card">
                            <h3>Outgoings</h3>
                            <span className="db-negative">
                                {annualSummary?.totalOutgoings !== undefined
                                    ? `${annualSummary.totalOutgoings.toFixed(2)} ${user.favoriteCurrency}`
                                    : 'Loading...'}
                            </span>
                            <div className="db-category-summary">
                                <h3>Category Breakdown</h3>
                                {renderCategorySummary(annualSummary, 'OUTGOING')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;