var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var productsDeliverySchema = new mongoose.Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },	
  quantitydelivered: Number,
  specialprice: Number
});

var ProductsDeliveryData  = mongoose.model('ProductsDelivery', productsDeliverySchema);

module.exports = ProductsDeliveryData;