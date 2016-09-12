var mongoose = require('mongoose');
var RoomSchema = require('../models/room');
var Room = mongoose.model('room', RoomSchema);
var async = require('async');


Room.Get = function(req, res, next) {
	var id = req.params.roomId ? req.params.roomId.toString() : '';
	Room.find({_id : id}, function(err, data) {
		if (err || !data) {
			res.json(err);
		}
		else {
			res.json(data);
		}
	});
}

Room.Create = function(req, nes, next) {
	var owner = req.body.owner ? req.body.owner.trim() : '';
	var room = req.body.room ? req.body.room.trim() : '';
	var content = req.body.content ? req.body.content.trim() : '';
	var room;
	async.series({
		checkFields : function (callback) {
			if (!owner) {
				return callback('owner is require');
			} else if (!room) {
				return callback('room is require');
			} else if (!content) {
				return callback('content is require');
			} else callback();
		},
		createMessage : function(callback) {
			room = new Room(req.body);
			room.save(function(err, data) {
				if (err || !data) {
					callback(err);
				}else {
					callback(data);
				}
			});
		}
	}, function (err, results) {
		if (err) {
			res.json({results:err});
		} else {
			res.json({results:room.toJSON()});
		}	
	});

	
}


Room.GetUsersInRoom = function (req, res, next) {
	var id = req.params.roomId;
	User.find({
		room : roomId
	}, function (err, users) {
		if (err || users.length === 0){
			return res.json({results : 'users were not found'});
		} else {
			return res.json({results:users});
		}
	});
}

module.exports = Room;