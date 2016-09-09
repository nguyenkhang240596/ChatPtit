var mongoose = require('mongoose');
var RoomSchema = require('../models/room');
var Room = mongoose.model('room', RoomSchema);
var async = require('async');


Room.get = function(req, res, next) {
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

Room.create = function(req, nes, next) {
	var room = new Room(req.body);
	room.save(function(err, data) {
		if (err || !data) {
			res.json(err);
		}else {
			res.json(data);
		}
	});
}

module.exports = Room;