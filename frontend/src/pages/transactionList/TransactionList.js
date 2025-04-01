import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { deleteTransaction, updateTransaction } from '../../services/TransactionService';
import apiService from '../../services/api';
import PieChart from '../../components/PieChart';
import '../../styles/ExpenseList.css';
import _ from 'lodash';
import { DateUtils } from '../../utils/DateUtils';
import Filters from './Filters';
import BudgetSummary from './BudgetSummary';
import TransactionTable from './TransactionTable';
import { showConfirmation, showError, showSuccess } from "../../utils/SweetAlertUtils";

function TransactionList() {
    const currentDate = new Date();
    const location = useLocation();
    const [expenses, setExpenses] = useState([]);
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
    const [editingExpenseId, setEditingExpenseId] = useState(null);
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
            const expenseData = await apiService.getExpensesByFilters(
                Object.fromEntries(
                    Object.entries(formattedFilters).map(([key, value]) => [key, value || undefined])
                )
            );

            const formattedExpenses = expenseData.map(expense => ({
                ...expense,
                date: DateUtils.formatDate(expense.date, 'dd-MM-yyyy'),
            }));

            setFinancialData({
                monthlyBudget: monthlySummary?.totalBudget ?? 0.00,
                totalIncome: monthlySummary?.totalIncome ?? 0.00,
                totalSpent: monthlySummary?.totalOutgoings ?? 0.00,
            });
            setExpenses(formattedExpenses || []);
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

    const handleDeleteExpense = async (transactionId) => {
        const confirmed = await showConfirmation({
            title: 'Are you sure?',
            text: 'Do you really want to delete this expense?',
            confirmButtonText: 'Yes, delete it!',
        });

        if (!confirmed) return;

        try {
            await deleteTransaction(transactionId);
            showSuccess({ text: 'Expense deleted successfully!' });
            fetchData();
        } catch (error) {
            showError({ text: error.message });
        }
    };

    const handleUpdateExpense = async (transactionId) => {
        const confirmed = await showConfirmation({
            title: 'Update Expense',
            text: 'Are you sure you want to update this expense?',
            confirmButtonText: 'Yes, update it!',
        });

        if (!confirmed) return;

        try {
            const formattedEditForm = {
                ...editForm,
                date: editForm.date ? DateUtils.parseDate(editForm.date, 'dd-MM-yyyy') : undefined, // Backend'e uygun format
            };
            await updateTransaction(transactionId, formattedEditForm);
            showSuccess({ text: 'Expense updated successfully!' });
            setEditingExpenseId(null);
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
        <div className="expense-list-container">
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
                expenses={expenses}
                loading={loading}
                editingExpenseId={editingExpenseId}
                editForm={editForm}
                setEditForm={setEditForm}
                setEditingExpenseId={setEditingExpenseId}
                onUpdateExpense={handleUpdateExpense}
                onDeleteExpense={handleDeleteExpense}
            />

            <div className="chart-container-wrapper">
                <div className="chart-container">
                    <h2>Expense Distribution by Category</h2>
                    <PieChart data={expenses.filter((exp) => exp.status === 'OUTGOING')} title="Expenses" />
                </div>
                <div className="chart-container">
                    <h2>Income Distribution by Category</h2>
                    <PieChart data={expenses.filter((exp) => exp.status === 'INCOME')} title="Income" />
                </div>
            </div>
        </div>
    );
}

export default TransactionList;