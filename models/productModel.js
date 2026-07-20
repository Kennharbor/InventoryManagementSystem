const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  imageURL: {
    type: String,
    default: ''
  },
  imagePublicId: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
});
module.exports = mongoose.model('Product', productSchema);
