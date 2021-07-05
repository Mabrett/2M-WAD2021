/* 
This File is for setting up the Server and make it operational
*/

//import http package
const http = require("http");
//import app from app.js
const app = require("./app");
//setting up port on which the server is running
const port = process.env.PORT || 3000;
//setting up server, passing listener (request handler) in function
const server = http.createServer(app);
//start server
server.listen(port);
console.log("Server listening on Port :" + port);