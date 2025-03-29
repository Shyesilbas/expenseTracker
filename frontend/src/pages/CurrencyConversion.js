import React, { useState } from 'react';
import apiService from '../services/api';
import '../styles/CurrencyConversion.css';

function CurrencyConversion() {
    const [amount, setAmount] = useState('');
    const [fromCurrency, setFromCurrency] = useState('USD');
    const [toCurrency, setToCurrency] = useState('TRY');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const currencies = [
        { code: 'USD', name: 'US Dollar', symbol: '$' },
        { code: 'EUR', name: 'Euro', symbol: '€' },
        { code: 'GBP', name: 'British Pound', symbol: '£' },
        { code: 'TRY', name: 'Turkish Lira', symbol: '₺' }
    ];

    // Swap currencies
    const handleSwapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
        // If there's a result, recalculate
        if (result !== null && amount) {
            handleConvert();
        }
    };

    // Format the date for last updated
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const handleConvert = async () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) {
            alert('Please enter a valid positive amount');
            return;
        }

        setLoading(true);

        try {
            const convertedValue = await apiService.convertCurrency(fromCurrency, toCurrency, value);

            setResult(convertedValue);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Conversion error:', error);
            alert('Failed to convert currency. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Find currency symbol
    const getCurrencySymbol = (code) => {
        const currency = currencies.find(c => c.code === code);
        return currency ? currency.symbol : '';
    };

    return (
        <div className="currency-converter">
            <h2>Currency Converter</h2>

            <div className="converter-card">
                <div className="input-group">
                    <label>Amount</label>
                    <div className="amount-wrapper">
                        <span className="currency-symbol">{getCurrencySymbol(fromCurrency)}</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="amount-input"
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="currency-selectors">
                    <div className="selector-group">
                        <label>From Currency</label>
                        <select
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                            className="currency-select"
                        >
                            {currencies.map(currency => (
                                <option key={`from-${currency.code}`} value={currency.code}>
                                    {currency.code} - {currency.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button onClick={handleSwapCurrencies} className="swap-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                            <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                    </button>

                    <div className="selector-group">
                        <label>To Currency</label>
                        <select
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value)}
                            className="currency-select"
                        >
                            {currencies.map(currency => (
                                <option key={`to-${currency.code}`} value={currency.code}>
                                    {currency.code} - {currency.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleConvert}
                    className={`convert-btn ${loading ? 'loading' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Converting...' : 'Convert'}
                </button>

                {result !== null && (
                    <div className="result">
                        <div className="result-amount">
                            <span className="initial-amount">
                                {parseFloat(amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {fromCurrency}
                            </span>
                            <span className="equals">=</span>
                            <span className="converted-amount">
                                {result.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
                            </span>
                        </div>
                        <div className="exchange-rate">
                            <span>1 {fromCurrency} = {(result / parseFloat(amount)).toFixed(4)} {toCurrency}</span>
                            {lastUpdated && (
                                <span className="last-updated">Last updated: {formatDate(lastUpdated)}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CurrencyConversion;
