const twitter = require('twitter');
const tweetConfig = require( './settings/twitter.json' );

var client = new twitter(tweetConfig);

// ユーザー名指定でリストの一覧を取得
client.get(
  'lists/list',
  {
    screen_name: 'shota_15166'
  }, 
  function(err, data, response) {
    for(var i = 0; i < data.length; i++){
      console.log(data[i]['id_str'] + ' - ' + data[i]['name']);
    }
    // console.log(data);
  }
);
