import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { showConfirmation, showError, showSuccess } from '../../utils/SweetAlertUtils';
import apiService from '../../services/api';
import PieChart from '../../components/PieChart';
import '../../styles/ExpenseList.css';
import { DateUtils } from '../../utils/DateUtils';
import Filters from './Filters';
import BudgetSummary from './BudgetSummary';
import TransactionTable from './TransactionTable';

function TransactionList() {
    console.log("TransactionList component initialized.");
    const currentDate = new Date();
    const location = useLocation();
    const navigate = useNavigate();

    const [transactions, setTransactions] = useState([]);
    const [financialData, setFinancialData] = useState({ monthlyBudget: 0.00, totalIncome: 0.00, totalSpent: 0.00 });
    const [filters, setFilters] = useState({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1,
        category: '',
        status: location.state?.status || '',
        currency: '',
        date: '',
    });

    const [editingTransactionId, setEditingTransactionId] = useState(null);
    const [editForm, setEditForm] = useState({
        amount: '',
        currency: '',
        status: '',
        description: '',
        category: '',
        date: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        console.log("Fetching transaction data with filters:", filters);
        setLoading(true);
        setError(null);
        try {
            const formattedFilters = {
                ...filters,
                date: filters.date ? DateUtils.parseDate(filters.date, 'dd-MM-yyyy') : undefined,
            };

            const [monthlySummary, transactionData] = await Promise.all([
                apiService.getMonthlySummary(filters.year, filters.month),
                apiService.getExpensesByFilters(formattedFilters),
            ]);

            console.log("Fetched monthly summary:", monthlySummary);
            console.log("Fetched transactions:", transactionData);

            setFinancialData({
                monthlyBudget: monthlySummary?.totalBudget ?? 0.00,
                totalIncome: monthlySummary?.totalIncome ?? 0.00,
                totalSpent: monthlySummary?.totalOutgoings ?? 0.00,
            });
            setTransactions(transactionData.map(tx => ({
                ...tx,
                date: DateUtils.formatDate(tx.date, 'dd-MM-yyyy')
            })));
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        console.log("Executing fetchData on mount and filter change.");
        fetchData();
    }, [fetchData]);

    const handleDeleteTransaction = async (transactionId) => {
        console.log("Attempting to delete transaction with ID:", transactionId);
        const confirmed = await showConfirmation({
            title: 'Are you sure?',
            text: 'Do you really want to delete this transaction?',
            confirmButtonText: 'Yes, delete it!',
            confirmButtonColor: '#d33'
        });
        if (!confirmed) {
            console.log("Transaction deletion cancelled.");
            return;
        }
        try {
            await apiService.deleteTransaction(transactionId);
            showSuccess({ text: 'Transaction deleted successfully!' });
            console.log("Transaction deleted successfully.");
            fetchData();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showError({ text: `Error: ${error.response?.data?.message || error.message}` });
        }
    };

    const handleUpdateTransaction = async (transaction) => {
        console.log("Updating transaction with ID:", transaction.transactionId);
        if (!editForm.amount || parseFloat(editForm.amount) <= 0) {
            showError({ text: 'Amount must be a positive number.' });
            return;
        }

        try {
            const payload = {
                amount: parseFloat(editForm.amount),
                currency: editForm.currency,
                description: editForm.description,
                status: editForm.status,
                category: editForm.category,
                date: editForm.date
            };
            console.log('Updating transaction with payload:', payload);

            await apiService.updateOneTimeTransaction(transaction.transactionId, payload);
            showSuccess({ text: 'Transaction updated successfully!' });
            console.log("Transaction update successful.");
            fetchData();
        } catch (error) {
            console.error('Error updating transaction:', error);
            showError({ text: `Error: ${error.response?.data?.message || error.message}` });
        }
    };

    return (
        <div className="transaction-list-container">
            <h1>All Transactions - {DateUtils.getCurrentMonthYear(filters.year, filters.month)}</h1>
            <Filters filters={filters} onFilterChange={setFilters} onRefresh={fetchData} loading={loading} />
            {error && <p className="error-message">{error}</p>}
            <BudgetSummary {...financialData} />
            <TransactionTable
                transactions={transactions}
                loading={loading}
                editingTransactionId={editingTransactionId}
                editForm={editForm}
                setEditForm={setEditForm}
                setEditingTransactionId={setEditingTransactionId}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
            />
            <div className="chart-container-wrapper">
                <div className="chart-container">
                    <h2>Transaction Distribution by Category (Outgoing)</h2>
                    <PieChart data={transactions.filter(tx => tx.status === 'OUTGOING')} title="Outgoing" />
                </div>
                <div className="chart-container">
                    <h2>Transaction Distribution by Category (Income)</h2>
                    <PieChart data={transactions.filter(tx => tx.status === 'INCOME')} title="Income" />
                </div>
            </div>
        </div>
    );
}

export default TransactionList;
