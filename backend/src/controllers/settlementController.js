exports.getSettlement = async (req, res, next) => {
  try {
    res.json({ message: 'getSettlement placeholder' });
  } catch (err) {
    next(err);
  }
};
