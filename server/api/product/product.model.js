'use strict';

var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  images: [String],
  quantity: Number,
  active: Boolean
});

require('./product.events').registerHooks(ProductSchema);

export default mongoose.model('Product', ProductSchema);
