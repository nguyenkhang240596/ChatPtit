var mongoose = require('mongoose');
var	Schema = mongoose.Schema;
var crypto = require('crypto');

var Room = new Schema({
	name : String,
	owner : {
		type : Schema.Types.ObjectId,
		ref : 'User'
		// ,
		// unique : true
	},
	members : [{
		type : Schema.Types.ObjectId,
		ref : 'User'
	}],
	message : [{
		type : Schema.Types.ObjectId,
		ref : 'Message'
	}]
},{
	versionKey : false
});


module.exports = Room;