/* Mongoose - Order */
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;

var OrderSchema = new Schema({
	code: String,
	name: String,
	tender_code: String,
	dates: Schema.Types.Mixed,
	areas: [String],
	supplier: { code: String, name: String },
	buyer: { code: String, name: String },
	total: Number,
	currency: String
});
OrderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Order', OrderSchema);