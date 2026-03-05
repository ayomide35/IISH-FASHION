const fs = require('node:fs');
require('dotenv').config();

const output = [
  'DB_HOST: ' + process.env.DB_HOST,
  'DB_PORT: ' + process.env.DB_PORT,
  'DB_NAME: ' + process.env.DB_NAME,
  'DB_USER: ' + process.env.DB_USER
];

const db = require('./src/config/database');

db.executeQuery('SELECT DATABASE() as db_name')
  .then((results) => {
    output.push('Current database: ' + results[0].db_name);

    return db.executeQuery('SELECT COUNT(*) as total FROM products WHERE is_active = 1');
  })
  .then((products) => {
    output.push('Products count: ' + products[0].total);
    fs.writeFileSync('test-output.txt', output.join('\n'));
    process.exit(0);
  })
  .catch((err) => {
    output.push('Error: ' + err.message);
    fs.writeFileSync('test-output.txt', output.join('\n'));
    process.exit(1);
  });
