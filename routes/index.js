/* 
This File will handle all index related routes -> displays startpage when calling http://localhost:3000/
*/

//import express package
const express = require("express");
//setting up express router (sub-package which gives us different ways to handle incoming requests conviently)
const router = express.Router();
//import mongoose
const mongoose = require("mongoose");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Login' });
});

//export router
module.exports = router;