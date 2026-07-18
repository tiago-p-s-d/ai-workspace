const knex = require('knex');
const knexfile = require('./knexfile');

/**
 * Singleton instance of the database connection.
 * @type {import('knex').Knex}
 */
const db = knex(knexfile.development);

/**
 * Tests the database connectivity when the application starts.
 * @returns {Promise<void>}
 */
db.raw('SELECT 1')
  .then(() => {
    console.log('--- [DB] Successfully connected to the MySQL database! ---');
  })
  .catch((err) => {
    console.error('--- [DB] Fatal error while connecting to the database: ---', err);
    process.exit(1);
  });

module.exports = db;