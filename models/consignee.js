var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	ConsigneeSchema = new mongoose.Schema({
	consigneename: String,
	rut: Number,
	address: String,
	inventory : [{ type: Schema.Types.ObjectId, ref: 'Inventory' }],
	deliveries : [{ type: Schema.Types.ObjectId, ref: 'Delivery' }],
	sales : [{ type: Schema.Types.ObjectId, ref: 'Sales' }]
}),
	ConsigneeData = mongoose.model('Consignee', ConsigneeSchema);

module.exports = ConsigneeData;
