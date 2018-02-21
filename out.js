const fs = require('fs');
const sqlite = require('./db.js');
const lists = require( './settings/list.json' );

function selectUnread(listName, db, callback){
  var sql = '';
  sql += 'SELECT ';
  sql += '    *, ';
  sql += '    CAST(id_str AS TEXT) AS id_str ';
  sql += 'FROM ';
  sql += '    tweet ';
  sql += '    INNER JOIN ';
  sql += '        tweeter ';
  sql += '    ON  tweet.user_id = tweeter.user_id ';
  sql += 'WHERE ';
  sql += '    read_flg = ? ';
  sql += 'ORDER BY ';
  sql += '    tweeter.user_id, ';
  sql += '    tweet.id_str DESC; ';

  db.serialize(function () {
    db.all(
      sql,
      [0], 
      function (err, rows) {
        if (err) throw err;
	callback(listName, rows);
      });
  });
}

var outputTweets = function (listName, rows) {
  var out = "# " + dbName + "\n";
  var lastScreenName = "";
  
  for(var i = 0; i < rows.length; i++){
    var cur = rows[i];

    var isRetweet = cur['text'].slice(0, 3) === 'RT ';
    if(isRetweet)
      continue;
    
    var isSameUser = lastScreenName === cur['screen_name'];
    if(!isSameUser){
      out += '<img src="' + cur['profile_image_url_https'] + '" width="100" height="100">' + "\n";
      out += "## ユーザ名 : " + cur['screen_name'] + " \n";
    }
    
    var tweetURL = "https://twitter.com/" + cur['screen_name'] + "/status/" + cur['id_str'];
    out += "[link](" + tweetURL + ")" + " → ";
    out += cur['text'].replace( /#/g , "♯" ) + "\n";
    out += "<hr/>\n";
    
    lastScreenName = cur['screen_name'];
  }

  fs.writeFile('./out/' + listName + '.md', out);
}


for(var i = 0; i < lists['list'].length; i++){
  var list = lists['list'][i];
  var dbName = list['name'];
  var db = sqlite.getNewDB('./data/' + dbName + '.sqlite3');
  selectUnread(
    dbName,
    db,
    outputTweets);
}

