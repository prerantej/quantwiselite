const userRepository = require('../repositories/userRepository');
const expenseRepository = require('../repositories/expenseRepository');

class SettlementService {
  /**
   * Calculates precise share amounts for splits with penny adjustment.
   * @param {number} totalAmount 
   * @param {Array} splits [{ userId, percentage }]
   * @returns {Array} [{ userId, percentage, amount }]
   */
  calculateShares(totalAmount, splits) {
    if (!splits || splits.length === 0) return [];
    
    let sumShares = 0;
    const calculatedSplits = [];
    
    for (let i = 0; i < splits.length - 1; i++) {
      const percentage = Number(splits[i].percentage);
      const shareAmount = Math.round((totalAmount * percentage) / 100 * 100) / 100;
      calculatedSplits.push({
        userId: splits[i].userId,
        percentage: percentage,
        amount: shareAmount
      });
      sumShares += shareAmount;
    }
    
    // Last user gets the remainder to absorb penny rounding differences
    const lastSplit = splits[splits.length - 1];
    const lastPercentage = Number(lastSplit.percentage);
    const lastShareAmount = Math.round((totalAmount - sumShares) * 100) / 100;
    calculatedSplits.push({
      userId: lastSplit.userId,
      percentage: lastPercentage,
      amount: lastShareAmount
    });
    
    return calculatedSplits;
  }

  /**
   * Calculates net balances for all users.
   * @returns {Object} { balances: [{ userId, userName, netBalance }], rawBalances: { userId: number } }
   */
  calculateBalances() {
    const users = userRepository.getAll();
    const expenses = expenseRepository.getAll();
    
    // Initialize balance map
    const balanceMap = {};
    users.forEach(u => {
      balanceMap[u.id] = 0;
    });
    
    // Process each transaction (expense/settlement)
    expenses.forEach(exp => {
      const payerId = exp.payerId;
      const amount = Number(exp.amount);
      
      // Credit the payer
      if (balanceMap[payerId] !== undefined) {
        balanceMap[payerId] += amount;
      }
      
      // Debit the participants
      exp.splits.forEach(s => {
        if (balanceMap[s.userId] !== undefined) {
          balanceMap[s.userId] -= Number(s.amount);
        }
      });
    });
    
    // Round balances to 2 decimal places to prevent floating-point inaccuracies
    const balancesList = users.map(u => {
      const net = Math.round(balanceMap[u.id] * 100) / 100;
      return {
        userId: u.id,
        userName: u.name,
        netBalance: net
      };
    });
    
    return {
      balances: balancesList,
      rawBalances: balanceMap
    };
  }

  /**
   * Computes simplified settlement transactions to minimize overall debt.
   * @returns {Array} [{ from: string, to: string, amount: number }]
   */
  getMinimizedSettlements() {
    const { balances } = this.calculateBalances();
    
    // Separate into debtors (net balance < 0) and creditors (net balance > 0)
    let debtors = balances
      .filter(u => u.netBalance < -0.005)
      .map(u => ({ id: u.userId, name: u.userName, balance: Math.abs(u.netBalance) }));
      
    let creditors = balances
      .filter(u => u.netBalance > 0.005)
      .map(u => ({ id: u.userId, name: u.userName, balance: u.netBalance }));
      
    // Sort descending by balance to resolve largest debts first
    debtors.sort((a, b) => b.balance - a.balance);
    creditors.sort((a, b) => b.balance - a.balance);
    
    const transactions = [];
    
    while (debtors.length > 0 && creditors.length > 0) {
      const debtor = debtors[0];
      const creditor = creditors[0];
      
      const settledAmount = Math.round(Math.min(debtor.balance, creditor.balance) * 100) / 100;
      
      if (settledAmount >= 0.01) {
        transactions.push({
          from: debtor.name,
          to: creditor.name,
          amount: settledAmount
        });
      }
      
      debtor.balance -= settledAmount;
      creditor.balance -= settledAmount;
      
      // Shift lists if balances are fully settled
      if (debtor.balance < 0.005) {
        debtors.shift();
      } else {
        // Re-sort debtors to keep descending order
        debtors.sort((a, b) => b.balance - a.balance);
      }
      
      if (creditor.balance < 0.005) {
        creditors.shift();
      } else {
        // Re-sort creditors to keep descending order
        creditors.sort((a, b) => b.balance - a.balance);
      }
    }
    
    return transactions;
  }
}

module.exports = new SettlementService();
