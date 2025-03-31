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

    const handleSwapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
        if (result !== null && amount) {
            handleConvert();
        }
    };

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

    const getCurrencySymbol = (code) => {
        const currency = currencies.find(c => c.code === code);
        return currency ? currency.symbol : '';
    };

    return (
        <div className="cc-currency-converter">
            <h2>Currency Converter</h2>

            <div className="cc-converter-card">
                <div className="cc-input-group">
                    <label>Amount</label>
                    <div className="cc-amount-wrapper">
                        <span className="cc-currency-symbol">{getCurrencySymbol(fromCurrency)}</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="cc-amount-input"
                            min="0"
                            step="0.01"
                        />
                    </div>
                </div>

                <div className="cc-currency-selectors">
                    <div className="cc-selector-group">
                        <label>From Currency</label>
                        <select
                            value={fromCurrency}
                            onChange={(e) => setFromCurrency(e.target.value)}
                            className="cc-currency-select"
                        >
                            {currencies.map(currency => (
                                <option key={`from-${currency.code}`} value={currency.code}>
                                    {currency.code} - {currency.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button onClick={handleSwapCurrencies} className="cc-swap-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 16V4M7 4L3 8M7 4L11 8" />
                            <path d="M17 8v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                    </button>

                    <div className="cc-selector-group">
                        <label>To Currency</label>
                        <select
                            value={toCurrency}
                            onChange={(e) => setToCurrency(e.target.value)}
                            className="cc-currency-select"
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
                    className={`cc-convert-btn ${loading ? 'cc-loading' : ''}`}
                    disabled={loading}
                >
                    {loading ? 'Converting...' : 'Convert'}
                </button>

                {result !== null && (
                    <div className="cc-result">
                        <div className="cc-result-amount">
                            <span className="cc-initial-amount">
                                {parseFloat(amount).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {fromCurrency}
                            </span>
                            <span className="cc-equals">=</span>
                            <span className="cc-converted-amount">
                                {result.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurrency}
                            </span>
                        </div>
                        <div className="cc-exchange-rate">
                            <span>1 {fromCurrency} = {(result / parseFloat(amount)).toFixed(4)} {toCurrency}</span>
                            {lastUpdated && (
                                <span className="cc-last-updated">Last updated: {formatDate(lastUpdated)}</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CurrencyConversion;