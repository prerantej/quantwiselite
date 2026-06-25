import { useState, useEffect, useCallback } from 'react';
import { getUsers, getExpenses, createExpense, deleteExpense, getSettlement } from '../services/api';

export default function useLedger() {
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLedgerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, expensesRes, settlementRes] = await Promise.all([
        getUsers(),
        getExpenses(),
        getSettlement()
      ]);

      setUsers(usersRes.data);
      // Sort expenses by newest first
      setExpenses(expensesRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setBalances(settlementRes.data.balances);
      setTransactions(settlementRes.data.transactions);
    } catch (err) {
      console.error('Error fetching ledger data:', err);
      setError(err.response?.data?.error || 'Failed to fetch ledger details');
    } finally {
      setLoading(false);
    }
  }, []);

  const addExpense = useCallback(async (expenseData) => {
    setError(null);
    try {
      await createExpense(expenseData);
      await fetchLedgerData();
      return { success: true };
    } catch (err) {
      console.error('Error adding expense:', err);
      const errMsg = err.response?.data?.error || 'Failed to add expense';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  }, [fetchLedgerData]);

  const removeExpense = useCallback(async (id) => {
    setError(null);
    try {
      await deleteExpense(id);
      await fetchLedgerData();
      return { success: true };
    } catch (err) {
      console.error('Error deleting expense:', err);
      const errMsg = err.response?.data?.error || 'Failed to delete expense';
      setError(errMsg);
      return { success: false, error: errMsg };
    }
  }, [fetchLedgerData]);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  return {
    users,
    expenses,
    balances,
    transactions,
    loading,
    error,
    refetch: fetchLedgerData,
    addExpense,
    removeExpense
  };
}
