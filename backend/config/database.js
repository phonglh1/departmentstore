const mongoose = require('mongoose');


const connectDatabase = () => {
    //mongoose.connect(process.env.DB_LOCAL_URI, {
    mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        //useCreateIndex: true
        useCreateIndex: true
    }).then(con => {
        console.log(`MongoDB Database connected with HOST: ${con.connection.host}`)
    })
    // const nameDB = "shopit";
    // mongoose.connect("mongodb://127.0.0.1:27017/"+nameDB, (error)=>{
    //     if (error) throw error;
    //     console.log('Successfully connected to DB: ' + nameDB);
    // })
}

module.exports = connectDatabase;