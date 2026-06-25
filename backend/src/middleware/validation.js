const userRepository = require('../repositories/userRepository');

exports.validateExpense = (req, res, next) => {
  const { description, amount, payerId, isSettlement, splits } = req.body;

  // 1. Validate description
  if (!description || typeof description !== 'string' || description.trim() === '') {
    return res.status(400).json({ error: 'Description must be a non-empty string' });
  }

  // 2. Validate amount
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number greater than 0' });
  }

  // 3. Validate payerId
  if (!payerId || typeof payerId !== 'string') {
    return res.status(400).json({ error: 'Payer ID must be a non-empty string' });
  }

  const payer = userRepository.getById(payerId);
  if (!payer) {
    return res.status(400).json({ error: `Payer with ID "${payerId}" does not exist` });
  }

  // 4. Validate isSettlement
  if (isSettlement === undefined || typeof isSettlement !== 'boolean') {
    return res.status(400).json({ error: 'isSettlement must be a boolean' });
  }

  // 5. Validate splits array
  if (!Array.isArray(splits) || splits.length === 0) {
    return res.status(400).json({ error: 'Splits must be a non-empty array' });
  }

  // Check for duplicate user IDs in splits
  const splitUserIds = splits.map(s => s.userId);
  const uniqueUserIds = new Set(splitUserIds);
  if (splitUserIds.length !== uniqueUserIds.size) {
    return res.status(400).json({ error: 'Splits cannot contain duplicate participants' });
  }

  // Validate split participant existences and percentage values
  let totalPercentage = 0;
  for (const split of splits) {
    if (!split.userId || typeof split.userId !== 'string') {
      return res.status(400).json({ error: 'Each split must contain a valid userId string' });
    }

    const participant = userRepository.getById(split.userId);
    if (!participant) {
      return res.status(400).json({ error: `Participant with ID "${split.userId}" does not exist` });
    }

    const percentage = Number(split.percentage);
    if (isNaN(percentage) || percentage < 0) {
      return res.status(400).json({ error: 'Percentages cannot be negative or invalid numbers' });
    }

    totalPercentage += percentage;
  }

  // Round total percentage to 2 decimal places to protect from floating point sum errors
  totalPercentage = Math.round(totalPercentage * 100) / 100;

  if (isSettlement) {
    // A settlement must be between exactly one sender and one recipient
    if (splits.length !== 1) {
      return res.status(400).json({ error: 'A settlement must contain exactly one recipient split' });
    }

    const recipientId = splits[0].userId;
    if (recipientId === payerId) {
      return res.status(400).json({ error: 'Sender and receiver of a settlement cannot be the same person' });
    }

    if (totalPercentage !== 100) {
      return res.status(400).json({ error: 'Settlement percentage split must equal exactly 100%' });
    }
  } else {
    // Normal expense must distribute 100% of the cost across members
    // Verify sum of percentages is exactly 100%
    if (Math.abs(totalPercentage - 100) > 0.001) {
      return res.status(400).json({ error: `Total percentage must equal exactly 100% (currently ${totalPercentage}%)` });
    }

    // Verify splits array contains all users
    const allUsers = userRepository.getAll();
    if (splits.length !== allUsers.length) {
      return res.status(400).json({ error: `Splits must list all ${allUsers.length} group participants` });
    }
  }

  next();
};
