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
					return res.json('email is invalid');
				}
			} else {
				return res.json('email is require');
			}

			if (password) {
				if (!regexpass.test(password)) {
					return res.json('password is invalid');
				}
			} else {
				return res.json('password is require');
			}

			if (!phone) {
				return res.json('phone is require');
			} 

			// if (!image) {
			// 	return res.json('image is require');
			// } 

			if (!birthday) {
				return res.json('birthday is require');
			}

			if (!gender) {
				return res.json('gender is require');
			} 
			callback();
		},
		createUser : function(callback) {
			user = new User(req.body);
			// var password = new Buffer(body.password.toString()).toString('base64');
			user.password = req.body.password;
			user.save(function(error) {
				callback();
			})
		}
	}, function (err, results) {
		console.log(err+results);
		if (err) {
			res.json(err);
		} else {
			res.json(user.toJSON());
		}	
	});
}

User.login = function (req, res, next) {
	var user;
	var email = req.body.email ? req.body.email.trim() : '';
	var password = req.body.password ? req.body.password.trim() : '';	
	if (!regexmail.test(body[key])){
		return res.json('email is invalid');
	}
	// else {
	// 	User.findOne({
	// 		email : body['email']
	// 	}, function (err, user) {
	// 		if (err || !user){
	// 			res.json(utilities.response(false, {}, 'user not found', 404));
	// 		} else {
	// 			if (user.authenticate(body.password.toString())) {
	// 				var token = jwt.sign(user, config.JWTSecret, { expiresIn: '1d'});
	// 				cache.set(token, user._id);
	// 				req.app.id = user._id.toString();
	// 				var user2 = user.toJSON();
	// 				res.json(user2);
	// 			} else {
	// 				res.json('wrong password');
	// 			}
	// 		}
	// 	});
	// }


}

module.exports = User;