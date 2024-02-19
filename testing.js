

import express, { response } from 'express'
import connect from './config.js'

import User from './userModel.js'
import OtpModel from './otpModel.js'
import Homescreen from './homeModel.js'
import Contest_data from './ContestModel.js'
import OTP from 'otp-generator'
import Jwt from 'jsonwebtoken'