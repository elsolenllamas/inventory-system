var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ProductSchema = new mongoose.Schema({
	productname: String,
	img: String,
	quantity: Number,
	price: Number,
	priceSpecial: Number,
	category: String,
	stock : [{ type: Schema.Types.ObjectId, ref: 'Stock' }]
}),
	RegData = mongoose.model('Product', ProductSchema);

module.exports = RegData;
