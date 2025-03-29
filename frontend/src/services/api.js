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

    async getCurrentMonthlyBudget() {
        try {
            const response = await this.api.get('/api/user/monthly-budget');
            return response.data;
        } catch (error) {
            console.error('Current monthly budget fetch error:', error);
            return 0.00;
        }
    }

    async getCurrentMonthCategorySummary() {
        try {
            const response = await this.api.get('/api/expenses/current-month-category-summary');
            return response.data;
        } catch (error) {
            console.error('Current month category summary fetch error:', error);
            return {};
        }
    }

    async getCurrentYearCategorySummary() {
        try {
            const response = await this.api.get('/api/expenses/current-year-category-summary');
            return response.data;
        } catch (error) {
            console.error('Current year category summary fetch error:', error);
            return {};
        }
    }
    async getAnnualBudget() {
        try {
            const response = await this.api.get('/api/user/annual-budget');
            return response.data;
        } catch (error) {
            console.error('Current monthly budget fetch error:', error);
            return 0.00;
        }
    }

    async getAnnualIncome() {
        try {
            const response = await this.api.get('/api/user/annual-income');
            return response.data;
        } catch (error) {
            console.error('Annual income fetch error:', error);
            return 0.00;
        }
    }

    async getAnnualOutgoings() {
        try {
            const response = await this.api.get('/api/user/annual-outgoings');
            return response.data;
        } catch (error) {
            console.error('Annual outgoings fetch error:', error);
            return 0.00;
        }
    }

    async getMonthlyBudget(year, month) {
        try {
            const response = await this.api.get(`/api/user/budget/${year}/${month}`);
            return response.data;
        } catch (error) {
            console.error('Monthly budget fetch error:', error);
            return 0.00;
        }
    }

    async getCurrentMonthlyIncome() {
        try {
            const response = await this.api.get('/api/user/monthly-income');
            return response.data;
        } catch (error) {
            console.error('Current monthly income fetch error:', error);
            return 0.00;
        }
    }

    async getCurrentMonthlyOutgoings() {
        try {
            const response = await this.api.get('/api/user/monthly-outgoings');
            return response.data;
        } catch (error) {
            console.error('Current monthly outgoings fetch error:', error);
            return 0.00;
        }
    }

    async getMonthlyIncome(year, month) {
        try {
            const response = await this.api.get(`/api/user/income/${year}/${month}`);
            return response.data;
        } catch (error) {
            console.error('Monthly income fetch error:', error);
            return 0.00;
        }
    }


    async getMonthlyOutgoings(year, month) {
        try {
            const response = await this.api.get(`/api/user/outgoings/${year}/${month}`);
            return response.data;
        } catch (error) {
            console.error('Monthly outgoings fetch error:', error);
            return 0.00;
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

    async getMySavings() {
        try {
            const response = await this.api.get('/api/savings/mySavings');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async getSavingsByCurrency(currency) {
        try {
            const response = await this.api.get(`/api/savings/byCurrency?currency=${currency}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

export default new ApiService();