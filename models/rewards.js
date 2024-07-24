const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/canteenmanagement")

const rewardsSchema = mongoose.Schema({
    adminid: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin'},
    points:Number,
    minAmount: { type: Number, required: true }, 
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    expiryDate: { type: Date },
    category: { type: String },
    available: { type: Boolean, default: true }
    
})

module.exports = mongoose.model("Rewards", rewardsSchema)