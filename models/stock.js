var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var stockSchema = new mongoose.Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product' },	
  date: { type: Date, default: Date.now },
  quantity: Number,
  concepto: String
});

var StockData  = mongoose.model('Stock', stockSchema);

module.exports = StockData;