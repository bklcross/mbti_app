const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');

const dataDir = path.join(__dirname, 'data');

function getDbPath() {
  return process.env.SQLITE_DB_PATH || path.join(dataDir, 'sociable_growth_coach.sqlite');
}

function openDb() {
  fs.mkdirSync(dataDir, { recursive: true });
  return new DatabaseSync(getDbPath());
}

function run(db, sql, params = []) {
  const result = db.prepare(sql).run(...params);

  return {
    id: Number(result.lastInsertRowid),
    changes: result.changes
  };
}

function get(db, sql, params = []) {
  return db.prepare(sql).get(...params);
}

function all(db, sql, params = []) {
  return db.prepare(sql).all(...params);
}

function exec(db, sql) {
  db.exec(sql);
}

function close(db) {
  db.close();
}

module.exports = {
  all,
  close,
  exec,
  getDbPath,
  get,
  openDb,
  run
};
