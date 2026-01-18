// db.js
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function openDb() {
  return open({
    filename: './dailyaid.db', // Veritabanı dosyamızın adı bu olacak
    driver: sqlite3.Database
  });
}

module.exports = openDb;