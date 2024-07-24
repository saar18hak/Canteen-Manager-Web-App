const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://kumarsaarthak916:1tJ7JLpZQyATzllG@cluster0.vxf53fx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

const rewardMenuItemsSchema = mongoose.Schema({
    itemName: { type: String },
    description: String,
    pointsRequired: { type: Number, required: true },
    image: String,
    available: { type: Boolean, default: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
    
})

module.exports = mongoose.model("RewardItem", rewardMenuItemsSchema)