var db = require('./connection.js');
var cheerio = require('cheerio');

// http://stackoverflow.com/a/17133012/1015046
var request = require('request').defaults({
	encoding: null
});

var $imgs, posts, $;

module.exports = function imageSandBoxer(isOnline, callback) {
	if (!isOnline) return;

	posts = db.posts.find();
	processPost(posts.shift(), callback);
}

function processPost(post, callback) {
	if (post) {
		$ = cheerio.load(post.content);
		$imgs = $('img').toArray();
		sandBoxImage($imgs.shift(), post, callback);
	} else {
		callback();
	}
}

function sandBoxImage($img, post, callback) {
	if ($img) {
		request.get($img.attribs.src, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				data = "data:" + response.headers["content-type"] + ";base64," + new Buffer(body).toString('base64');
				$img.attribs.src = data;
				sandBoxImage($imgs.shift(), post, callback);
			}
		});

	} else {
		post.content = $.html();
		var res = db.posts.update({
			"ID": post.ID
		}, post);
		return processPost(posts.shift(), callback);
	}

}
