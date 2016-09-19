var express = require('express');
var router = express.Router();
var async = require('async');

var mongoose = require('mongoose');
var UserSchema = require('../models/user');
var User = mongoose.model('User', UserSchema);
var regexmail = /^[A-z0-9_\.]{4,31}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}$/;
var regexpass =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&]{6,}/;

// var UserCtrl = require('../controllers/user');

router.post('/register', function(req, res, next){
	var email = req.body.email ? req.body.email.trim() : '';
	var password = req.body.password ? req.body.password.trim() : '';
	var phone = req.body.phone ? req.body.phone.trim() : '';
	var image = req.body.image ? req.body.image.trim() : '';
	var birthday = req.body.birthday ? req.body.birthday.trim() : '';
	var gender = req.body.gender ? req.body.gender.trim() : '';
	var name = req.body.name ? req.body.name.trim() : '';
	var user;

	async.series({
		checkFields : function (callback) {
			if (!email) {
				return callback('email is require');
			} else if (!password) {
				return callback('password is require');
			} else if (!phone) {
				return callback('phone is require'); 
			} else if (!image) {
				return callback('image is require');
			} else if (!name) {
				return callback('name is require');
			} else if (!birthday) {
				return callback('birthday is require');
			} else if (!gender) {
				return callback('gender is require');
			} else {
				if (!regexpass.test(password)) {
					return callback('password is invalid');
				} else if (!regexmail.test(email)) {
					return callback('email is invalid');
				} else {
					User.findOne({
						email : email
					}, function (err, user) {
						if (user) {
							return callback('email existed')
						} else if (err) {
							return callback(err);
						} else {
							callback();
						}
					});
				}
			}
		},
		createUser : function(callback) {
			user = new User(req.body);
			user.password = req.body.password;
			user.avatar = image;
			user.save(function(error) {
				if (error) callback(error);
				else callback();
			})
		}
	}, function (err, results) {
		if (err) {
			res.json({statuscode : 404,results:err});
		} else {
			res.json({statuscode : 200,results:user});
		}	
	});
});

router.post('/login', function (req, res, next) {
	var user;
	var email = req.body.email ? req.body.email.trim() : '';
	var password = req.body.password ? req.body.password.trim() : '';	
	if (!regexmail.test(email)){
		return res.json({statuscode : 404,results:'email is invalid'});
	}
	else {
		User.findOne({
			email : email
		}, function (err, user) {
			if (err || !user){
				return res.json({statuscode : 404,results : 'user was not found'});
			} else {
				if (user.authenticate(password.toString())) {
					return res.json({statuscode : 200,results:user});
				} else {
					return res.json({statuscode : 404,results:'wrong password'});
				}
			}
		});
	}
});

router.get('/:userEmail', function (req, res, next) {
	return res.json({statuscode : 200,results : req.user});
});

router.post('/changepwd/:userEmail', function (req, res, next) {
	var user = req.user;
	var oldPassword = req.body.oldPassword ? req.body.oldPassword : '';
	var newPassword = req.body.newPassword ? req.body.newPassword : '';	
	var repeatPassword = req.body.repeatPassword ? req.body.repeatPassword : '';	
	if (!oldPassword) {
			return res.json('oldPassword is require');
	} else if (!newPassword) {
		return res.json('newPassword is require');
	} else if (!repeatPassword) {
		return res.json('repeatPassword is require'); 
	} else {
		if (user.authenticate(oldPassword)) {
			if (newPassword === repeatPassword) {
				if (regexpass.test(newPassword)) {
					user.password = newPassword;
					user.save(function(err) {
						if (err) {
							res.json({statuscode : 404,results:err.message});
						} else {
							res.json({statuscode : 200,results:user});
						}
					});
				} else {
					res.json({statuscode : 404,results:'Repeat password is invalid'});
				}
			} else {
				res.json({statuscode : 404,results:'Repeat password is not match'});
			}
		} else {
			res.json({statuscode : 404,results:'Your old password is not correct'});
		}
	}
});
	
router.post('/changeavatar/:userEmail', function (req, res, next) {
	var user = req.user;
	var avatar = req.body.avatar ? req.body.avatar : '';
	if (!avatar) {
			res.json({statuscode : 404,results:'avatar is require'});
	} else {
		user.avatar = avatar;
		user.save(function(err) {
			if (err) {
				res.json({statuscode : 404,results:'avatar is require'});
			} else {
				res.json({statuscode : 200,results:user});
			}
		})
	}
});

router.post('/changebackground/:userEmail', function (req, res, next) {
	var user = req.user;
	var background = req.body.background ? req.body.background : '';
	if (!background) {
			res.json({statuscode : 404,results:'background is require'});
	} else {
		user.background = background;
		user.save(function(err) {
			if (err) {
				res.json({statuscode : 404,results:'background is require'});
			} else {
				res.json({statuscode : 200,results:user});
			}
		})
	}
});

router.param('userEmail', function (req, res, next) {
	User.findOne({
		email : req.params.userEmail
	}, function (err, user) {
		if (err || !user){
			return res.json({statuscode : 404,results : 'user was not found'});
		} else {
			req.user = user;
			next();
		}
	});
});

module.exports = router;
