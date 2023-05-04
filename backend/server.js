const app = require("./app")
const mongoose = require('mongoose');
const cloudinary = require('cloudinary');
const connectDatabase = require("./config/database")


const dotenv = require("dotenv")

//Handle Uncaught exception
process.on("uncaughtException", err =>{
    console.log(`ERROR: ${err.message}`);
    console.log("Shuting donwload due to Uncaught exception");
    process.exit(1)
})


//Setting
dotenv.config({path: 'backend/config/config.env'});


//Connect Database
connectDatabase();

//setup cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


const server =  app.listen(process.env.PORT, () =>{
    console.log(`Server started on Port: ${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
})

//Handle Unhandled Promise Rejections
process.on("unhandledRejection", err =>{
    console.log(`Error: ${err.message}`);
    console.log("Shuting donwload the server due to unhandled Promise Rejections");
    server.close(() => {
        process.exit(1)
    })
})