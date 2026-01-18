// setup.js
const openDb = require('./db');

async function setup() {
  const db = await openDb();

  await db.exec('DROP TABLE IF EXISTS Task_Definitions');
  await db.exec('DROP TABLE IF EXISTS Monitors');
  await db.exec('DROP TABLE IF EXISTS Family_Profiles');
  await db.exec('DROP TABLE IF EXISTS Elderly_Profiles');
  await db.exec('DROP TABLE IF EXISTS Users');

  await db.exec(`
    CREATE TABLE Users (
      user_id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('elderly', 'family')) NOT NULL
    );

    CREATE TABLE Family_Profiles (
      user_id INTEGER PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE Elderly_Profiles (
      user_id INTEGER PRIMARY KEY,
      first_name TEXT,
      last_name TEXT,
      FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
    );

    CREATE TABLE Monitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      family_id INTEGER NOT NULL,
      elder_id INTEGER NOT NULL,
      status TEXT DEFAULT 'Pending' CHECK(status IN ('Pending', 'Accepted', 'Rejected')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (family_id) REFERENCES Family_Profiles(user_id),
      FOREIGN KEY (elder_id) REFERENCES Elderly_Profiles(user_id),
      UNIQUE(family_id, elder_id)
    );

    CREATE TABLE Task_Definitions (
      task_id INTEGER PRIMARY KEY AUTOINCREMENT,
      creator_family_id INTEGER,
      assigned_elder_id INTEGER,
      title TEXT,
      status TEXT DEFAULT 'Pending',
      scheduled_time TEXT,
      completed_at DATETIME,
      FOREIGN KEY (creator_family_id) REFERENCES Family_Profiles(user_id),
      FOREIGN KEY (assigned_elder_id) REFERENCES Elderly_Profiles(user_id)
    );
  `);

  // SADECE KULLANICILARI OLUŞTURUYORUZ - BAĞLANTI YOK
  const familyResult = await db.run(
    `INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)`,
    ['parent@test.com', '123456', 'family']
  );
  await db.run(`INSERT INTO Family_Profiles (user_id, first_name, last_name) VALUES (?, ?, ?)`, [familyResult.lastID, 'Ahmet', 'Baba']);

  const elderResult = await db.run(
    `INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)`,
    ['elder@test.com', '123456', 'elderly']
  );
  await db.run(`INSERT INTO Elderly_Profiles (user_id, first_name, last_name) VALUES (?, ?, ?)`, [elderResult.lastID, 'Mehmet', 'Dede']);

  console.log('✅ Veritabanı sıfırlandı. Kullanıcılar ayrık olarak oluşturuldu.');
}

setup().catch(err => console.error(err));