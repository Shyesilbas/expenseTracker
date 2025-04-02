import apiService from './api';

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

export async function updateTransaction(transactionId, data, isRecurring) {
    try {
        const endpoint = isRecurring
            ? `/api/expenses/update/recurring/${transactionId}`
            : `/api/expenses/update/one-time/${transactionId}`;

        const response = await apiService.api.put(endpoint, data);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};