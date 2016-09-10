var mongoose = require('mongoose');
var async = require('async');

var UserSchema = require('../models/user');
var User = mongoose.model('user', UserSchema);
var regexmail = /^[A-z0-9_\.]{4,31}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}$/;
var regexpass =/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d$@$!%*?&]{6,}/;

User.register = function(req, res, next){
	var email = req.body.email ? req.body.email.trim() : '';
	var password = req.body.password ? req.body.password.trim() : '';
	var phone = req.body.phone ? req.body.phone.trim() : '';
	var image = req.body.image ? req.body.image.trim() : '';
	var birthday = req.body.birthday ? req.body.birthday.trim() : '';
	var gender = req.body.gender ? req.body.gender.trim() : '';
	var user;

	async.series({
		checkFields : function (callback) {
			if (email) {
				if (!regexmail.test(email)) {
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
			} else {
				return callback('email is require');
			}

			if (password) {
				if (!regexpass.test(password)) {
					return callback('password is invalid');
				}
			} else {
				return callback('password is require');
			}

			if (!phone) {
				return callback('phone is require');
			} 

			// if (!image) {
			// 	return res.json('image is require');
			// } 

			if (!birthday) {
				return callback('birthday is require');
			}

			if (!gender) {
				return callback('gender is require');
			} 

		},
		createUser : function(callback) {
			user = new User(req.body);
			user.password = req.body.password;
			user.save(function(error) {
				if (error) callback(error);
				else callback();
			})
		}
	}, function (err, results) {
		if (err) {
			res.json({results:err});
		} else {
			res.json({results:user.toJSON()});
		}	
	});
}

User.login = function (req, res, next) {
	var user;
	var email = req.body.email ? req.body.email.trim() : '';
	var password = req.body.password ? req.body.password.trim() : '';	
	if (!regexmail.test(email)){
		return res.json({results:'email is invalid'});
	}
	else {
		User.findOne({
			email : email
		}, function (err, user) {
			if (err || !user){
				return res.json({results : 'user was not found'});
			} else {
				if (user.authenticate(password.toString())) {
					return res.json({results:user.toJSON()});
				} else {
					return res.json({results:'wrong password'});
				}
			}
		});
	}
}

module.exports = User;