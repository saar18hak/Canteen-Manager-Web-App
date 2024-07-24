const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://kumarsaarthak916:1tJ7JLpZQyATzllG@cluster0.vxf53fx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

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