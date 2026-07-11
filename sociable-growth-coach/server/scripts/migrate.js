const fs = require('fs');
const path = require('path');
const { close, exec, getDbPath, openDb } = require('../db');

async function migrate() {
  const db = openDb();
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const migrationFiles = fs.readdirSync(migrationsDir).sort();

  try {
    for (const file of migrationFiles) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      await exec(db, sql);
      console.log(`Applied migration: ${file}`);
    }

    console.log(`Database ready: ${getDbPath()}`);
  } finally {
    await close(db);
  }
}

migrate().catch((error) => {
  console.error(error);
  process.exit(1);
});
