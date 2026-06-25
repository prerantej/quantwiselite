const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const settlementController = require('../controllers/settlementController');
const { validateExpense } = require('../middleware/validation');

// Users
router.get('/users', expenseController.getUsers);

// Expenses
router.get('/expenses', expenseController.getExpenses);
router.post('/expenses', validateExpense, expenseController.createExpense);
router.delete('/expenses/:id', expenseController.deleteExpense);

// Settlement
router.get('/settlement', settlementController.getSettlement);

module.exports = router;
