var mongoose = require('mongoose');
var MessageSchema = require('../models/message');
var Message = mongoose.model('message', MessageSchema);
var async = require('async');


Message.Get = function(req, res, next) {
	var id = req.params.messageId ? req.params.messageId.trim().toString() : '';
	if (!id) {
		return res.json({results:'Please add messageId'});
	} else {
		Message.findOne({_id : id}, function(err, data) {
			if (err || !data) {
				res.json({results:'Message was not found'});
			}
			else {
				res.json({results:data});
			}
		});
	}
}

Message.Create = function(req, res, next) {
	var owner = req.body.owner ? req.body.owner.trim() : '';
	var room = req.body.room ? req.body.room.trim() : '';
	var content = req.body.content ? req.body.content.trim() : '';
	var message;
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
			message = new Message(req.body);
			message.save(function(err, data) {
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
			res.json({results:message.toJSON()});
		}	
	});
	
}

module.exports = Message;