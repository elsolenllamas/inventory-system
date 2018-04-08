var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var productsInventorySchema = new mongoose.Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },	
  quantityinventory: Number
});

var ProductsInventoryData  = mongoose.model('ProductsInventory', productsInventorySchema);

module.exports = ProductsInventoryData;