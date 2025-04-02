import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { showConfirmation, showError, showSuccess } from "../../utils/SweetAlertUtils";
import apiService from '../../services/api';
import PieChart from '../../components/PieChart';
import '../../styles/ExpenseList.css';
import _ from 'lodash';
import { DateUtils } from '../../utils/DateUtils';
import Filters from './Filters';
import BudgetSummary from './BudgetSummary';
import TransactionTable from './TransactionTable';

function TransactionList() {
    const currentDate = new Date();
    const location = useLocation();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState([]);
    const [financialData, setFinancialData] = useState({
        monthlyBudget: null,
        totalIncome: 0.00,
        totalSpent: 0.00,
    });
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
        date: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { year, month, date } = filters;

            const formattedFilters = {
                ...filters,
                date: date ? DateUtils.parseDate(date, 'dd-MM-yyyy') : undefined,
            };

            const monthlySummary = await apiService.getMonthlySummary(year, month);
            const transactionData = await apiService.getExpensesByFilters({
                year, month, date: formattedFilters.date, category: filters.category,
                status: filters.status, currency: filters.currency
            });

            const formattedTransactions = transactionData.map(transaction => ({
                ...transaction,
                date: DateUtils.formatDate(transaction.date, 'dd-MM-yyyy'),
            }));

            setFinancialData({
                monthlyBudget: monthlySummary?.totalBudget ?? 0.00,
                totalIncome: monthlySummary?.totalIncome ?? 0.00,
                totalSpent: monthlySummary?.totalOutgoings ?? 0.00,
            });
            setTransactions(formattedTransactions || []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const debouncedFetchData = useCallback(_.debounce(fetchData, 300), [fetchData]);

    useEffect(() => {
        debouncedFetchData();
        return () => debouncedFetchData.cancel();
    }, [debouncedFetchData]);

    const handleDeleteTransaction = async (transactionId) => {
        const confirmed = await showConfirmation({
            title: 'Are you sure?',
            text: 'Do you really want to delete this transaction?',
            confirmButtonText: 'Yes, delete it!',
        });

        if (!confirmed) return;

        try {
            await apiService.deleteTransaction(transactionId);
            showSuccess({ text: 'Transaction deleted successfully!' });
            fetchData();
        } catch (error) {
            showError({ text: error.message });
        }
    };

    const handleUpdateTransaction = async (transaction) => {
        if (transaction.type === 'RECURRING') {
            navigate('/transactions/recurring', { state: { transactionId: transaction.id } });
            return;
        }

        const confirmed = await showConfirmation({
            title: 'Update Transaction',
            text: 'Are you sure you want to update this transaction?',
            confirmButtonText: 'Yes, update it!',
        });

        if (!confirmed) return;

        try {
            const formattedEditForm = {
                amount: editForm.amount ? parseFloat(editForm.amount) : undefined,
                currency: editForm.currency || undefined,
                status: editForm.status || undefined,
                description: editForm.description || undefined,
                category: editForm.category || undefined,
                date: editForm.date ? DateUtils.parseDate(editForm.date, 'dd-MM-yyyy') : undefined,
            };
            await apiService.updateTransaction(transaction.id, formattedEditForm, false);
            showSuccess({ text: 'Transaction updated successfully!' });
            setEditingTransactionId(null);
            setEditForm({
                amount: '',
                currency: '',
                status: '',
                description: '',
                category: '',
                date: '',
            });
            fetchData();
        } catch (error) {
            showError({ text: error.message });
        }
    };

    const handleFilterChange = useCallback((e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: value,
            ...(name === 'year' || name === 'month'
                ? {
                    category: '',
                    status: location.state?.status || '',
                    currency: '',
                    date: '',
                }
                : {}),
        }));
    }, [location.state?.status]);

    return (
        <div className="transaction-list-container">
            <h1>All Transactions - {DateUtils.getCurrentMonthYear(filters.year, filters.month)}</h1>

            <Filters
                filters={filters}
                onFilterChange={handleFilterChange}
                onRefresh={fetchData}
                loading={loading}
            />

            {error && <p className="error-message">{error}</p>}

            <BudgetSummary
                monthlyBudget={financialData.monthlyBudget}
                totalIncome={financialData.totalIncome}
                totalSpent={financialData.totalSpent}
            />

            <TransactionTable
                transactions={transactions}
                loading={loading}
                editingTransactionId={editingTransactionId}
                editForm={editForm}
                setEditForm={setEditForm}
                setEditingTransactionId={setEditingTransactionId}
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
                showUpdateButton={(transaction) => true}
            />

            <div className="chart-container-wrapper">
                <div className="chart-container">
                    <h2>Transaction Distribution by Category (Outgoing)</h2>
                    <PieChart data={transactions.filter((tx) => tx.status === 'OUTGOING')} title="Outgoing" />
                </div>
                <div className="chart-container">
                    <h2>Transaction Distribution by Category (Income)</h2>
                    <PieChart data={transactions.filter((tx) => tx.status === 'INCOME')} title="Income" />
                </div>
            </div>
        </div>
    );
}

export default TransactionList;
