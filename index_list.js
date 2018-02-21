const twitter = require('twitter');
const sqlite = require('./db.js');
const tweetConfig = require( './settings/twitter.json' );
const lists = require( './settings/list.json' );

var client = new twitter(tweetConfig);
var listIndex = -1;

// TweetをDBに格納
function insertTweet(db, data){

  var sql = '';
  sql += 'INSERT OR IGNORE ';
  sql += 'INTO tweet( ';
  sql += '        id_str, ';
  sql += '        user_id, ';
  sql += '        text, ';
  sql += '        read_flg ';
  sql += ') VALUES ( ';
  sql += '        $id_str, ';
  sql += '        $user_id, ';
  sql += '        $text, ';
  sql += '        $read_flg ';
  sql += ') ';

  sqlite.exeSQL(db, sql, data);
}

// ユーザーをDBに格納
function insertTweeter(db, data){

  var sql = '';
  sql += 'INSERT OR IGNORE ';
  sql += 'INTO tweeter( ';
  sql += '        user_id, ';
  sql += '        screen_name, ';
  sql += '        profile_image_url_https ';
  sql += ') VALUES ( ';
  sql += '        $user_id, ';
  sql += '        $screen_name, ';
  sql += '        $profile_image_url_https ';
  sql += ') ';

  sqlite.exeSQL(db, sql, data);
}

// 最後の取得したツイートのIDを取得
function getLastStatusId(db, list_id, callback){
  db.serialize(function () {
    db.all('SELECT id_str FROM tweet ORDER BY id_str DESC LIMIT 1;', 
           [], 
           function (err, rows) {
             if (err)
	       throw err;
	     
	     if(rows.length === 1)
	       callback(db, list_id, rows[0]['id_str']);
	     else
	       callback(db, list_id);
	     
	   });
  });
}

var indexTweet = function (db, list_id, lastStatusId) {

  var data = {
    list_id: list_id,
    count: parseInt(201)
  };
  
  if(typeof lastStatusId !== 'undefined')
    data['since_id'] = lastStatusId;

  client.get(
    'lists/statuses',
    data,
    function(err, data, response) {
      
      console.log('num of tweets : ' + data.length);
      
      // 古いツイートから先に処理
      for(var i = data.length - 1; i >= 0 ; i--){

	var user = data[i]['user'];
	var user_id = user['id'];
	var screen_name = user['screen_name'];
	var name = user['name'];
	var profile_image_url_https = user['profile_image_url_https'];
	var id_str = data[i]['id_str'];
	var text = data[i]['text'];
	
	var tweetData =   {
      	  $id_str: id_str,
      	  $user_id: user_id,
      	  $text: text,
      	  $read_flg: 0
	};
	insertTweet(db, tweetData);
	
	var userData =   {
      	  $user_id: user_id,
      	  $screen_name: screen_name,
      	  $profile_image_url_https: profile_image_url_https
	};
	insertTweeter(db, userData);

      }

      // 未取得のツイートが0件になるまで収集
      if(typeof data.length !== 'undefined' && data.length >= 200)
      	getLastStatusId(indexTweet);
      else
      	next(); // 次のリストのツイートを収集
      
    }
  );
}

function next(){
  listIndex++;

  if(listIndex >= lists['list'].length)
    return;
  var list = lists['list'][listIndex];

  console.log(list['name']);
  db = sqlite.getNewDB('./data/' + list['name'] + '.sqlite3')
  getLastStatusId(db, list['id'], indexTweet);

}

next();

