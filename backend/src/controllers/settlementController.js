const settlementService = require('../services/settlementService');

exports.getSettlement = async (req, res, next) => {
  try {
    const { balances } = settlementService.calculateBalances();
    const transactions = settlementService.getMinimizedSettlements();
    res.json({
      balances,
      transactions
    });
  } catch (err) {
    next(err);
  }
};
