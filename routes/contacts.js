/* 
This File will handle all contact related routes
*/

//import express package
const express = require("express");
//setting up express router (sub-package which gives us different ways to handle incoming requests conviently)
const router = express.Router();
//import mongoose
const mongoose = require("mongoose");
//import Contact Constructor
const Contact = require("../models/contact");
//import User constructor
const User = require("../models/user")

//handling get requests for all contacts in DB
router.get('/', function (req, res) {
    Contact.find({}).then(function (contacts) {
        res.send(contacts);
    });
});

//handling get request with id
router.get("/:contactId", (req, res, next) => {
    //find Contact by given ID in DB
    Contact.findById(req.params.contactId).exec()
        .then(contact => {
            //if no Contact was found
            if (!contact) {
                //send 404 -> not found
                return res.status(404).json({
                })
            }
            //if contact was found: esponse with status code 200 -> OK and use .json() to send the contact
            res.status(200).json({
                contact,
            });
        })
        .catch(err => {
            //display error in console
            console.log(err);
            //send 500er status -> fatal failure and send error mesage as json object
            res.status(500).json({
                error: err
            })
        });
});

//handles post request for storing new contact in DB
router.post("/", function (req, res, next) {
    //create a Contact using the Model as a Constructor
    const contact = new Contact({
        //executed as a function to automaticaly generate an id
        _id: mongoose.Types.ObjectId(),
        //get all properties, required fields will also be handled from frontend
        owner: req.body.owner,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        streetNumber: req.body.streetNumber,
        zip: req.body.zip,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        isPrivate: req.body.isPrivate,
        geocord: req.body.geocord
    });
    //save contact in DB
    contact.save();
    //if contact was found: esponse with status code 201 -> Created and use .json() to send the contact
    res.status(201).json({
        id: contact._id,
        request: {
            type: "GET",
            url: "http://localhost:3000/contacts/" + contact._id
        }
    });
});

router.put("/:contactId", function (req, res, next) {
    //extract contact id
    const id = req.params.contactId;
    //find the contact and update all properties
    Contact.findByIdAndUpdate(
        id,
        {
            owner: req.body.owner,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            streetNumber: req.body.streetNumber,
            zip: req.body.zip,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            isPrivate: req.body.isPrivate,
            geocord: req.body.geocord
        },
        function (err, result) {
            if (err) {
                //when error occurs send 500 -> fatal error
                res.status(500).json();
            } else {
                //res.send(result);
                //if successfull send 204 withput payload
                res.status(204).json({
                });
            }
        }
        //with these options findByIdAndUpdate beaves like a true PUT Method
    ).setOptions({ new: true, overwrite: true });
});

//handles delete request 
router.delete("/:contactId", (req, res, next) => {
    //extract contact id
    const id = req.params.contactId;
    //delete Contact with given id
    Contact.deleteOne({ _id: id })
        .exec()
        .then(result => {
            //display in console
            console.log(result);
            //response with status code 204 
            res.status(204).json();
        })
        .catch(err => {
            //display error in console
            console.log(err);
            //send 500er status -> fatal failure and send error mesage as json object
            res.status(500).json({
                error: err
            })
        });
});

//export router so that it can be used elswhere
module.exports = router;