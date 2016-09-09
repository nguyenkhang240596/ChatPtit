var mongoose = require('mongoose');
var	Schema = mongoose.Schema;
var crypto = require('crypto');

var Message = new Schema({
	owner : {
		type : Schema.Types.ObjectId,
		ref : 'User'
		// ,
		// unique : true
	},
	room : {
		type : Schema.Types.ObjectId,
		ref : 'Room'
	},
	content : string,
},{
	versionKey : false
});


module.exports = Message;