const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const bodyparser = require('body-parser');
const fileUpload = require('express-fileupload')
const dotenv = require("dotenv");
const path = require("path")


//Setting
dotenv.config({path: 'backend/config/config.env'});


//app.use(bodyparser.urlencoded({ extended: true }))
app.use(bodyparser.json({ limit: '50mb' }))
app.use(bodyparser.urlencoded({ limit: '50mb', extended: true,  }))//parameterLimit: 50000
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Authorization, Accept");
//     res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, HEAD, OPTIONS");  
//     next();
//   });



//imporrt middleware
const errorMiddleware = require("./middlewares/errorMiddleware");


//Imporrt all route
const products = require("./routes/productRoute");
const authUser = require("./routes/authUserRoute");
const payment = require("./routes/paymentRoute");
const order = require("./routes/orderRoute");



app.use("/api/v1", products);
app.use("/api/v1", authUser);
app.use("/api/v1", payment);
app.use("/api/v1", order);

if(process.env.NODE_ENV === "PRODUCTION") {
    app.use(express.static(path.join(__dirname, '../frontend/build')))

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend/build/index.html'))
    })
}

//Middleware to handler error
app.use(errorMiddleware)

module.exports = app