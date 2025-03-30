import React from 'react';
import { CATEGORIES, STATUSES, CURRENCIES } from '../../constants/constants';

function Filters({ filters, onFilterChange, onRefresh, loading }) {
    const renderSelect = (name, value, options, label = '') => (
        <select
            name={name}
            value={value}
            onChange={onFilterChange}
            className="modern-select"
        >
            {options.map(option => (
                <option key={option} value={option}>
                    {option || `All ${label || name.charAt(0).toUpperCase() + name.slice(1)}s`}
                </option>
            ))}
        </select>
    );

    return (
        <div className="filters">
            <select
                name="year"
                value={filters.year}
                onChange={onFilterChange}
                className="modern-select"
            >
                {[...Array(101).keys()].map(i => {
                    const yearOption = 2020 + i;
                    return <option key={yearOption} value={yearOption}>{yearOption}</option>;
                })}
            </select>

            <select
                name="month"
                value={filters.month}
                onChange={onFilterChange}
                className="modern-select"
            >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>
                        {new Date(0, m - 1).toLocaleString('en', { month: 'long' })}
                    </option>
                ))}
            </select>

            {renderSelect('category', filters.category, CATEGORIES)}
            {renderSelect('status', filters.status, STATUSES)}
            {renderSelect('currency', filters.currency, CURRENCIES)}

            <input
                type="date"
                name="date"
                value={filters.date}
                onChange={onFilterChange}
                className="modern-select"
            />

            <button
                onClick={onRefresh}
                className="fetch-btn"
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Refresh'}
            </button>
        </div>
    );
}

export default Filters;