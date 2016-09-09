var mongoose = require('mongoose');
var	Schema = mongoose.Schema;
var crypto = require('crypto');

var User = new Schema({
	email : {
		type : String
		// ,
		// unique : true
	},
	phone : String,
	image : {
		type : String
	},
	birthday : {
		type : Date
	},
	gender : {
		type : Boolean,
		default : false
	},
	hashed_password : String,
	salt : String
},{
	versionKey : false
});


User.virtual('password').set(function(password) {
  	this._password = password;
  	this.salt = this.makeSalt();
  	this.hashed_password = this.hashPassword(password);
}).get(function() {
  return this._password;
});

User.methods ={
	authenticate: function(plainText) {
    	return this.hashPassword(plainText) === this.hashed_password;
	},
	makeSalt: function() {
    	return crypto.randomBytes(16).toString('base64');
	},
	hashPassword: function(password) {
    	if (!password || !this.salt) return '';
    	var salt = new Buffer(this.salt, 'base64');
    	return crypto.pbkdf2Sync(password, salt, 071189, 64).toString('base64');
	},

	toJSON: function() {
		var obj = this.toObject();
		delete obj.hashed_password;
		delete obj.salt;
		return obj;
	}
}


module.exports = User;