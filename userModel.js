const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
  {
    team_name: {
      type: String,
      trim: true,
      required:true
    },
    number: {
      type: String,
      required:true
    },
    profile_pic:{
      type:String,
    },
    state:{
      type:String,
      required:true
    },
    total_balance:{
      type:Number,
      default:0
    },
    added_cash:{
      type:Number,
      default:0
    },
    withdrawable_amount:{
      type:Number,
      default:0
    },
    bonus:{
      type:Number,
      default:50
    },
    total_kill:{
      type:Number,
      default:0
    },
    winning_percentage:{
      type:String,
      default:"0"
    },
  },
  {timeseries:true},
  { versionKey: false }
);

const User = mongoose.model("User", userSchema);

module.exports = User;