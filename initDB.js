const sqlite = require('./db.js');
const db = sqlite.getNewDB('./data/??.sqlite3');
sqlite.init(db);
