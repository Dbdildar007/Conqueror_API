const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
  {
    data: [{
        Prize_Pool:{ 
            type: Number,
            required:true,
        },
        Entry: { 
            type:Number,
            required:true
        },
        total_sports:{
            type:Number,
            required:true
        },
        first_place:{
            type:Number,
            required:true
        },
        winning_percentage:{
            type:String,
            required:true
        },
        map:{
            type:String,
            required:true
        }

    }]
  },
  {timestamps:true},
  { versionKey: false }
);

const Contest_data = mongoose.model("Contest_data", userSchema);

module.exports = Contest_data;
