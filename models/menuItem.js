const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/canteenmanagement")

const menuItemSchema = mongoose.Schema({
    adminid: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin'},
    itemname: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image:String,
    category: { type: String, required: true },
    available: { type: Boolean, default: true }
    
})

module.exports = mongoose.model("MenuItem", menuItemSchema)