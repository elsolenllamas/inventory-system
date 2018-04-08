var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	SalesSchema = new mongoose.Schema({
	salesdate: String,
	salessource: String,
	productssale: [{ type: Schema.Types.ObjectId, ref: 'ProductsSales' }],
	consignee: [{ type: Schema.Types.ObjectId, ref: 'Consignee' }]
}),
	SalesData = mongoose.model('Delivery', SalesSchema);

module.exports = SalesData;