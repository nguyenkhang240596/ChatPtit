var mongoose = require('mongoose');
var	Schema = mongoose.Schema;
var crypto = require('crypto');

var Message = new Schema({
	owner : String,	
	content : String,
	image : String,
	createdDate : {
		type : Date,
		default : Date.now
	}
},{
	versionKey : false
});

module.exports = Message;