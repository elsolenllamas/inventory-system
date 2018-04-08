var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Item = new ItemSchema(
  { img: 
      { data: Buffer, contentType: String }
  }
);
var Item = mongoose.model('Images',ItemSchema);