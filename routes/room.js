var express = require('express');
var router = express.Router();
var async = require('async');

var mongoose = require('mongoose');

var RoomSchema = require('../models/room');
var Room = mongoose.model('Room', RoomSchema);

var MessageSchema = require('../models/message');
var Message = mongoose.model('Message', MessageSchema);

var UserSchema = require('../models/user');
var User = mongoose.model('User', UserSchema);

// var RoomCtrl = require('../controllers/room');

router.get('/:roomId', function(req, res, next) {
	res.json({results:req.room});
});

router.post('/', function(req, res, next) {
	var owner = req.body.owner ? req.body.owner.trim() : '';
	var members = req.body.members ? req.body.members : [];
	var message = req.body.message ? req.body.message.trim() : '';
	var room;
	async.series({
		checkFields : function (callback) {
			if (!owner) {
				return callback('owner is require');
			} else if (!members) {
				return callback('members is require');
			} else if (!message) {
				return callback('message is require');
			} else callback();
		},
		checkUser : function (callback) {
			User.findOne({ _id : owner }, function(err, user) {
				if (err || !user){
					return res.json({results : 'User were not found', status : 404});
				} else {
					callback();
				}	
			});
		},
		checkMembers : function (callback) {
			async.mapSeries(members, function(u, cb) {
				User.findOne({ _id : u}, function(err, user) {
					if (err || !user){
						return res.json({results : 'User were not found', status : 404});
					} else {
						cb();
					}	
				});
			}, function(err) {
				if (err) {
					callback(err);
				} else {
					callback();
				}
			})
		},
		checkMessage : function (callback) {
			Message.findOne({ _id : message}, function(err, user) {
				if (err || !user){
					return res.json({results : 'Message were not found', status : 404});
				} else {
					callback();
				}	
			});
		},
		checkUniqRoom : function (callback) {
			Room.findOne({ owner : owner}, function(err, room) {
				if (err || room){
					return res.json({results : 'User can only create one room', status : 404});
				} else {
					callback();
				}	
			});
		},
		createMessage : function(callback) {
			room = new Room(req.body);
			room.save(function(err, data) {
				if (err || !data) {
					callback({results:err});
				}else {
					callback();
				}
			});
		}
	}, function (err, results) {
		if (err) {
			res.json({results:err});
		} else {
			res.json({results:room});
		}	
	});
	
});

router.get('/getUsersInRoom/:roomId', function(req, res, next) {
	var room = req.room;
	console.log(room);
	console.log(req.params.roomId);
	User.find({
		room : room._id
	}, function (err, users) {
		if (err || !users){
			return res.json({results : ''});
		} else {
			return res.json({results : users});
		}
	});
	
});

router.get('/', function(req, res, next) {
	Room.find({}, function (err, rooms) {
		if (err || !rooms){
			return res.json({results : 'Total room is zero'});
		} else {
			return res.json({results : rooms});
		}
	});
});


router.param('roomId', function (req, res, next) {
	var id = req.params.roomId;
	Room.findOne({
		_id : id
	}, function (err, room) {
		if (err || !room){
			return res.json({results : 'Room was not found'});
		} else {
			req.room = room;
			next();
		}
	});
});

module.exports = router;
