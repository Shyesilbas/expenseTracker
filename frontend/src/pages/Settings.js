import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { CURRENCIES } from '../constants/constants';
import { showSuccess, showError } from '../utils/SweetAlertUtils';
import '../styles/Settings.css';

function Settings() {
    const [favoriteCurrency, setFavoriteCurrency] = useState('');

    useEffect(() => {
        async function fetchFavoriteCurrency() {
            try {
                const userInfo = await apiService.getUserInfo();
                setFavoriteCurrency(userInfo.favoriteCurrency || '');
            } catch (err) {
                console.error('Error fetching favorite currency:', err);
            }
        }
        fetchFavoriteCurrency();
    }, []);

    const handleSave = async () => {
        try {
            await apiService.setFavCurrency(favoriteCurrency); // Sends { "currency": "USD" }
            showSuccess({ text: 'Favorite currency updated successfully!' });
        } catch (err) {
            showError({ text: 'Failed to update favorite currency!' });
        }
    };

    return (
        <div className="settings-container">
            <h2>Settings</h2>
            <div className="settings-group">
                <label>Favorite Currency</label>
                <select
                    value={favoriteCurrency}
                    onChange={(e) => setFavoriteCurrency(e.target.value)}
                >
                    {CURRENCIES.map((currency) => (
                        <option key={currency} value={currency}>
                            {currency}
                        </option>
                    ))}
                </select>
                <button onClick={handleSave} className="save-btn">Save</button>
            </div>
        </div>
    );
}

export default Settings;