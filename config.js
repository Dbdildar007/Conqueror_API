const mongoose = require('mongoose');
require('dotenv').config();


 const connect =  async function connect () {
    try{
        await mongoose.connect(process.env.uri);
      

    }catch(err){
        console.log(err);
    }
}


module.exports = connect;