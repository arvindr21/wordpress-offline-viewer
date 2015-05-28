var db = require('./connection.js');

module.exports = function searcher(q, cb) {

	//NO search API for disk DB :(
	var posts = db.posts.find();
	var results = [];

	for (var i = 0; i < posts.length; i++) {

		var p = posts[i];

		if (p.title.indexOf(q) >= 0 || p.content.indexOf(q) >= 0) {
			results.push(p);
		}

	};

	cb(results);
}
