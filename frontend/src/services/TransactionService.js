import apiService from './api';
import { DateUtils } from '../utils/DateUtils';

export const deleteTransaction = async (transactionId) => {
    if (!transactionId || isNaN(transactionId)) {
        throw new Error('Invalid expense ID');
    }
    try {
        await apiService.deleteTransaction(transactionId);
    } catch (error) {
        console.error('Error deleting expense:', error);
        throw new Error('Failed to delete expense. Please try again.');
    }
};

export const updateTransaction = async (transactionId, updateData) => {
    const formattedData = Object.fromEntries(
        Object.entries({
            id: transactionId,
            amount: updateData.amount ? Number(updateData.amount) : undefined,
            currency: updateData.currency,
            status: updateData.status,
            description: updateData.description,
            category: updateData.category,
            date: updateData.date ? DateUtils.formatDate(updateData.date) : undefined,
        }).filter(([_, value]) => value !== undefined && value !== '')
    );

    try {
        await apiService.updateTransaction(transactionId, formattedData);
    } catch (error) {
        console.error('Error updating expense:', error);
        throw new Error('Failed to update expense. Please try again.');
    }
};