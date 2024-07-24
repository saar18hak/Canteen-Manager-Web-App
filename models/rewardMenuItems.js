const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/canteenmanagement")

const rewardMenuItemsSchema = mongoose.Schema({
    itemName: { type: String },
    description: String,
    pointsRequired: { type: Number, required: true },
    image: String,
    available: { type: Boolean, default: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
    
})

module.exports = mongoose.model("RewardItem", rewardMenuItemsSchema)