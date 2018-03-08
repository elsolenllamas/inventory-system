var mongoose = require('mongoose'),
	ProductSchema = new mongoose.Schema({
	productname: String,
	img: String,
	quantity: Number,
	price: Number
}),
	RegData = mongoose.model('products', ProductSchema);

module.exports = RegData;