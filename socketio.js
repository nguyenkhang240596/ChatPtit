var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var async = require('async');

var mongoose = require('mongoose');

var RoomSchema = require('../models/room');
var Room = mongoose.model('Room', RoomSchema);

var MessageSchema = require('../models/message');
var Message = mongoose.model('Message', MessageSchema);

var User = mongoose.model('User', UserSchema);
var UserSchema = require('../models/user');

io.sockets.on('connection',function (socket)
{

	socket.on('client-send-message',function (roomTitle,name,message,image)
	{
		var ndc = {name : name, message:message, image:image};
		io.to(roomTitle).emit("server-send-message",{results:ndc});
	});

	socket.on('client-join-room',function (roomId, userId)
	{
		User.findOne({ _id : userId }, function(err, user) {
			if (err) {
				return socket.emit('server-join-room', {results:});
			} else {
				Room.findOne({ _id : roomId }, function(err, room) {
					if (err) {
						return socket.emit('server-join-room', {results:''});
					} else {
						socket.join(room);
						room.members.push(userId);
						return socket.emit('server-join-room', {results:'successfully'});
					}
				});
			}
		});
		io.to(roomTitle).emit("server-send-users-join-room",{results:data});
	});

	/// join roomTitle
	// socket.on('client-join-room',function (roomTitle, username, status, image)
	// {
	// 	// console.log(usersOnline[roomTitle] + "---" + usersOnline.roomTitle);
	// 	if(usersOnline[roomTitle] > 0)
	// 	{
	// 		usersOnline[roomTitle]++; 
	// 		console.log("true");
	// 	}
	// 	else {
	// 		usersOnline[roomTitle] = 1;
	// 		console.log("false");
	// 	}
		
	// 	console.log(usersOnline[roomTitle]);
	// 	socket.join(roomTitle);
	// 	var arrInfo = [];

	// 	db.query('select * from `user`', function(err, rows) {
	// 	        	for (var i=0;i<rows.length;i++)
	// 				{
	// 					var info = {
	// 						displayName : rows[i].displayName,
	// 						status : rows[i].status,
	// 						image : rows[i].image
	// 					}
	// 					arrInfo.push(info);
	// 				}
	// 			});

	// 	var data = {
	// 		useronline : usersOnline[roomTitle],
	// 		arrInfomation : arrInfo
	// 	}

	// 	io.to(roomTitle).emit("server-send-users-join-room",{noidung:data});
	// 	return usersOnline;
	// });


	// socket.on('client-out-room',function (roomTitle, username)
	// {
	// 	if (usersOnline[roomTitle] > 0)
	// 		usersOnline[roomTitle]--;
	// 	console.log("out" + usersOnline[roomTitle]);
	// 	socket.leave(roomTitle);
	// 	var data = {
	// 		useronline : usersOnline[roomTitle],
	// 		username : username
	// 	}
	// 	io.to(roomTitle).emit("server-send-user-leave-room",{noidung:data});
	// 	return usersOnline;
	// });

	// socket.on("client-send-file",function(roomTitle, userName , file){
	// 	var data = {
	// 		username : userName,
	// 		file : file
	// 	}
	// 	io.to(roomTitle).emit("server-send-file",{noidung:data});
		
	// });
	
});