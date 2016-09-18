var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var async = require('async');

var mongoose = require('mongoose');

var RoomSchema = require('./models/room');
var Room = mongoose.model('Room', RoomSchema);

var MessageSchema = require('./models/message');
var Message = mongoose.model('Message', MessageSchema);

var UserSchema = require('./models/user');
var User = mongoose.model('User', UserSchema);

io.sockets.on('connection',function (socket)
{
	socket.on('client-send-message',function (roomId, email, content, image)
	{
		Room.findOne({ _id : roomId }, function(err, room) {
			if (err || !room) {
				io.to(roomTitle).emit("server-send-message", 
					{ statuscode : 404 , results : 'Room were not found'});
			} else {
				var mes = new Message();
				mes.content = content;
				mes.owner = email;
				mes.image = image;
				mes.save(function(err) {
					if (err) {
						io.to(roomTitle).emit("server-send-message",
							{ statuscode : 404 , results : 'Room were not found'});
					} else {
						io.to(roomTitle).emit("server-send-message",
							{ statuscode : 200 , results : mes});
					}
				});
			}
		});
	});
});