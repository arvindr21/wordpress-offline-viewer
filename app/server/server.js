var getport = require('./getport');
var fetcher = require('./fetcher');
var searcher = require('./searcher');

module.exports = function(callback) {
	// get an unused port!
	getport(function(port) {

		var io = require('socket.io')(port);

		io.sockets.on('connection', function(socket) {

			socket.on('load', function(isOnline) {
				fetcher(isOnline, function(posts) {
					socket.emit('loaded', posts);
				});
			});

			socket.on('search', function(q) {
				searcher(q, function(results) {
					socket.emit('results', results);
				});
			});

		});

		callback(port);
	});
}
