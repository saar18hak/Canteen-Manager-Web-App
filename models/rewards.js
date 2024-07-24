const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://kumarsaarthak916:1tJ7JLpZQyATzllG@cluster0.vxf53fx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

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