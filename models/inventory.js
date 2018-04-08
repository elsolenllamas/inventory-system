var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	InventorySchema = new mongoose.Schema({
	products: [{ type: Schema.Types.ObjectId, ref: 'ProductsInventory' }],
	consignee: [{ type: Schema.Types.ObjectId, ref: 'Consignee' }]
}),
	InventoryData = mongoose.model('Inventory', InventorySchema);

module.exports = InventoryData;