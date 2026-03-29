// Backend/db.js बनाओ
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');
const adapter = new JSONFile(dbPath);
const db = new Low(adapter);

const initDb = async () => {
    await db.read();
    db.data ||= { students: [], results: {} };
    await db.write();
};

initDb();

module.exports = db;