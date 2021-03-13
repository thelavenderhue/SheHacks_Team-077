const { config } = require('dotenv');
const mongoose = require('mongoose');
require("dotenv").config();
const Connect = async () => {
    try {
        //mongodb cloud connection
        const con = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
            useCreateIndex: true
          })

          console.log(`MongoDB connected: ${con.connection.host}`);
    } catch(err) {
        console.log(err);
        process.exit(1);
    }
}

module.exports = Connect;