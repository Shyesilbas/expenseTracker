import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { deleteExpense, updateExpense } from '../../services/ExpenseService';
import apiService from '../../services/api';
import PieChart from '../../components/PieChart';
import '../../styles/ExpenseList.css';
import _ from 'lodash';
import { DateUtils } from '../../utils/DateUtils';
import Filters from '../../pages/expenseList/Filters';
import BudgetSummary from '../../pages/expenseList/BudgetSummary';
import ExpenseTable from '../../pages/expenseList/ExpenseTable';
import { showConfirmation, showError, showSuccess } from "../../utils/SweetAlertUtils";

function ExpenseList() {
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
            const { year, month } = filters;

            // Fetch monthly summary instead of separate calls
            const monthlySummary = await apiService.getMonthlySummary(year, month);
            const expenseData = await apiService.getExpensesByFilters(
                Object.fromEntries(
                    Object.entries(filters).map(([key, value]) => [key, value || undefined])
                )
            );

            setFinancialData({
                monthlyBudget: monthlySummary?.totalBudget ?? 0.00,
                totalIncome: monthlySummary?.totalIncome ?? 0.00,
                totalSpent: monthlySummary?.totalOutgoings ?? 0.00,
            });
            setExpenses(expenseData || []);
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

    const handleDeleteExpense = async (expenseId) => {
        const confirmed = await showConfirmation({
            title: 'Are you sure?',
            text: 'Do you really want to delete this expense?',
            confirmButtonText: 'Yes, delete it!',
        });

        if (!confirmed) return;

        try {
            await deleteExpense(expenseId);
            showSuccess({ text: 'Expense deleted successfully!' });
            fetchData();
        } catch (error) {
            showError({ text: error.message });
        }
    };

    const handleUpdateExpense = async (expenseId) => {
        const confirmed = await showConfirmation({
            title: 'Update Expense',
            text: 'Are you sure you want to update this expense?',
            confirmButtonText: 'Yes, update it!',
        });

        if (!confirmed) return;

        try {
            await updateExpense(expenseId, editForm);
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
                    status: location.state?.status || '', // Preserve status from navigation
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

            <ExpenseTable
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

export default ExpenseList;