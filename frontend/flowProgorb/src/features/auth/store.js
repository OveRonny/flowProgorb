import {
    defineStore
} from 'pinia'
import { login, register } from './api'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        email: null,
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null
    }), 
    actions: {
       async login(credentials) {
            this.loading = true
            this.error = null
            try {
                const data = await login(credentials)
                this.user = data.user
                this.token = data.token
                this.email = data.email
                localStorage.setItem('token', data.token)
            } catch (err) {
                this.error = err.response?.data?.message || err.response?.data?.error || 'Login failed'
            } finally {
                this.loading = false
            }
        },

        async register(userData) {
            this.loading = true
            this.error = null
            try {
                const data = await register(userData)
                this.user = data.user
                this.token = data.token
                this.email = data.user.email
                localStorage.setItem('token', data.token)
            } catch (err) {
                this.error = err.response?.data?.message || err.response?.data?.error || 'Registration failed'
            } finally {
                this.loading = false
            }
        },             

        logout() {
            this.user = null
            this.token = null
            localStorage.removeItem('token')
        }
    }
});