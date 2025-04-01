import './App.css';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import TransactionList from './pages/transactionList/TransactionList';
import SavingsPage from './pages/SavingsPage';
import RecurringTransactions from './pages/RecurringTransactions';
import CurrencyConversion from './pages/CurrencyConversion';
import TransactionForm from './pages/TransactionForm';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import React, { useState, useEffect } from 'react';
import apiService from './services/api';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await apiService.getUserInfo();
                setIsAuthenticated(true);
            } catch (err) {
                setIsAuthenticated(false);
                if (location.pathname !== '/login' && location.pathname !== '/register') {
                    navigate('/login');
                }
            }
        };
        checkAuth();
    }, [navigate, location.pathname]);

    const handleLogout = async () => {
        try {
            await apiService.logout();
            setIsAuthenticated(false);
            navigate('/login');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const showSidebar = isAuthenticated && location.pathname !== '/login' && location.pathname !== '/register';

    return (
        <div className="app-container">
            <button
                className="app-toggle-button"
                onClick={toggleSidebar}
                style={{ left: isSidebarOpen && showSidebar ? '260px' : '10px' }}
            >
                {isSidebarOpen ? '×' : '☰'}
            </button>

            {showSidebar && <Sidebar onLogout={handleLogout} isOpen={isSidebarOpen} />}
            <div className={`content-container ${isSidebarOpen && showSidebar ? 'shifted' : ''}`}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/savings" element={<SavingsPage />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/transactions" element={<TransactionList />} />
                    <Route path="/transactions/recurring" element={<RecurringTransactions />} />
                    <Route path="/currency/convert" element={<CurrencyConversion />} />
                    <Route path="/transactions/add" element={<TransactionForm />} />
                </Routes>
            </div>
        </div>
    );
}

export default function AppWithRouter() {
    return (
        <Router>
            <App />
        </Router>
    );
}