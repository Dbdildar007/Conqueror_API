const mongoose = require('mongoose');
const userSchema = new mongoose.Schema(
  {
    otp: {
        type:Number,
        required:true
    }
  },
  { versionKey: false }
);

const OTP = mongoose.model("Otp", userSchema);

module.exports = OTP;