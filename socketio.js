var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var async = require('async');

io.sockets.on('connection',function (socket)
{

	console.log("Co nguoi connect ne");
	
	socket.on('client-send-information', function(userName, passWord, birthday,gender , Email, Phone, Image) {

	    var ketqua = true;
	    var check = 2;
	    var data = {
	      username: userName,
	      password: passWord,
	      email: Email,
	      phone: Phone,
	      image: Image,
	      birthday : birthday,
	      gender : gender
	    };

	    // console.log('data',data);

	    async.waterfall([
	      function(callback) {
	        db.query('select * from `user` where `username`="'+data.username+'"', function(err, done) {
	        	// console.log('result:',done);
	          callback(null, done);
	        })
	      },
	      function(rows, callback) {
	        if (rows === 0) {
	          db.query('INSERT INTO user SET ?', data,
	            function(err, res) {
	              if (res) {
	              	check = 0;
	              	callback(null, true);
	              }
	              //console.log("ERROR : " + err);
	              //console.log("Result : " + res);
	            });
	        } else {
	        	check = 1;
	        	callback(null, false);
	        }
	      }
	    ], function(err, result) {
	    	// 0 là thành công , 1 là tên user đã tồn tại , 2 là lỗi gì đó
	      socket.emit('result-register', {
	        noidung: check
	      });

	    });
	});
	

	socket.on('client-send-message',function (roomTitle,name,message,image)
	{
		var ndc = {name : name, message:message, image:image};
		io.to(roomTitle).emit("server-send-message",{noidung:ndc});
	});



	socket.on('client-send-login',function (userName,passWord)
	{
			var kt = 1;
			var user = null;
			// console.log("user " + username + "pass")
		    db.query('select * from `user`', function(err, rows) {
		       console.log('result:'+rows);

		        	for (var i=0;i<rows.length;i++)
					{
						if (rows[i].username == userName){
							 // ketqua = 1;
							 if (rows[i].password == passWord)
							 {
							 	kt = 0;
							 	user = rows[i];
							 }
							 else
							 {
							 	kt = 2;
							 }
 
							 break;
						}
						
					}
					// socket.emit('server-send-avatar-profile', {hinhanh:image});
					var data={
						kt:kt,
						information:user
					};
					socket.emit('result-login',
						 {
							noidung : data
						
							// hinhanh : image
						}
						// },{hinhanh:image}
					);



		    });
	});

	socket.on('client-login-successful', function() {
		db.query('SELECT * FROM `roomchat`',function(err,rows){
			socket.emit('server-send-list-room',{
				noidung:rows
			});
			// socket.emit('server-send-image',{
			// 	noidung:rows
			// });
			console.log(rows);
		});
	});

	//// changing profile

	socket.on('client-changes-password',function (username,password)
	{
		var username  = {username: username};
		var info = { password : password};
		db.query('UPDATE `user` SET ? WHERE ?',[info, username], function(err, result) {
			if (err)
			{
				socket.emit("result-change-password",{noidung:false});
			}
			else
			{
				socket.emit("result-change-password",{noidung:true});
			}
		});
		
	});

	socket.on('client-changes-avatar',function (username,image)
	{
		var username  = {username: username};
		var info = { image : image};
		db.query('UPDATE `user` SET ? WHERE ?',[info, username], function(err, result) {
			if (err)
			{
				socket.emit("result-change-password",{noidung:false});
			}
			else
			{
				socket.emit("result-change-password",{noidung:true});
			}
		});
	});

	socket.on('client-changes-background',function (username,background)
	{
		var username  = {username: username};
		var info = { background : background};
		db.query('UPDATE `user` SET ? WHERE ?',[info, username], function(err, result) {
			if (err)
			{
				socket.emit("result-change-password",{noidung:false});
			}
			else
			{
				socket.emit("result-change-password",{noidung:true});
			}
		});
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