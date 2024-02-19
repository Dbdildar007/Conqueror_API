const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
  {
    Contest_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contest_data",
        required:true
    },
    map: {
      type: String,
      trim: true,
      required:true
    },
    time:{
        type:String,
        required:true
    },
    player_number_img: {
      type:String,
      required:true
    },
    versus_img:{
      type:String,
      required:true
    },
    huge:{
        type:String,
        required:true
    },
    kind_of:{
        type:String,
        required:true
    },
    perspective:{
        type:String,
        required:true
    },  
  },
  { timestamps: true },
  { versionKey: false }
);

const Homescreen = mongoose.model("Homescreen", userSchema);
module.exports = Homescreen;

