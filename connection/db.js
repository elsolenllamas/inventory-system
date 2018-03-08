var mongoose = require('mongoose'); 
var mongodbUri = 'mongodb://admin:admin@ds117878.mlab.com:17878/lms';
var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } }; 

mongoose.Promise = global.Promise

mongoose.connect(mongodbUri, options);
var conn = mongoose.connection;             
 
conn.on('error', console.error.bind(console, 'connection error:'));  
 
conn.once('open', function() {
  console.log('connected to db');                    
});
