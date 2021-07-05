/*
This File is for Mongoose, here we define how the Schema for a contact stored in the DB should look like
 */

//import mongoose
const mongoose = require("mongoose");

mongoose.Schema.Types.Boolean.convertToTrue.add('on');
mongoose.Schema.Types.Boolean.convertToFalse.add('off');

//create Schema
const contactSchema = mongoose.Schema({
    //parameter of a contact
    _id: mongoose.Schema.Types.ObjectId,
    owner: {type: String, required: true},
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    streetNumber: {type: String, required: true},
    zip: {type: String, required: true},
    city: {type: String, required: true},
    state: {type: String, required: false},
    country: {type: String, required: false},
    isPrivate: {type: Boolean, required: true},
    geocord: {
        type: [Number],
        index: '2dsphere',
        required: false}
});

//export constructor to build Objects based on the Schema
module.exports = mongoose.model("Contact", contactSchema);

