var express = require('express');

/* Mongoose Models */
var Order  = require('../models/order');
var Tender = require('../models/tender');
var User   = require('../models/user');

var router = express.Router();

/* POST REGISTER */
/* {"email": "cplopez4@uc.cl", "pass": "abrecl2014", "preferences": ["Alimentos", "Insumos Médicos"]} */
router.post('/register', function(req, res) {
	var user = db.User.find({ where: { _uid: req.body.uid } }).success(function(user){
		res.header('Access-Control-Allow-Origin', '*');
		res.json(user);
	})
});

/* POST LOGIN */
/* {"email": "cplopez4@uc.cl", "pass": "abrecl2014"} */
router.post('/login', function(req, res) {
	var user = db.User.find({ where: { _uid: req.body.uid } }).success(function(user){
		res.header('Access-Control-Allow-Origin', '*');
		res.json(user);
	})
});

/* ORDER ROUTES */
router.route('/orders')

	/* POST New Order */
	/* {"code":"codigo-de-la-orden", "name": "Insumos Médicos", "tender_code": "codigo-de-la-licitacion", "areas": "Alimentos / Bebidas / Gaseosas", "supplier": { "code": "codigo-de-la-empresa", "name": "Ventas de Gaseosas Marcelito" }, "buyer": { "code": "codigo-de-la-empresa", "name": "Cafetería de la Moneda" }, "total": 50300, "currency": "CLP", "created_at": Date } */
	.post(function(req, res) {
		var order = new Order();

		order.code = req.body.code || "02-000-00";
		order.name = req.body.name || "Compra Chilecompra";
		order.tender_code = req.body.tender_code || "00-000-00";
		order.areas = req.body.areas.split(" / ") || [];
		order.supplier.code = req.body.supplier.code || "03-000-00";
		order.supplier.name = req.body.supplier.name || "Vendedor";
		order.buyer.code = req.body.buyer.code || "01-000-00";
		order.buyer.name = req.body.buyer.name || "Comprador";
		order.total = parseInt(req.body.total) || 0;
		order.currency = req.body.currency || "CLP";
		order.created_at = new Date(req.body.created_at) || new Date();

		order.save(function(err, order){
			res.header('Access-Control-Allow-Origin', '*');
			if(err)
				res.send(err);

			res.json(order);
		})
	})

	/* GET Orders */
	.get(function(req, res) {
		Order.find({}, function(err, orders){
			res.header('Access-Control-Allow-Origin', '*');
			if(err)
				res.send(err);

			res.json(orders);
		});
	});

/* GET ORDERS PAGINATED WITH PAGE & ITEMS_COUNT */
/* http://root/api/orders_pag?page=2&items=10 */
router.get('/orders_pag', function(req, res){
	var page = parseInt(req.query.page) || 1;
	var items = parseInt(req.query.items) || 10;

	Order.paginate({}, page, items, function(err, pageCount, orders, itemCount) {
		res.header('Access-Control-Allow-Origin', '*');
		if (err)
			res.send(err);

		res.json(orders);
	}, { sortBy: { created_at: -1 } });
});

/* TENDER ROUTES */
router.route('/tenders')

	/* POST New Tender */
	/* {"code":"codigo-de-la-licitacion", "type": "L1", name": "Insumos Médicos", "desc": "Licitación para comprar bebidas", "areas_num": 2, "areas": ["Alimentos / Bebidas / Gaseosas", "Alimentos / Bebidas / Cafe"], "buyer": { "code": "codigo-de-la-empresa", "name": "Cafetería de la Moneda" }, "region": "Región Metropolitana", "published_at": Date, "closed_at": Date } */
	.post(function(req, res) {
		var tender = new Tender();

		tender.code = req.body.code || "00-000-00";
		tender.type = req.body.type || "L1";
		tender.name = req.body.name || "Compra Chilecompra";
		tender.desc = req.body.desc || "Compra Chilecompra";
		tender.areas_num = parseInt(req.body.areas_num) || 0;
		tender.areas = req.body.areas || [];
		tender.buyer.code = req.body.buyer.code || "01-000-00";
		tender.buyer.name = req.body.buyer.name || "Comprador";
		tender.region = req.body.region || "Región Metropolitana de Santiago";
		tender.published_at = new Date(req.body.published_at) || new Date();
		tender.closed_at = new Date(req.body.closed_at) || new Date();

		tender.save(function(err, tender){
			res.header('Access-Control-Allow-Origin', '*');
			if(err)
				res.send(err);

			res.json(tender);
		})
	})

	/* GET Tenders */
	.get(function(req, res) {
		Tender.find({}, function(err, tenders){
			res.header('Access-Control-Allow-Origin', '*');
			if(err)
				res.send(err);

			res.json(tenders);
		});
	});

/* GET TENDERS PAGINATED WITH PAGE & ITEMS_COUNT */
/* http://root/api/tenders_pag?page=2&items=10 */
router.get('/tenders_pag', function(req, res){
	var page = parseInt(req.query.page) || 1;
	var items = parseInt(req.query.items) || 10;

	Tender.paginate({}, page, items, function(err, pageCount, tender, itemCount) {
		res.header('Access-Control-Allow-Origin', '*');
		if (err)
			res.send(err);

		res.json(tender);
	}, { sortBy: { published_at: -1 } });
});	


module.exports = router;
