var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var productsSaleSchema = new mongoose.Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },	
  quantitysale: Number,
  saleprice: Number
});

var ProductsSaleData  = mongoose.model('ProductsDelivery', productsSaleSchema);

module.exports = ProductsSaleData;