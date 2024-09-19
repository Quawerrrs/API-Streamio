const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  database: process.env.DB_DTB,
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
})

module.exports = {pool: pool};