import React, { useState } from 'react';
import apiService from '../services/api';
import '../styles/CurrencyConversion.css';

function CurrencyConversion() {
    const [amount, setAmount] = useState('');
    const [conversionType, setConversionType] = useState('usd-to-try');
    const [result, setResult] = useState(null);

    const handleConvert = async () => {
        const value = parseFloat(amount);
        if (isNaN(value) || value <= 0) {
            alert('Please enter a valid positive amount');
            return;
        }

        try {
            let convertedValue;
            switch (conversionType) {
                case 'usd-to-try':
                    convertedValue = await apiService.convertUsdToTry(value);
                    break;
                case 'usd-to-eur':
                    convertedValue = await apiService.convertUsdToEur(value);
                    break;
                case 'eur-to-try':
                    convertedValue = await apiService.convertEurToTry(value);
                    break;
                case 'eur-to-usd':
                    convertedValue = await apiService.convertEurToUsd(value);
                    break;
                case 'try-to-usd':
                    convertedValue = await apiService.convertTryToUsd(value);
                    break;
                case 'try-to-eur':
                    convertedValue = await apiService.convertTryToEur(value);
                    break;
                default:
                    return;
            }
            setResult(convertedValue);
        } catch (error) {
            console.error('Conversion error:', error);
            alert('Failed to convert currency. Please try again.');
        }
    };

    return (
        <div className="currency-converter">
            <h2>Currency Converter</h2>
            <div className="converter-form">
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="amount-input"
                    min="0"
                    step="0.01"
                />
                <select
                    value={conversionType}
                    onChange={(e) => setConversionType(e.target.value)}
                    className="conversion-select"
                >
                    <option value="usd-to-try">USD to TRY</option>
                    <option value="usd-to-eur">USD to EUR</option>
                    <option value="eur-to-try">EUR to TRY</option>
                    <option value="eur-to-usd">EUR to USD</option>
                    <option value="try-to-usd">TRY to USD</option>
                    <option value="try-to-eur">TRY to EUR</option>
                </select>
                <button onClick={handleConvert} className="convert-btn">Convert</button>
            </div>
            {result !== null && (
                <div className="result">
                    <p>
                        {amount} {conversionType.split('-to-')[0].toUpperCase()} ={' '}
                        {result.toFixed(2)} {conversionType.split('-to-')[1].toUpperCase()}
                    </p>
                </div>
            )}
        </div>
    );
}

export default CurrencyConversion;