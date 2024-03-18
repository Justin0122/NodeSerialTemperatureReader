require('dotenv').config();
const knex = require('knex');

const db = knex({
  client: 'mysql',
  connection: {
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS
  }
});

db.raw(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'temperatures'}`)
    .then(() => console.log('Database created'))
    .catch((err) => console.log('Error creating database: ', err))
    .finally(() => db.destroy());