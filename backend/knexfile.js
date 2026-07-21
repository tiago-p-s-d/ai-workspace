require('dotenv').config({ path: '../.env' });
module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.NODE_ENV === 'docker' ? 'db' : process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: './migrations'
    }
  }
};