var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	DeliverySchema = new mongoose.Schema({
	deliverydate: String,
	products: [{ type: Schema.Types.ObjectId, ref: 'ProductsDelivery' }],
	consignee: [{ type: Schema.Types.ObjectId, ref: 'Consignee' }]
}),
	DeliveryData = mongoose.model('Delivery', DeliverySchema);

module.exports = DeliveryData;