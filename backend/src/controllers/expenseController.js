const userRepository = require('../repositories/userRepository');
const expenseRepository = require('../repositories/expenseRepository');
const settlementService = require('../services/settlementService');

exports.getUsers = async (req, res, next) => {
  try {
    const users = userRepository.getAll();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const expenses = expenseRepository.getAll();
    res.json(expenses);
  } catch (err) {
    next(err);
  }
};

exports.createExpense = async (req, res, next) => {
  try {
    const { description, amount, payerId, isSettlement, splits } = req.body;

    // Calculate share amounts for each participant based on percentage splits
    const calculatedSplits = settlementService.calculateShares(Number(amount), splits);

    // Save in repository
    const createdExpense = expenseRepository.create({
      description: description.trim(),
      amount: Number(amount),
      payerId,
      isSettlement,
      splits: calculatedSplits
    });

    res.status(201).json({
      message: `${isSettlement ? 'Settlement' : 'Expense'} created successfully`,
      expense: createdExpense
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedExpense = expenseRepository.delete(id);
    if (!deletedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({
      message: 'Expense deleted successfully',
      expense: deletedExpense
    });
  } catch (err) {
    next(err);
  }
};
