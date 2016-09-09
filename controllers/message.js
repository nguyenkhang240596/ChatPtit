var mongoose = require('mongoose');
var MessageSchema = require('../models/message');
var Message = mongoose.model('message', MessageSchema);
var async = require('async');


Message.get = function(req, res, next) {
	var id = req.params.messageId ? req.params.messageId.toString() : '';
	Message.find({_id : id}, function(err, data) {
		if (err || !data) {
			res.json(err);
		}
		else {
			res.json(data);
		}
	});
}

Message.create = function(req, nes, next) {
	var message = new Message(req.body);
	message.save(function(err, data) {
		if (err || !data) {
			res.json(err);
		}else {
			res.json(data);
		}
	});
}

module.exports = Message;