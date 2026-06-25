const db = require('../config/db');

class UserRepository {
  getAll() {
    return db.get('users').value();
  }

  getById(id) {
    return db.get('users').find({ id }).value();
  }
}

module.exports = new UserRepository();
