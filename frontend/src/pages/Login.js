import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/Auth.css';

function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiService.login(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Login failed');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title">Welcome Back</h2>
                    <p className="login-subtitle">Sign in to continue your journey</p>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <input
                                name="username"
                                type="name"
                                required
                                className="login-input"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <input
                                name="password"
                                type="password"
                                required
                                className="login-input"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>

                        {error && <div className="error-text">{error}</div>}

                        <button type="submit" className="login-button">
                            Sign In
                            <span className="button-arrow">→</span>
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Don't have an account? <a href="/Register" className="signup-link">Sign up</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;