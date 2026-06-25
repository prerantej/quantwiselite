exports.getUsers = async (req, res, next) => {
  try {
    res.json({ message: 'getUsers placeholder' });
  } catch (err) {
    next(err);
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    res.json({ message: 'getExpenses placeholder' });
  } catch (err) {
    next(err);
  }
};

exports.createExpense = async (req, res, next) => {
  try {
    res.json({ message: 'createExpense placeholder' });
  } catch (err) {
    next(err);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    res.json({ message: 'deleteExpense placeholder' });
  } catch (err) {
    next(err);
  }
};
