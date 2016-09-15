var express = require('express');
var router = express.Router();
var async = require('async');

var mongoose = require('mongoose');
var MessageSchema = require('../models/message');
var Message = mongoose.model('Message', MessageSchema);

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
	Message.find({ room : roomId })
		.sort('-date')
		.limit(4)
		.exec(function(err, messages){
			if (err || !messages) {
				res.json({statuscode : 404,results:'Dont have any message in room'});
			} else {
				res.json({statuscode : 200,results:messages});
			}
		})
});

router.post('/', function(req, res, next) {
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
			res.json({statuscode : 404,results:err});
		} else {
			res.json({statuscode : 200,results:message});
		}	
	});
	
});

module.exports = router;
