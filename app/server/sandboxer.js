var cheerio = require('cheerio');
var _sandBoxedPosts = [],
	_posts = [],
	$imgs;

module.exports = function(posts, callback) {
	_sandBoxedPosts = [];
	_posts = posts;
	process(_posts.shift(), function() {
		callback(_sandBoxedPosts);
	});
}

function process(post, cb) {
	if (post) {
		var $ = cheerio.load(post.content);

		// anchor tags
		$('a').each(function(i, e) {

			// sandbox links
			e.attribs['ng-click'] = 'openExternal(\'' + e.attribs.href + '\')';

			// remove onclick functions
			// I use GA to track clicks in my blog
			delete e.attribs.onclick;
			delete e.attribs.target;
			e.attribs.href = 'javascript:';

			var c = e.children;

			if (c.length == 1) {
				// pure anchor tag

			} else {
				// clean up image tags
				if (c.length && c.length > 0 && c[0].name == 'img') {
					var i = c[0];
					i.attribs.src = i.attribs["data-lazy-src"];
					i.attribs.src = i.attribs.src.split('?resize')[0];
					delete i.attribs["data-lazy-src"];
					// remove the parent anchor link for
					// a image tag
					delete e.attribs['ng-click'];
					e.attribs['class'] = 'no-pointer';
				}
			}

		});

		// pre tags
		$('pre').each(function(i, e) {
			e.attribs.hljs = 'true';
			e.attribs['no-escape'] = 'true';
		});

		// iframes
		$('iframe').each(function(i, e) {
			var src = e.attribs.src;
			if (src.indexOf('youtube') > 0) {
				if (src.indexOf('http') != 0) {
					e.attribs.src = 'http:' + e.attribs.src;
				}
				var p = $(e).parents('p')[0];
				p.attribs['ng-class'] = '{hide : !status}';
			}
		});

		$('img').each(function(i, e) {
			e.attribs.src = e.attribs.src.split('?resize')[0];
		})

		post.content = $.html();
		_sandBoxedPosts.push(post);
		return process(_posts.shift(), cb);
	} else {
		cb();
	}
}
