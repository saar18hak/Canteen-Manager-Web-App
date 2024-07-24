const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/canteenmanagement")

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