import apiService from './api';
import { DateUtils } from '../utils/DateUtils';

export const deleteExpense = async (expenseId) => {
    if (!expenseId || isNaN(expenseId)) {
        throw new Error('Invalid expense ID');
    }
    try {
        await apiService.deleteExpense(expenseId);
    } catch (error) {
        console.error('Error deleting expense:', error);
        throw new Error('Failed to delete expense. Please try again.');
    }
};

export const updateExpense = async (expenseId, updateData) => {
    const formattedData = Object.fromEntries(
        Object.entries({
            id: expenseId,
            amount: updateData.amount ? Number(updateData.amount) : undefined,
            currency: updateData.currency,
            status: updateData.status,
            description: updateData.description,
            category: updateData.category,
            date: updateData.date ? DateUtils.formatDate(updateData.date) : undefined,
        }).filter(([_, value]) => value !== undefined && value !== '')
    );

    try {
        await apiService.updateExpense(expenseId, formattedData);
    } catch (error) {
        console.error('Error updating expense:', error);
        throw new Error('Failed to update expense. Please try again.');
    }
};