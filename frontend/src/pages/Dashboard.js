import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [monthlyBudget, setMonthlyBudget] = useState(null);

    useEffect(() => {
        let mounted = true;

        const fetchData = async () => {
            try {
                const userData = await apiService.getUserInfo();
                const budgetData = await apiService.getMonthlyBudget();

                if (mounted) {
                    setUser(userData);
                    setMonthlyBudget(budgetData);
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

    if (!user) return <div className="dashboard-loading">Loading...</div>;

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Welcome, {user.username}</h1>
            <div className="budget-card">
                <h2>Monthly Budget Status</h2>
                <p className={monthlyBudget < 0 ? 'negative' : 'positive'}>
                    {monthlyBudget !== null ? `${monthlyBudget} USD` : 'Loading...'}
                </p>
            </div>
        </div>
    );
}

export default Dashboard;
