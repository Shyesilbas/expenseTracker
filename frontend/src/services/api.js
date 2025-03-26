// src/services/api.js
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
            const response = await this.api.get('/user/me');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

export default new ApiService();