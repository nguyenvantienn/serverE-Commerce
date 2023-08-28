 const express = require('express')
 require('dotenv').config()
const dbConnect = require('./config/dbconnect')
const initRoutes = require('./routes')
const cookieParser = require('cookie-parser')



 const app = express();
 const port = process.env.PORT || 8888;

 //Tương tác dc vs Cookie
 app.use(cookieParser());
 app.use(express.json());
 app.use(express.urlencoded({extended : true}))

 dbConnect()
 initRoutes(app)

 app.listen(port , ()=>{
    console.log('Server is running on ', + port);
 })