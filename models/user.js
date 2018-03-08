var mongoose = require('mongoose'),
	UserSchema = new mongoose.Schema({
	username: String,
	password: String,
	email: String,
	firstName: String,
	lastName: String
}),  
	UserData = mongoose.model('users', UserSchema);

module.exports = UserData;