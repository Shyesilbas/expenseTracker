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

    async getExpenseById(expenseId) {
        try {
            const response = await this.api.get(`/api/expenses/${expenseId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getMonthlySummary(year, month) {
        try {
            const response = await this.api.get(`/api/expenses/monthly-summary/${year}/${month}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getAnnualSummary(year) {
        try {
            const response = await this.api.get(`/api/expenses/annual-summary/${year}`);
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

    async getExpensesByFilters({ year, month, category, status, currency, date }) {
        try {
            const params = {};
            if (year) params.year = year;
            if (month) params.month = month;
            if (category) params.category = category;
            if (status) params.status = status;
            if (currency) params.currency = currency;
            if (date) params.date = date;

            const response = await this.api.get('/api/expenses/filter', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async addSaving(data) {
        try {
            const response = await this.api.post('/api/savings/addSaving', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async deleteSaving(id) {
        try {
            const response = await this.api.delete(`/api/savings/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async updateSaving(data) {
        try {
            const response = await this.api.put('/api/savings/update', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async deleteExpense(expenseId) {
        try {
            const response = await this.api.delete(`/api/expenses/delete/${expenseId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async updateExpense(expenseId, data) {
        try {
            const response = await this.api.put(`/api/expenses/update/${expenseId}`, data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getMySavings() {
        try {
            const response = await this.api.get('/api/savings/mySavings');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async convertCurrency(from, to, amount) {
        try {
            const response = await this.api.get('/api/currency/convert', {
                params: { from, to, amount }
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async setFavCurrency(currency) {
        try {
            const response = await this.api.post('/api/settings/setFavCurrency', { currency });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

export default new ApiService();