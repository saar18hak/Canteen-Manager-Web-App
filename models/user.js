const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://kumarsaarthak916:1tJ7JLpZQyATzllG@cluster0.vxf53fx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

const userSchema = mongoose.Schema({
    username:String,
    email:String,
    password:String,
    balance:{ type: Number, default: 0 },
    adminid:String,
    rewardPoints: { type: Number, default: 0 },
    collectedRewards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rewards' }] // Track collected rewards


})

module.exports = mongoose.model("User", userSchema)