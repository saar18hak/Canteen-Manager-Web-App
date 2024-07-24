const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://kumarsaarthak916:1tJ7JLpZQyATzllG@cluster0.vxf53fx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

const rewardOrderSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemsOrder: [{
        itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'RewardItem', required: true },
        quantity: { type: Number, required: true },
        pointsRequired: { type: Number },
    }],
    totalPointsRequired: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' }
});

module.exports = mongoose.model("RewardOrder", rewardOrderSchema);
