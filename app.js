var express = require('express'),
app = express(),
multer = require('multer'),
path = require('path'),
request = require('request'),
cookieParser = require('cookie-parser');
bodyParser = require('body-parser'),
mongoose = require('mongoose'),
methodOverride = require('method-override'),
passport = require('passport'),
expressSession = require('express-session');

app.use(expressSession({
	secret: 'mySecretKey',
	resave: true,
	saveUninitialized: true
}));

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/products')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage })

app.use(passport.initialize());
app.use(passport.session());

var flash = require('connect-flash');
app.use(flash());

var initPassport = require('./passport/init');
initPassport(passport);

var db = require('./connection/db');

var RegData = require("./models/product.js");
var StockData = require("./models/stock.js");
var UserData = require("./models/user.js");
var ConsigneeData = require("./models/consignee.js");
var DeliveryData = require("./models/delivery.js");
var InventoryData = require("./models/inventory.js");
var ProductsDeliveryData = require("./models/productsdelivery.js");
var ProductsInventoryData = require("./models/productsinventory.js");

app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(path.join(__dirname + '/public'))) ;

module.exports = app;

app.listen((process.env.PORT || 3000), function(){
	console.log('app listen at port 3000');
});

var isAuthenticated = function (req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}

app.get("/", function(req, res){
	res.render("index", { message: req.flash('message') });
});

app.get("/Dashboard", isAuthenticated, function(req, res){
	res.render("Dashboard", {
		title: 'Dashboard',
		validationText: 'Quantity can’t be 0',
		firstName: req.user.firstName
		});
});

/* Actions routes */
app.get("/add_product", isAuthenticated, function(req, res){
	res.render("Add_Product", {
		title: 'Agregar Producto',
		validationText: 'Quantity can’t be 0',
		firstName: req.user.firstName
		});
});

app.get("/add_consignee", isAuthenticated, function(req, res){
    res.render("Add_Consignee", {
        title: 'Agregar Consignatario',
        firstName: req.user.firstName
        });
});

app.get("/add_stock/:id", isAuthenticated, function(req, res){
	RegData.findById(req.params.id, function (err, producttostock) {
            if (err) {
                return console.error(err);
            } else {
                  res.format({
                    html: function(){
                        res.render("Add_Stock", {
                            title: 'Cargar Stock',
							firstName: req.user.firstName,
                            "producttostock" : producttostock
                        });
                    },
                    json: function(){
                        res.json(products);
                    }
                });
              }     
	});
});

app.get("/add_delivery/:id", isAuthenticated, function(req, res){
    ConsigneeData.findById(req.params.id, function (err, delivery) {
            RegData.find({}, function (err, products) {
                if (err) {
                    return console.error(err);
                } else {
                      res.format({
                        html: function(){
                            res.render("Add_Delivery", {
                                title: 'Realizar Entrega',
                                firstName: req.user.firstName,
                                "delivery" : delivery,
                                "products" : products
                            });
                        },
                        json: function(){
                            res.json(consignees);
                        }
                    });
                  }  
            });   
    });
});

app.post("/add_product", upload.single('productimage'), function(req, res, next) {
		var productname = req.body.productname;
        var quantity = req.body.stock;
        var category = req.body.category;
        var price = req.body.price;
        var img = req.file.path;

        RegData.create({
        	productname : productname,
            img: img,
            category : category,
            quantity : quantity,
            price : price
        }, function (err, product) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  res.format({
                    html: function(){
                        res.redirect("/Product_Saved");
                    },
                    json: function(){
                        res.json(product);
                    }
                });
              }
        })
});

app.post("/add_stock", function(req, res, next) {
    var concepto = req.body.concepto;
    var quantity = req.body.quantity;
    var id = req.body.productid;
    var date = req.body.stockdate;

    RegData.findById(id, function (err, product) { 
        product.save(function (err) {
            if (err) return handleError(err);

            var stock = new StockData({
                concepto: concepto,
                quantity: quantity,
                date: date,
                product: product._id  
            });

            stock.save(function (err) {
                if (err) {
                    res.send("There was a problem adding the information to the database.");
                } else {
                  res.format({
                    html: function(){
                        res.redirect("/Stock_Saved");
                    },
                    json: function(){
                        res.json(stock);
                    }
                });
              }
            });
            product.stock.push(stock);
            var newQuantity = product.quantity + stock.quantity;
            product.quantity = newQuantity;
            product.save();
        });
    });
});

app.post("/add_delivery", function(req, res, next) {
    var deliverydate = req.body.deliverydate;
    var id = req.body.consigneeid;

    var productsdelivered = [];
    var productsinventory = [];
    var productsfordelivery = [];
    var productsforinventory = [];

    for(var i = 0; i < req.body.productsNumber.length; i++) { 
        var productId = req.body.deliveryProductId[i];
        var productQuantity = req.body.deliveryProductQuantity[i];
        var productSpecialPrice = req.body.deliveryProductSpecialPrice[i];
            productsdelivered[i] = new ProductsDeliveryData({
            product: mongoose.Types.ObjectId(productId),
            quantitydelivered: productQuantity,
            specialprice: productSpecialPrice
        });

        productsdelivered[i].save();
        productsfordelivery.push(productsdelivered[i]._id);

        
        productsinventory[i] = new ProductsInventoryData({
            product: mongoose.Types.ObjectId(productId),
            quantityinventory: productQuantity
        });

        productsinventory[i].save();
        productsforinventory.push(mongoose.Types.ObjectId(productsinventory[i]._id)); 
    };

    var productosInventoryArray = [];
    for (i = 0; i < productsforinventory.length; i++) { 
        productosInventoryArray.push(mongoose.Types.ObjectId(productsforinventory[i].product));
    }
    console.log(productosInventoryArray);

    // ProductsDeliveryData.find({_id: {$in: productosInventoryArray}}, {path: "product"},
    // function(err,products_to_inventory) {  
    //     console.log(products_to_inventory)
    // }); 

    ConsigneeData.findById(id, function (err, consignee) { 
        consignee.save(function (err) {
            if (err) return handleError(err);
            var delivery = new DeliveryData({
                deliverydate: deliverydate,
                consignee: consignee._id,
                products: productsfordelivery
            });

            var inventory_update = new InventoryData({
                consignee: consignee._id,
                products: productsforinventory
            });

            inventory_update.save();

            delivery.save(function (err) {
                if (err) {
                    res.send("There was a problem adding the information to the database.");
                } else {
                  res.format({
                    html: function(){
                        res.redirect("/Delivery_Saved");
                    },
                    json: function(){
                        res.json(stock);
                    }
                });
              }
            });

            consignee.inventory.push(inventory_update);
            consignee.deliveries.push(delivery);
            consignee.save();
        });
    });
});

app.post("/add_consignee", function(req, res, next) {
        var consigneename = req.body.consigneename;
        var consigneerut = req.body.consigneerut;
        var consigneeaddress = req.body.consigneeaddress;

        ConsigneeData.create({
            consigneename : consigneename,
            address: consigneeaddress,
            rut : consigneerut
        }, function (err, consegnee) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  res.format({
                    html: function(){
                        res.redirect("/Consignee_Saved");
                    },
                    json: function(){
                        res.json(consegnee);
                    }
                });
              }
        })
});

app.get("/Product_Saved", function(req, res){
	res.render("Product_Saved", {
		text: 'Producto guardado correctamente',
		firstName: req.user.firstName
	});
});

app.get("/Delivery_Saved", function(req, res){
    res.render("Delivery_Saved", {
        text: 'Entrega creada correctamente',
        firstName: req.user.firstName
    });
});

app.get("/Stock_Saved", function(req, res){
    res.render("Stock_Saved", {
        text: 'Stock creado correctamente',
        firstName: req.user.firstName
    });
});

app.get("/Consignee_Saved", function(req, res){
    res.render("Consignee_Saved", {
        text: 'Consignatario creado correctamente',
        firstName: req.user.firstName
    });
});

app.get("/Products", isAuthenticated, function(req, res, next){
	RegData.find({}, function (err, products) {
            if (err) {
                return console.error(err);
            } else {
                  res.format({
                    html: function(){
                        res.render("Products", {
                            title: 'Listado de Productos',
							firstName: req.user.firstName,
                            "products" : products
                        });
                    },
                    json: function(){
                        res.json(products);
                    }
                });
              }     
	});
});

app.get("/Consignees", isAuthenticated, function(req, res, next){
    ConsigneeData.find({}, function (err, consignees) {
            if (err) {
                return console.error(err);
            } else {
                  res.format({
                    html: function(){
                        res.render("Consignees", {
                            title: 'Listado de Consignatarios',
                            firstName: req.user.firstName,
                            "consignees" : consignees
                        });
                    },
                    json: function(){
                        res.json(products);
                    }
                });
              }     
    });
});

app.get("/product_detail/:id", isAuthenticated, function(req, res, next){
    RegData.findById(req.params.id, function (err, product_detail) {
    StockData.populate(product_detail, {path: "stock"},function(err, product_detail){
            if (err) {
                return console.error(err);
            } else {
                  res.format({
                    html: function(){
                        res.render("Product_Detail", {
                            title: 'Detalle de Producto',
                            firstName: req.user.firstName,
                            "product_detail" : product_detail
                        });
                    },
                    json: function(){
                        res.json(products);
                    }
                });
              } 
        });    
    });
});

app.get("/consignee_detail/:id", isAuthenticated, function(req, res, next){
    ConsigneeData.findById(req.params.id, function (err, consignee_detail) {
    ConsigneeData.populate(consignee_detail, {path: "deliveries"},
        function(err, consignee_full_detail){
        DeliveryData.populate(consignee_full_detail,{
            path: 'products'},function(err, consignee_full_detail){  

            var productosDeliveredArray = [];
            for (i = 0; i < consignee_full_detail.deliveries.length; i++) { 
                var productosDelivered = consignee_full_detail.deliveries[i].products;
                for (i = 0; i < productosDelivered.length; i++) { 
                    productosDeliveredArray.push(mongoose.Types.ObjectId(productosDelivered[i]));

                }
            }

            ProductsDeliveryData.find({_id: {$in: productosDeliveredArray}},
            function(err,products_delivered) {  
                ProductsDeliveryData.populate(products_delivered, {path: "product"},
                function(err,productname) {
                if (err) {
                return console.error(err);
                } else {
                  res.format({
                    html: function(){
                        res.render("Consignee_Detail", {
                            title: 'Detalle del Consignatario',
                            firstName: req.user.firstName,
                            "consignee_detail": consignee_full_detail,
                            "products_delivered": products_delivered,
                            "productname": productname
                        });
                    },
                    json: function(){
                        res.json(consignees);
                    }
                    });
                } 
                }); 
            });  
            }); 
        });
    });
});

/* Login routes */

app.post('/login', passport.authenticate('login', {
	successRedirect: '/Dashboard',
	failureRedirect: '/',
	failureFlash : true  
}));

app.get('/signup', function(req, res){
	res.render('User_Register',{message: req.flash('message')});
});

app.post('/signup', passport.authenticate('signup', {
	successRedirect: '/Dashboard',
	failureRedirect: '/signup',
	failureFlash : true  
}));

app.get('/signout', function(req, res) {
		req.logout();
		res.redirect('/');
});

