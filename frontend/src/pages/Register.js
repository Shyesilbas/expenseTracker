// src/components/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import '../styles/Auth.css';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [passwordErrors, setPasswordErrors] = useState([]);
    const [showRequirements, setShowRequirements] = useState(false);
    const navigate = useNavigate();

    const passwordRequirements = {
        minLength: /.{6,}/,
        uppercase: /[A-Z]/,
        lowercase: /[a-z]/,
        number: /\d/,
        special: /[!@#$%^&*.]/,
    };

    const validatePassword = (password) => {
        const errors = [];

        if (!password) {
            errors.push("Password cannot be empty");
            return errors;
        }

        if (!passwordRequirements.minLength.test(password)) {
            errors.push("Password must be at least 6 characters long");
        }
        if (!passwordRequirements.uppercase.test(password)) {
            errors.push("Password must contain at least one uppercase letter");
        }
        if (!passwordRequirements.lowercase.test(password)) {
            errors.push("Password must contain at least one lowercase letter");
        }
        if (!passwordRequirements.number.test(password)) {
            errors.push("Password must contain at least one number");
        }
        if (!passwordRequirements.special.test(password)) {
            errors.push("Password must contain at least one special character (!@#$%^&*.)");
        }

        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'password' && showRequirements) {
            const validationErrors = validatePassword(value);
            setPasswordErrors(validationErrors);
        }
    };

    const handleFocus = () => {
        setShowRequirements(true);
        const validationErrors = validatePassword(formData.password);
        setPasswordErrors(validationErrors);
    };

    const handleBlur = () => {
        setShowRequirements(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const passwordValidation = validatePassword(formData.password);
        if (passwordValidation.length > 0) {
            setPasswordErrors(passwordValidation);
            setShowRequirements(true);
            return;
        }

        try {
            await apiService.register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-card">
                    <h2 className="login-title">Create Account</h2>
                    <p className="login-subtitle">Sign up to get started</p>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <input
                                name="username"
                                type="text"
                                required
                                className="login-input"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="input-group">
                            <input
                                name="email"
                                type="email"
                                required
                                className="login-input"
                                placeholder="Email address"
                                value={formData.email}
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
                                onFocus={handleFocus}
                                onBlur={handleBlur}
                            />
                            {showRequirements && passwordErrors.length > 0 && (
                                <ul className="password-requirements">
                                    {passwordErrors.map((err, index) => (
                                        <li key={index} className="error-text">{err}</li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {error && <div className="error-text">{error}</div>}

                        <button type="submit" className="login-button">
                            Sign Up
                            <span className="button-arrow">→</span>
                        </button>
                    </form>

                    <div className="login-footer">
                        <p>Already have an account? <a href="/login" className="signup-link">Sign in</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;