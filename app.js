/* 
This File spinns up the express application and will handle most incoming requests
 */

//import express package
const express = require("express");
//starting the express application
const app = express();
//import morgan package
const morgan = require("morgan");
//import mongoos
const mongoose = require("mongoose");
//import indexRoutes
var indexRoutes = require('./routes/index');
//import usersRoutes
var usersRoutes = require('./routes/users');
//import contactRoutes
var contactRoutes = require("./routes/contacts");

//connect to Mongo DB
mongoose.connect("mongodb://localhost:27017/advizDB", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false});

//telling express to funnel all requests through morgen to log everything on console
app.use(morgan("dev"));
//allows us to parse html-bodys
app.use(express.urlencoded({ extended: false }));
//allows us to parse json
app.use(express.json());
//for serving static content via express
app.use(express.static('public'));

//funnel every request through the following to prevent CORSE-Errors (Cross-Origin Resource Sharing)
app.use((req, res, next) => {
    //adding headers to the response so that these information will be send with EVERY response we send
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    //checking if incoming request does match the responses we offer
    if(req.method === "OPTIONS"){
        //tell the browser which methods he can use
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});    
    }
    //next() has to be called here so that the other routes can take over
    next();
});

/*
Middleware
*/

//anything starting with /index will be forwarded to the given handler indexRoutes
app.use("/index", indexRoutes);
//anything starting with /users will be forwarded to userRoutes
app.use('/users', usersRoutes);
//anything starting with /contacts will be forwarded to contactRoutes
app.use('/contacts', contactRoutes);

/* 
ERROR HANDLING
*/

//anything starting with /index will be forwarded to the given handler indexRoutes
/* every request which reaches this line could not be handled by the other routes -> error handling starts here */
app.use((req, res, next) => {
    //error will be returned
    const error = new Error("Not found");
    //sending status 404 -> not found
    error.status = 404;
    //execute next function -> forwarding this error request
    next(error);
});

/* will handle every kind of erros thrown in the application */
app.use((error, req, res, next) => {
    //return error status depending on the code or if not found -> 500
    res.status(error.status || 500);
    res.json({
        //error object for json
        error: {
            //passing the error message we did get passed as an argument
            message: error.message
        }
    });
});

//exporting app so that it can be used in other files
module.exports = app;