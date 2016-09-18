var express = require('express');
var app = express();
var server = require('http').createServer(app);

var async = require('async');

var mongoose = require('mongoose');

var RoomSchema = require('./models/room');
var Room = mongoose.model('Room', RoomSchema);

var MessageSchema = require('./models/message');
var Message = mongoose.model('Message', MessageSchema);

var UserSchema = require('./models/user');
var User = mongoose.model('User', UserSchema);


function connectIO(server) {
	var io = require('socket.io')(server);
	io.sockets.on('connection',function (socket)
	{
		console.log('new connection');
		socket.on('client-join-room',function (userId, roomId)
		{
			Room.findOne({ _id : roomId }, function(err, room) {
				if (err || !room) {
					socket.emit("server-join-room", 
						{ statuscode : 404 , results : 'Room were not found'});
				} else {
					User.findOne({ _id : userId }, function(err, user) {
						if (err || !user){
							socket.emit("server-join-room", 
							{ statuscode : 404 , results : 'User were not found'});
						} else {
							room.members.push(userId);
							room.save(function(err) {
								if (err) {
									socket.emit("server-join-room", 
									{ statuscode : 404 , results : 'User were not found'});
								} else {
									socket.join(roomId);
									user.room = roomId;
									user.save();
									socket.emit("server-join-room", 
									{ statuscode : 200 , results : 'Join room successfully'});
								}
							});
						}	
					});
				}
			});
		});

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
							io.to(roomId).emit("server-send-message",
								{ statuscode : 404 , results : 'Room were not found'});
						} else {
							io.to(roomId).emit("server-send-message",
								{ statuscode : 200 , results : mes});
						}
					});
				}
			});
		});

		socket.on('client-leave-room',function (userId, roomId)
		{
			Room.findOne({ _id : roomId }, function(err, room) {
				if (err || !room) {
					socket.emit("server-leave-room", 
						{ statuscode : 404 , results : 'Room were not found'});
				} else {
					User.findOne({ _id : userId, room : roomId }, function(err, user) {
						if (err || !user){
							socket.emit("server-leave-room", 
							{ statuscode : 404 , results : 'User were not found'});
						} else {
							room.members.remove(room.members.indexOf(userId));
							room.save(function(err) {
								if (err) {
									socket.emit("server-leave-room", 
									{ statuscode : 404 , results : 'Error 404'});
								} else {
									socket.leave(roomId);
									user.room = '';
									user.save();
									socket.emit("server-leave-room", 
									{ statuscode : 200 , results : 'Leave room successfully'});
								}
							});
						}	
					});
				}
			});
		});



	});
}

exports.connectIO = connectIO;