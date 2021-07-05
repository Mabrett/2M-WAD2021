/* 
This File will handle all user related routes
*/

//import express package
const express = require("express");
//setting up express router (sub-package which gives us different ways to handle incoming requests conviently)
const router = express.Router();
//import mongoose
const mongoose = require("mongoose");
//import User Constructor
const User = require("../models/user");


//handles POST for login
router.post("/login", function (req, res, next) {
    //get username and password from received body
    const userName = req.body.username;
    const password = req.body.password;
    //log credentials in console
    //console.log(userName + password);
    //search user in DB with given credentials 
    User.find({ userId: userName, password: password }, (error, arrayOfResults) => {
        if (error) {
            console.log(error)
            //send status 500 -> fatal error + attach error message as json
            res.status(500).json({
                error: err
            });
        }
        //if user was not found
        else if (arrayOfResults.length < 1) {
            //send 401
            res.status(401).json("Auth Failed");
        }
        //if user was found 
        else {
            //if user is flagged as admin
            if (arrayOfResults[0].role === "admin") {
                //return 200 -> all good and send role of user -> admin
                return res.status(200).json({
                    message: "Auth successful",
                    role: "admin"
                });
            }
            //if user is no admin
            else {
                //return 200 -> all good and send role of user -> non-admin
                return res.status(200).json({
                    message: "Auth successful",
                    role: "non-admin"
                });
            }
        }
    })
});

//export router so that it can be used elswhere
module.exports = router;