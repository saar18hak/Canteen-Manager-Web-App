const mongoose = require('mongoose')
// mongoose.connect("mongodb://127.0.0.1:27017/canteenmanagement")
mongoose.connect("mongodb+srv://kumarsaarthak916:1tJ7JLpZQyATzllG@cluster0.vxf53fx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

const adminSchema = mongoose.Schema({
    adminname:String,
    email:String,
    password:String,
    
})

module.exports = mongoose.model("Admin", adminSchema)