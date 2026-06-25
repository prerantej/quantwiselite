const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const dbPath = path.join(__dirname, '../../db.json');
const adapter = new FileSync(dbPath);
const db = low(adapter);

const defaultUsers = [
  { id: 'u1', name: 'Amit' },
  { id: 'u2', name: 'Rahul' },
  { id: 'u3', name: 'Sneha' }
];

// Seed default schema and users if db is empty
db.defaults({ users: defaultUsers, expenses: [] }).write();

module.exports = db;
