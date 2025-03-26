// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import apiService from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        let mounted = true;

        const fetchUser = async () => {
            try {
                const userData = await apiService.getUserInfo();
                if (mounted) setUser(userData);
            } catch (err) {
                console.error('Failed to fetch user:', err);
            }
        };
        fetchUser();

        return () => {
            mounted = false;
        };
    }, []);

    if (!user) return <div className="dashboard-loading">Loading...</div>;

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-title">Welcome, {user.username}</h1>
        </div>
    );
}

export default Dashboard;