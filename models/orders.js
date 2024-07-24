const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/canteenmanagement")

const orderSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  itemsOrder: [{
      menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }, // Reference to MenuItem
      quantity: { type: Number},
      price: { type: Number }
  }],
  totalPrice: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
});

module.exports = mongoose.model("Order", orderSchema)
