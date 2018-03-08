var express = require('express'),
app = express(),
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

app.use(passport.initialize());
app.use(passport.session());

var flash = require('connect-flash');
app.use(flash());

var initPassport = require('./passport/init');
initPassport(passport);

var db = require('./connection/db');

var RegData = require("./models/product.js");
var UserData = require("./models/user.js");

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

app.post("/add_stock", isAuthenticated, function(req, res){
	RegData.find({ 'productname': req.body.stockproduct }, function (err, producttostock) {
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

app.post("/add_product", function(req, res, next) {
		var productname = req.body.productname;
        var img = req.body.img;
        var quantity = req.body.stock;
        var price = req.body.price;
        RegData.create({
        	productname : productname,
            img : img,
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

app.get("/Product_Saved", function(req, res){
	res.render("Product_Saved", {
		text: 'Producto guardado correctamente',
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
