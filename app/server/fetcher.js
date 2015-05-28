var request = require('request');
var sandboxer = require('./sandboxer');
var imageSandBoxer = require('./imageSandBoxer');
var db = require('./connection');

var baseUrl = 'https://public-api.wordpress.com/rest/v1.1/sites/thejackalofjavascript.com/posts',
    page = 1,
    perPage = 20,
    length = 0,
    total, inProgress = false;

module.exports = function fetcher(isOnline, callback, skip) {
    var posts = db.posts.find();
    var total = db.meta.findOne({
        'key': 'found'
    });

    if (!total) {
        total = {
            'key': 'found',
            'total': -1
        }
        db.meta.save(total);
    }

    total = total.total;
    length = posts.length;
    if (length > 0 && !skip) {
    	// if all posts are downloaded, we will send them back
    	// with out making a call to the JSON server

    	// Feature : If you want, you can add a property to the
    	// meta collection, named `lastUpdate`
    	// > And if all the posts are downloaded, you can dispatch them
    	// as usual & then check the `lastUpdate` and if it is > 1 day or 1 week,
    	// download all the posts again to check for any updates

        if (length == total) {
        	return sendByParts(posts.splice(0, perPage));
        } else {
            sendByParts(posts.splice(0, perPage));

            if (total > length) {
                page = length / perPage + 1;
                fetcher(isOnline, callback, true);
            }
            return false;
        }

    }
    // clean up old posts
    if (page === 1) {
        db.posts.remove();
        db.loadCollections(['posts']);
    }

    // make request only if we are online!
    if (isOnline) {
        request(baseUrl + '?page=' + page,
            function(error, response, body) {
                if (!error && response.statusCode == 200) {
                    body = JSON.parse(body);
                    posts = body.posts;
                    if (posts.length > 0) {

                        // update the found count
                        db.meta.update({
                            'key': 'found'
                        }, {
                            'total': body.found
                        }, {
                            upsert: true
                        });

                        // sandbox the pages
                        sandboxer(posts, function(posts) {
                            posts = posts.reverse();
                            db.posts.save(posts);
                            posts = posts.reverse();
                            callback(posts);
                            page++;
                            fetcher(isOnline, callback, true);
                        });
                    } else {
                        page = 1;

                        // now that we have all the posts,
                        // we will start sandboxing the images
                        // this is the process of taking a image URL
                        // and converting it to base64
                        // making this app a true offline viewer!

                        imageSandBoxer(isOnline, function() {
                            // ALL Done!
                            //console.log('Sandboxing Images done!!')
                        });

                        // Videos are a bit complex, so left it out :D
                    }
                }
            });
    }

    function sendByParts(_posts) {
        if (_posts) {
            // send only 20 posts per 1 second
            setTimeout(function() {
                callback(_posts);
                return sendByParts(posts.splice(0, perPage));
            }, 1000);
        }
    }
}
