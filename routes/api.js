var express = require('express');

/* Mongoose Models */
var Order  = require('../models/order');
var Tender = require('../models/tender');
var User   = require('../models/user');

var router = express.Router();

/* POST REGISTER */
/* {"email": "cplopez4@uc.cl", "pass": "abrecl2014", "preferences": ["Alimentos", "Insumos Médicos"]} */
router.post('/register', function(req, res) {
	res.send("Register");
});

/* POST LOGIN */
/* {"email": "cplopez4@uc.cl", "pass": "abrecl2014"} */
router.post('/login', function(req, res) {
	res.send("Login");
});

/* POST NEW STATE */
/* {"state": 8, "date": "27022014", "type": 0, "code": "213-L12-20"} */
router.post('/state', function(req, res) {
	var type = parseInt(req.body.type);
	var state = parseInt(req.body.state);
	var state_hash = { "state": state, "date": req.body.date };
	var code = req.body.code || "00-000-00";

	if(type == 0){
		Tender.findOne({ code: code }, function(err, tender){
			res.header('Access-Control-Allow-Origin', '*');
			if(err)
				res.send(err);

			if(tender == null){
				res.json({ "status": "Not founded" });
			}
			else{
				tender.state = state;
				tender.states.push(state_hash);

				tender.save(function(err, tenderSaved){
					if(err)
						res.send(err);

					res.json(tenderSaved);
				})
			}
		});
	}
	else{
		Order.findOne({ code: code }, function(err, order){
			res.header('Access-Control-Allow-Origin', '*');
			if(err)
				res.send(err);

			if(order == null){
				res.json({ "status": "Not founded" });
			}
			else{
				order.state = state;
				order.states.push(state_hash);

				order.save(function(err, orderSaved){
					if(err)
						res.send(err);

					res.json(orderSaved);
				})
			}
		});
	}
});

/* GET SEARCH ORDER OR TENDER WITH CODE */
/* http://root/api/search?code=213-L12-20&type=0 */
router.get('/search', function(req, res){
	var code = req.query.code || "00-000-00";
	var type = parseInt(req.query.type) || 0;

	if(type == 0){
		Tender.findOne({ code: code }, function(err, tender){
			res.header('Access-Control-Allow-Origin', '*');
			if(err)
				res.send(err);

			if(tender == null){
				res.json({ "isCreated": "false", "state": 0 });
			}
			else{
				res.json({ "isCreated": "true", "state": tender.state });
			}
		});
	}
	else{
		Order.findOne({ code: code }, function(err, order){
			res.header('Access-Control-Allow-Origin', '*');
			if(err)
				res.send(err);

			if(order == null){
				res.json({ "isCreated": "false", "state": 0 });
			}
			else{
				res.json({ "isCreated": "true", "state": order.state });
			}
		});
	}
});

/* ORDER ROUTES */
router.route('/orders')

	/* POST New Order */
	/* {"code":"codigo-de-la-orden", "name": "Insumos Médicos", "tender_code": "codigo-de-la-licitacion", "areas": [{ "name": "Juguetes / Jueguetes para niños / Cascabeles", "amount": 4800 }, { "name": "Juguetes / Juguetes para niños / Puzzles", "amount": 50000 } ], "supplier": { "code": "codigo-de-la-empresa", "name": "Ventas de Gaseosas Marcelito" }, "buyer": { "code": "codigo-de-la-empresa", "name": "Cafetería de la Moneda" }, "total": 50300, "currency": "CLP", "created_at": "2014-01-20T10:00:17.173Z", "state": 8, "states": [ { "state": 8, "date": "27022014" } ], "items_num": 2, "items_desc": [ {"cantidad": 1, "producto": "Unidades Dentales", "monto": 35000 }, { "cantidad": 2, "producto": "Frenillos", "monto": 60000 } ] } */
	.post(function(req, res) {
		var order = new Order();

		order.code = req.body.code || "02-000-00";
		order.name = req.body.name || "Compra Chilecompra";
		order.tender_code = req.body.tender_code || "00-000-00";
		order.areas = req.body.areas || [];
		order.supplier.code = req.body.supplier.code || "03-000-00";
		order.supplier.name = req.body.supplier.name || "Vendedor";
		order.buyer.code = req.body.buyer.code || "01-000-00";
		order.buyer.name = req.body.buyer.name || "Comprador";
		order.total = parseInt(req.body.total) || 0;
		order.currency = req.body.currency || "CLP";
		order.created_at = new Date(req.body.created_at) || new Date();
		order.state = parseInt(req.body.state) || 5;
		order.states = req.body.states || [{"state": 5, "date": "01012014"}];
		order.items_num = parseInt(req.body.items_num) || 0
		order.items_desc = req.body.items_desc || []


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
	/* {"code":"codigo-de-la-licitacion", "type": "L1", "name": "Insumos Médicos", "desc": "Licitación para comprar bebidas", "areas_num": 2, "areas": ["Alimentos / Bebidas / Gaseosas", "Alimentos / Bebidas / Cafe"], "buyer": { "code": "codigo-de-la-empresa", "name": "Cafetería de la Moneda" }, "region": "Región Metropolitana", "published_at": "2014-01-20T10:00:17.173Z", "closed_at": "2014-01-27T15:54:00.000Z", "state": 8, "states": [ { "state": 8, "date": "27022014" } ], "items_num": 4, "items": [aquí se envía el objeto LISTADO completo, que está dentro de la licitación] } */
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
		tender.state = parseInt(req.body.state) || 5;
		tender.states = req.body.states || [{"state": 5, "date": "01012014"}];
		tender.items_num = parseInt(req.body.items_num) || 0
		tender.items = req.body.items || []

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
