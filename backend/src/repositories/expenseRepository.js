const db = require('../config/db');

class ExpenseRepository {
  getAll() {
    return db.get('expenses').value();
  }

  getById(id) {
    return db.get('expenses').find({ id }).value();
  }

  create(expenseData) {
    // Determine prefix based on settlement status
    const prefix = expenseData.isSettlement ? 'settle' : 'exp';
    const expense = {
      id: `${prefix}_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`,
      description: expenseData.description,
      amount: Number(expenseData.amount),
      payerId: expenseData.payerId,
      isSettlement: Boolean(expenseData.isSettlement),
      splits: expenseData.splits.map(s => ({
        userId: s.userId,
        percentage: Number(s.percentage),
        amount: Number(s.amount)
      })),
      createdAt: new Date().toISOString()
    };
    db.get('expenses').push(expense).write();
    return expense;
  }

  delete(id) {
    const expense = this.getById(id);
    if (!expense) return null;
    db.get('expenses').remove({ id }).write();
    return expense;
  }
}

module.exports = new ExpenseRepository();
