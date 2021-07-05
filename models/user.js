/*
This File is for Mongoose, here we define how the Schema for a user stored in the DB should look like
 */

//import mongoose
const mongoose = require("mongoose");

//create Schema
const userSchema = mongoose.Schema({
    //parameter of a user
    _id: mongoose.Schema.Types.ObjectId,
    userId: {type: String, required: true},
    password: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    role: {type: String, required: true}
});

//export constructor to build Objects based on the Schema
module.exports = mongoose.model("User", userSchema);