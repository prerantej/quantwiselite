import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

export const getUsers = () => API.get('/users');
export const getExpenses = () => API.get('/expenses');
export const createExpense = (expenseData) => API.post('/expenses', expenseData);
export const deleteExpense = (id) => API.delete(`/expenses/${id}`);
export const getSettlement = () => API.get('/settlement');

export default API;
