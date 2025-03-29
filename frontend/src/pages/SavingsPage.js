import { useEffect, useState } from "react";
import ApiService from "../services/api";
import '../styles/SavingsPage.css';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const currencies = ["USD", "EUR", "TL", "GBP", "GOLD", "SILVER"];

export default function SavingsPage() {
    const [savings, setSavings] = useState([]);
    const [amounts, setAmounts] = useState({});
    const [updateAmounts, setUpdateAmounts] = useState({}); // For updating existing savings

    useEffect(() => {
        fetchSavings();
    }, []);

    async function fetchSavings() {
        try {
            const data = await ApiService.getMySavings();
            console.log("Fetched savings:", data);
            setSavings(data);
        } catch (error) {
            console.error("Error fetching savings:", error);
        }
    }

    async function handleAddSaving(currency) {
        if (!amounts[currency]) return;

        try {
            await ApiService.addSaving({ amount: amounts[currency], currency });
            setAmounts(prev => ({ ...prev, [currency]: "" }));
            fetchSavings();
        } catch (error) {
            console.error("Error adding saving:", error);
        }
    }

    async function handleDeleteSaving(id) {
        if (!id || isNaN(id)) {
            console.error("Invalid ID:", id);
            return;
        }
        try {
            await ApiService.deleteSaving(id);
            fetchSavings();
        } catch (error) {
            console.error("Error deleting saving:", error);
        }
    }

    async function handleUpdateSaving(id) {
        if (!updateAmounts[id]) return;

        try {
            await ApiService.updateSaving({ id, amount: updateAmounts[id] });
            setUpdateAmounts(prev => ({ ...prev, [id]: "" }));
            fetchSavings();
        } catch (error) {
            console.error("Error updating saving:", error);
        }
    }

    const pieData = {
        labels: currencies,
        datasets: [{
            data: currencies.map(currency =>
                savings.filter(s => s.currency === currency)
                    .reduce((sum, s) => sum + parseFloat(s.amount), 0)
            ),
            backgroundColor: [
                '#60a5fa', // USD
                '#34d399', // EUR
                '#f87171', // TL
                '#a78bfa', // GBP
                '#facc15', // GOLD
                '#d1d5db'  // SILVER
            ],
            borderWidth: 2,
            borderColor: '#ffffff',
        }]
    };

    const pieOptions = {
        plugins: {
            legend: { position: 'bottom', labels: { font: { size: 14, family: 'Inter' } } },
            tooltip: { backgroundColor: '#1e293b', titleFont: { size: 14 }, bodyFont: { size: 12 } }
        },
        maintainAspectRatio: false,
    };

    return (
        <div className="savings-container">
            <h2 className="savings-title">My Savings</h2>
            <div className="savings-chart">
                <Pie data={pieData} options={pieOptions} height={300} />
            </div>
            <div className="savings-grid">
                {currencies.map((currency) => (
                    <div key={currency} className={`savings-panel currency-${currency.toLowerCase()}`}>
                        <div className="panel-header">
                            <h3>{currency} Savings</h3>
                            <span className="panel-subtitle">
                                Total: {savings.filter(s => s.currency === currency)
                                .reduce((sum, s) => sum + parseFloat(s.amount), 0)} {currency}
                            </span>
                        </div>
                        <ul className="savings-list">
                            {savings
                                .filter(saving => saving.currency === currency && saving.id)
                                .map((saving) => (
                                    <li key={saving.id}>
                                        <span className="saving-amount">{saving.amount} {saving.currency}</span>
                                        <div className="savings-actions">
                                            <input
                                                type="number"
                                                placeholder="New Amount"
                                                value={updateAmounts[saving.id] || ""}
                                                onChange={(e) => setUpdateAmounts(prev => ({
                                                    ...prev,
                                                    [saving.id]: e.target.value
                                                }))}
                                                className="update-input"
                                            />
                                            <button onClick={() => handleUpdateSaving(saving.id)}>Update</button>
                                            <button onClick={() => handleDeleteSaving(saving.id)}>Delete</button>
                                        </div>
                                    </li>
                                ))}
                        </ul>
                        <div className="savings-form">
                            <input
                                type="number"
                                placeholder="Amount"
                                value={amounts[currency] || ""}
                                onChange={(e) => setAmounts(prev => ({ ...prev, [currency]: e.target.value }))}
                            />
                            <button onClick={() => handleAddSaving(currency)}>Add</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}