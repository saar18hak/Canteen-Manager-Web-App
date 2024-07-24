const mongoose = require('mongoose')

mongoose.connect("mongodb://127.0.0.1:27017/canteenmanagement")

const adminSchema = mongoose.Schema({
    adminname:String,
    email:String,
    password:String,
    
})

module.exports = mongoose.model("Admin", adminSchema)