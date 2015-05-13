/* Mongoose - Insertion */
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');

var Schema = mongoose.Schema;

var InsertionSchema = new Schema({
	code: String,
	name: String,
	closed_at: Date,
    states: [Schema.Types.Mixed]
});
InsertionSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Insertion', InsertionSchema);
