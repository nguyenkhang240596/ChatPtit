var express = require('express');
var router = express.Router();
var async = require('async');

var mongoose = require('mongoose');
var MessageSchema = require('../models/message');
var Message = mongoose.model('Message', MessageSchema);

var RoomSchema = require('../models/room');
var Room = mongoose.model('Room', RoomSchema);

router.get('/:messageId', function(req, res, next) {
	var id = req.params.messageId ? req.params.messageId.trim().toString() : '';
	if (!id) {
		return res.json({statuscode : 404,results:'Please add messageId'});
	} else {
		Message.findOne({_id : id}, function(err, data) {
			if (err || !data) {
				res.json({statuscode : 404,results:'Message was not found'});
			}
			else {
				res.json({statuscode : 200,results:data});
			}
		});
	}
});

router.get('/recenlty/:roomId', function(req, res, next) {
	Room.find({ _id : req.params.roomId })
		// .sort('createdDate')
		.populate('messsages', {
				        limit: 2
				    })
		.exec(function(err, messages){
			if (err || !messages) {
				res.json({statuscode : 404,results:'Dont have any message in room'});
			} else {
				res.json({statuscode : 200,results:messages});
			}
		})
});

router.post('/', function(req, res, next) {
	var content = req.body.content ? req.body.content.trim() : '';
	var message;
	async.series({
		checkFields : function (callback) {
			if (!content) {
				return callback('content is require');
			} else callback();
		},
		createMessage : function(callback) {
			message = new Message(req.body);
			message.save(function(err, data) {
				if (err || !data) {
					callback(err);
				}else {
					Room.findOne({ _id : req.body.room }, function(err2, room) {
						if (err2 || !room) {
							callback(err2);
						} else {
							room.messages.push(message);
							room.save();
							callback();
						}
					});
				}
			});
		}
	}, function (err, results) {
		if (err) {
			res.json({statuscode : 404,results:err});
		} else {
			res.json({statuscode : 200,results:message});
		}	
	});
	
});

module.exports = router;
