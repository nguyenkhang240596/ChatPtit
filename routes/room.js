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
	res.json({statuscode : 200,results:req.room});
});

router.post('/', function(req, res, next) {
	var owner = req.body.owner ? req.body.owner.trim() : '';
	var name = req.body.name ? req.body.name : [];
	var room;
	async.series({
		checkFields : function (callback) {
			if (!owner) {
				return callback('owner is require');
			} else if (!name) {
				return callback('name is require');
			} else callback();
		},
		checkUser : function (callback) {
			User.findOne({ _id : owner }, function(err, user) {
				if (err || !user){
					return res.json({statuscode : 404,results : 'User were not found'});
				} else {
					callback();
				}	
			});
		},
		checkUniqRoom : function (callback) {
			Room.findOne({ owner : owner}, function(err, room) {
				if (err || room){
					return res.json({statuscode : 404,results : 'User can only create one room'});
				} else {
					callback();
				}	
			});
		},
		createObject : function(callback) {
			room = new Room(req.body);
			room.save(function(err, data) {
				if (err || !data) {
					callback({statuscode : 404,results:err});
				}else {
					callback();
				}
			});
		}
	}, function (err, results) {
		if (err) {
			res.json({statuscode : 404,results:err});
		} else {
			res.json({statuscode : 200,results:room});
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
			return res.json({statuscode : 404,results : ''});
		} else {
			return res.json({statuscode : 200,results : users});
		}
	});
	
});

router.get('/', function(req, res, next) {
	Room.find({}, function (err, rooms) {
		if (err || !rooms){
			return res.json({statuscode : 404,results : 'Total room is zero'});
		} else {
			return res.json({statuscode : 200,results : rooms});
		}
	});
});


router.param('roomId', function (req, res, next) {
	var id = req.params.roomId;
	Room.findOne({
		_id : id
	}, function (err, room) {
		if (err || !room){
			return res.json({statuscode : 404,results : 'Room was not found'});
		} else {
			req.room = room;
			next();
		}
	});
});

module.exports = router;
