const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://kumarsaarthak916:1tJ7JLpZQyATzllG@cluster0.vxf53fx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

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
