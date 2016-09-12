var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var async = require('async');

io.sockets.on('connection',function (socket)
{

	socket.on('client-send-message',function (roomTitle,name,message,image)
	{
		var ndc = {name : name, message:message, image:image};
		io.to(roomTitle).emit("server-send-message",{noidung:ndc});
	});

	/// join room
	socket.on('client-join-room',function (roomTitle, username, status, image)
	{
		// console.log(usersOnline[roomTitle] + "---" + usersOnline.roomTitle);
		if(usersOnline[roomTitle] > 0)
		{
			usersOnline[roomTitle]++; 
			console.log("true");
		}
		else {
			usersOnline[roomTitle] = 1;
			console.log("false");
		}
		
		console.log(usersOnline[roomTitle]);
		socket.join(roomTitle);
		var arrInfo = [];

		db.query('select * from `user`', function(err, rows) {
		        	for (var i=0;i<rows.length;i++)
					{
						var info = {
							displayName : rows[i].displayName,
							status : rows[i].status,
							image : rows[i].image
						}
						arrInfo.push(info);
					}
				});

		var data = {
			useronline : usersOnline[roomTitle],
			arrInfomation : arrInfo
		}

		io.to(roomTitle).emit("server-send-users-join-room",{noidung:data});
		return usersOnline;
	});


	socket.on('client-out-room',function (roomTitle, username)
	{
		if (usersOnline[roomTitle] > 0)
			usersOnline[roomTitle]--;
		console.log("out" + usersOnline[roomTitle]);
		socket.leave(roomTitle);
		var data = {
			useronline : usersOnline[roomTitle],
			username : username
		}
		io.to(roomTitle).emit("server-send-user-leave-room",{noidung:data});
		return usersOnline;
	});

	
	socket.on('client-request-user-information', function(nameToFind) {
		db.query('select * from `user` where `username`="'+nameToFind+'"', function(err, done) {
	        	socket.emit('server-send-request-user-information', {noidung : done});
	        });
	});

	socket.on('client-create-room', function(userName, roomTitle,description, roomPassword, roomImage) {
		db.query('SELECT * FROM `roomchat` WHERE owner = ?', userName, function(err, rows) {
		    if (rows.length > 0) {
				socket.emit('result-create-room', {
		        	// noidung: rows
		        	noidung: {}
		     	});
		     	// console.log(rows + "1aa");
		    } else {
		     	var data = {
			        owner: userName,
			        name: roomTitle,
			        password: roomPassword,
			        description : description,
			        image : roomImage
			     };
			   	db.query('insert into `roomchat` SET ?', data, function(err, roomchat) {
				    	// db.query("select * from `roomchat`",function(rows){
						io.sockets.emit('result-create-room',{
							noidung:data
						});
					// });
				    // console.log("0");
			    });

		    }
	  	});
	});
	
	socket.on("client-send-file",function(roomTitle, userName , file){
		var data = {
			username : userName,
			file : file
		}
		io.to(roomTitle).emit("server-send-file",{noidung:data});
		
	});
	
});