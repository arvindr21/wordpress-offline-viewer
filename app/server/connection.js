var db = require('diskdb');
db = db.connect(__dirname + '/db', ['posts', 'meta']);

module.exports = db;
