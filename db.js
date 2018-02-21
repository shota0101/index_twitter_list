var sqlite3 = require('sqlite3');

module.exports.getNewDB = function (file) {
  return new sqlite3.Database(file);
};

module.exports.init = function (db) {
  initTable(db);
};

module.exports.exeSQL = function (db, sql, data) {
  db.serialize(function () {
    db.run(
      sql,
      data
    );
  });
};

function createTable(db, tableName, createSQL){

  db.serialize(function () {
    var create = new Promise(function (resolve, reject) {
      db.get(
	'SELECT COUNT(*) FROM sqlite_master WHERE TYPE="table" AND NAME=$name',
	{
	  $name: tableName
	},
	function (err, res) {
	  var exists = false;
	  if (0 < res['count(*)'])
	    exists = true;
	  resolve(exists);
	});
    });
    
    create.then(function (exists) {
      if (!exists) {
	console.log(createSQL);
	db.run(createSQL);
      }
    });
  });
  
}

function initTable(db){

  var createTweetTabelSQL = 'CREATE TABLE tweet( ';
  createTweetTabelSQL += 'id_str INTEGER PRIMARY KEY, ';
  createTweetTabelSQL += 'user_id INTEGER NOT NULL, ';
  createTweetTabelSQL += 'text TEXT NOT NULL, ';
  createTweetTabelSQL += 'read_flg INTEGER NOT NULL ';
  createTweetTabelSQL += '); ';
  createTable(db, 'tweet', createTweetTabelSQL);
  
  var createUserTabelSQL = 'CREATE TABLE tweeter( ';
  createUserTabelSQL += 'user_id INTEGER PRIMARY KEY, ';
  createUserTabelSQL += 'screen_name TEXT NOT NULL, ';
  createUserTabelSQL += 'profile_image_url_https TEXT NOT NULL ';
  createUserTabelSQL += '); ';
  createTable(db, 'tweeter', createUserTabelSQL);

}
