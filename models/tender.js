/* Mongoose - Tender */
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;

var TenderSchema = new Schema({
	code: String,
	type: String,
	name: String,
	desc: String,
	areas_num: Number,
	areas: [String],
	buyer: { code: String, name: String },
	region: String,
	published_at: Date,
	closed_at: Date
});
TenderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Tender', TenderSchema);