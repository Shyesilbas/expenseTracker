import axios from 'axios';

class ApiService {
    constructor() {
        this.api = axios.create({
            baseURL: 'http://localhost:8080',
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true,
        });
    }

    async register(data) {
        try {
            const response = await this.api.post('/auth/register', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async login(data) {
        try {
            const response = await this.api.post('/auth/login', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async logout() {
        try {
            const response = await this.api.post('/auth/logout');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getUserInfo() {
        try {
            const response = await this.api.get('/api/user/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getMonthlyBudget() {
        try {
            const response = await this.api.get('/api/user/monthly-budget');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    // Expense APIs
    async createExpense(data) {
        try {
            const response = await this.api.post('/api/expenses/create', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getExpenses() {
        try {
            const response = await this.api.get('/api/expenses');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getMonthlyExpenses(year, month) {
        try {
            const response = await this.api.get(`/api/expenses/monthly?year=${year}&month=${month}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getYearlyExpenses(year) {
        try {
            const response = await this.api.get(`/api/expenses/yearly?year=${year}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getExpenseById(expenseId) {
        try {
            const response = await this.api.get(`/api/expenses/${expenseId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getExpensesByCategory(category) {
        try {
            const response = await this.api.get(`/api/expenses/category?category=${category}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getExpensesByStatus(status) {
        try {
            const response = await this.api.get(`/api/expenses/status?status=${status}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getExpensesByCurrency(currency) {
        try {
            const response = await this.api.get(`/api/expenses/currency?currency=${currency}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getExpensesByDate(date) {
        try {
            const response = await this.api.get(`/api/expenses/date?date=${date}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

export default new ApiService();
