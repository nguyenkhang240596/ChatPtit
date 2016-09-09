var mongoose = require('mongoose');
var	Schema = mongoose.Schema;

var UserSchema = new Schema({
	name : {
		type : String
	},
	assessTo : [{
		type : Schema.Types.ObjectId,
		ref : 'User'
	}],
	assessFrom : {
		type : Schema.Types.ObjectId,
		ref : 'User'
	},
	content : {
		type : String
	},
	creatorId : {
		type : Schema.Types.ObjectId,
		ref : ''
	},
	createdDate : {
		type : Date,
		default : Date.now
	}
},{
	versionKey : false
});


module.exports = Assess;
