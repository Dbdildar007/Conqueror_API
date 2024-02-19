require('dotenv').config();
const client = require('twilio')(process.env.accountSid, process.env.authToken, {
    autoRetry: true,
    maxRetries: 3,
});

const express = require('express');
const connect = require('./config.js')
const User = require('./userModel.js')
const OtpModel = require('./otpModel.js')
const Homescreen = require('./homeModel.js')
const Contest_data = require('./ContestModel.js');
const otpGenerator = require('otp-generator')

const Jwt = require('jsonwebtoken');

const app = express();
app.use(express.static('public'));


/** middlewares */
app.use(express.json());

app.disable('x-powered-by'); // less hackers know about our stack


const port = 8080;


/** start server only when we have valid connection */
connect().then(() => {
    try {
        app.listen(port, () => {
            console.log(`Server connected to http://localhost:${port}`);
        })
    } catch (error) {
        console.log('Cannot connect to the server')
    }
}).catch(error => {
    console.log("Invalid database connection...!");
})



//create user profile

app.post('/create_user/profile/fresh', async (req, resp) => {

    try {
        let { team_name, number, profile_pic, state, total_balance, added_cash, bonus, total_kill, winning_percentage } = req.body;
        console.log(team_name);
        await User.findOne({ team_name: team_name }).then((ressss) => {

            if (ressss) {
                resp.status(400).send({ data: "This Team name is already registred try new one." });
            } else {

                let ssv = new User({ team_name, number, profile_pic, state })
                ssv.save().then((response) => {
                    if (response) {
                        Jwt.sign({ response }, process.env.jwdkey, { expiresIn: '2h' }, (err, token) => {
                            if (err) {
                                resp.status(400).send({ result: "someting went wrong try after few minuts" });
                            }
                            resp.status(200).send({ user: response, token: token });
                        })
                    } else {
                        resp.status(404).send({ result: "Getting null value" });
                    }

                }).catch((err2) => {
                    resp.status(400).send({ result: "Getting issue while saving your data" });
                })
            }

        }).catch((err) => {
            resp.status(400).send({ result: "Getting error while Finding team name" });
        })

    } catch (e) {
        resp.status(500).send({ result: "getting fatal error" });
    }
})



//get all users

app.get('/getall_users', async (req, resp) => {

    try {
        await User.find().then((success) => {
            resp.status(200).send({Response:success });
        }).catch((err) => {
            resp.status(200).send({Response:err});
        })
    }
    catch (e) {
        resp.status(500).send({ result: "Getting fatal error" });
    }
})


//get a partiular user data using id.

app.get('/get_user/:id', async (req, resp) => {

    try {
        let id = req.params.id
        await User.findById(id).then((response) => {
            if (response == null) {
                resp.status(200).send({ result: "This id is not associated with any user" });
            }
            else {
                resp.status(200).send({ response });
            }
        }).catch((error) => {

            resp.status(200).send({ result: "Getting error while finding the data", Response:error });
        })

    }
    catch (e) {
        resp.status(200).send({ result: "Getting fatal error", Response:e });
    }
})

///delete a user by id

app.delete('/delete/user/:id', async (req, resp) => {
    try {
        let id = req.params.id;
        await User.findByIdAndDelete(id).then((response) => {
            if (response) {
                resp.status(200).send({ result: "Successfully deleted 1 items", Response: response })
            }
            else {
                resp.status(300).send({ result: "Already deleted this item", Response: response });
            }

        }).catch((error) => {
            resp.status(400).send({ result: "Seems like this id is not associated with any data", Response:error });
        })
    }
    catch (e) {
        resp.status(500).send({ result: "Getting fatal error", Response:e });
    }
})

//update by id

app.put('/update_user/:id', async (req, resp) => {
    try {
        let id = req.params.id;
        let data = req.body;
        let { team_name, number, profile_pic, state, total_balance, added_cash, bonus, total_kill, winning_percentage } = data;

        await User.findByIdAndUpdate(id, { team_name, number, profile_pic, state, total_balance, added_cash, bonus, total_kill, winning_percentage })
            .then((response) => {
                resp.status(200).send({ result: "Update values successfully", Response: response });
            }).catch((error) => {
                resp.status(400).send({ result: "Getting some issue while updating values", Response:error })
            })
    } catch (e) {
        resp.status(500).send({ result: "Gettign fatal error", Response:e })
    }
})

//TO  create the bonus balance referral user account

app.post('/Referal/Account/bonus', (req, resp) => {

    try {
        let team_name = req.body.team_name;
        User.updateOne({ team_name: team_name },
            { $inc: { bonus: 50 } }).then((response) => {
                console.log(response.modifiedCount);
                if (response.modifiedCount == 1) {
                    resp.status(200).send({ result: "Amount added successfully", Response: response })
                } else {
                    resp.status(300).send({ result: "Please Enter right referal code", Response: response });
                }

            }).catch((err) => {
                resp.status(400).send({ result: "Getting some issue while updating bonus banlance", Response:err });
            })

    } catch (e) {
        resp.status(500).send({ result: "Getting fatal error.", Response:e });
    }
});

//To send otp on mobile and save otp in database.

app.post('/newuser/number/otp', async (req, resp) => {
    try {
        const number = req.body.number;
        const existing = await User.findOne({ number });
        if (existing) {
            return resp.status(200).send({ result: "This number is already registered try with new number" });
        }
        else {
            let ottp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });

            let data = new OtpModel({ otp: ottp });
            await data.save().then((rr) => {
                console.log(rr);
            }).catch((errr) => {
                console.log(errr);
            })
            client.messages
                .create({
                    body: `OTP to verify mobile number in conqueror is :${ottp}.`,
                    from: '+12565308928',
                    to: `+91${number}`
                })
                .then((message) => {
                    resp.status(200).send({ result: "Please check your phone OTP has been send.", Response: message.sid })
                }).catch((error) => {
                    resp.status(400).send({ result: "Having some issue while sending otp on mobile", Response: 'getting issue while send msg' + error });
                })
        }
    }
    catch (e) {
        resp.status(500).send({ result: "error in catch", Response:e });
    }
})



//Verify otp for fresh user only.

app.post('/verify/register/user/otp', async (req, resp) => {
    try {
        const otp = req.body.otp;
        const result = await OtpModel.findOneAndDelete({ otp })
        if (result) {
            resp.status(200).send({ result: "Verified", Response: result })
        }
        else {
            resp.status(400).send({ result: "Incorrect otp.", Response: result });
        }

    } catch (e) {
        resp.status(500).send({ result: "Getting fatal issue", Response:e });
    }
})

//Verify otp for login users.


//login using number  and sending otp as well as .

app.get('/login/number', async (req, resp) => {

    try {
        let number = req.body.number;
        console.log(number);
        await User.findOne({number:number}).then((response) => {
            if (response) {
                let ottp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false });
                let data = new OtpModel({ otp: ottp });
                data.save().then((rr) => {
                    console.log(rr);
                }).catch((errr) => {
                    console.log(errr);
                })
                client.messages
                    .create({
                        body: `OTP to verify mobile number in conqueror is :${ottp}.`,
                        from: '+12565308928',
                        to: `+91${number}`
                    })
                    .then((message) => {
                        Jwt.sign({ response }, process.env.jwdkey, { expiresIn: '2h' }, (err, token) => {
                            if (err) {
                                resp.status(400).send({ result: "someting went wrong try after few minuts" });
                            }
                            resp.status(200).send({ result: "Otp has been send to your mobile number", Response: response, token: token });
                        })

                    }).catch((error) => {
                        resp.status(400).send({ result: "Having some issue while sending otp on mobile", Response:error });
                    })
            } else {
                resp.status(400).send({ result: "number is not registred yet"});
            }

        }).catch((error) => {
            resp.status(400).send({ result: "number is not registred yet",Response:error});
        })

    }
    catch (e) {
        resp.status(500).send({result:"having fatal error",Response:e});
    }
})




//creating contest.

app.post('/create_content', async (req, resp) => {
    
    try {
        const { Contest_id, map, time, player_number_img, versus_img, huge, kind_of, perspective } = req.body;
        const data = await Homescreen({
            Contest_id, map, time, player_number_img, versus_img, huge, kind_of, perspective
        });

        data.save().then((response) => {
            resp.status(200).send({result:"Added contest successfully",Response:response})

        }).catch((error) => {
           resp.status(400).send({result:"Having some issue while saving the contest data.",Response:error});
        })

    }
    catch(e){
        resp.status(500).send({result:"Getting fatal error.",Response:e});
    }

})

//get all contests

app.get('/get/all_contests', async (req, resp) => {

    try {
        await Homescreen.find().sort("-time").then((response) => {
            resp.status(200).send({result:"Successfully getting data",Response:response});
        }).catch((error) => {
            resp.status(404).send({result:"Data not faund.",Response:error});
        })
    }
    catch(e) {
        resp.status(500).send({result:"Having fatal error",Response:e});
    }
})


// delete contest using id//
app.delete('/delete/contest/:id', async (req, resp) => {

    try {
        let id = req.params.id;
        await Homescreen.findByIdAndDelete(id).then((response) => {
            resp.status(200).send({result:"One item is deleted successfully.",Response:response})
        }).catch((error) => {
            resp.status(400).send({result:"Having issue while deleting",Response:error});
         
        })
    }
    catch(e){
        resp.status(500).send({result:"Getting fatal error",Response:e});
    }
})



//update contest using id

app.put('/update/contest/:id', async (req, resp) => {

    try {
        const { Contest_id, map, time, player_number_img, versus_img, huge, kind_of, perspective } = req.body;
        let data = { Contest_id, map, time, player_number_img, versus_img, huge, kind_of, perspective };

        let id = req.params.id;
       
        await Homescreen.findByIdAndUpdate(id, { $set: data }, { new: true }).then((response) => {
            resp.status(200).send({result:"Updated data successfully.",Response:response});
        }).catch((error) => {
            resp.status(400).send({result:"Having issue while updating",Response:error});
        })
    }
    catch(e){
        resp.status(500).send({result:"Getting fatal error",Response:e});
    }
})


//get contest by id

app.get('/getby_id/:id', async (req, resp) => {

    try {
        let id = req.params.id;
        await Homescreen.findById(id).then((response) => {
            resp.status(200).send({result:"Getting data",Response:response});
        }).catch((error) => {
            resp.status(400).send({result:"Having some issue while picking data.",Response:error});
        })

    }
    catch(e){
        resp.status(500).send({result:"Getting fatal issue.",Response:e});
    }
})


// create box for contest datum


app.post('/create_contest_box', async (req, resp) => {

    try {

        const { Prize_Pool, Entry, total_sports, first_place, winning_percentage, map } = req.body;

        let data = { Prize_Pool, Entry, total_sports, first_place, winning_percentage, map };

        const rr = await Contest_data({ data });

        rr.save().then((response) => {
            resp.status(200).send({result:"created successfully.",Response:response});
        }).catch((error) => {
            resp.status(400).send({result:"Having issue while creating the contest box.",Response:error});
        })
    }
    catch(e){
        resp.status(500).send({result:"Having fatal issue.",Response:e});
    }

})

//get all boxes

app.get('/getall_contest_box', async (req, resp) => {

    try {
        await Contest_data.find().then((response) => {
            resp.status(200).send({result:"These are the contest box data.",Response:response});
        }).catch((error) => {
            resp.status(400).send({result:"Having some issue while picking data.",Response:error});
        })
    }
    catch(e){
        resp.status(500).send({result:"Getting fatal issue.",Response:e});
    }
})

//delete all contest box

app.delete('/delete/all_contest_box', async (req, resp) => {

    try {
        await Contest_data.deleteMany().then((response) => {
            resp.status(200).send({result:"deleted 1 item",Response: response.deletedCount});
        }).catch((error) => {
            resp.status(400).send({result:"Having some issue while deleting",Response:error});
        })
    }
    catch(e){
        resp.status(500).send({result:"Having fatal issue.",Response:e});
    }
})


//add leages using contest box ids

app.post('/contest_box/league_data/:id', async (req, resp) => {
try{
    let id = req.params.id;
    const { Prize_Pool, Entry, total_sports, first_place, winning_percentage, map } = req.body;

    let data = { Prize_Pool, Entry, total_sports, first_place, winning_percentage, map };

    const addeddata = await Contest_data.findByIdAndUpdate(id, {
        $push: { data }
    });
    if (addeddata) {
        resp.status(200).send({result:"added this data succeccfully",Response:addeddata});
    }
    else {
        resp.status(404).send({result:"Issue occured while pushing the data.",Response:null});
    }
}catch(e){
    resp.status(500).send({result:"Having fatal issue",Response:e});
}

});


//Update the value of a particular league

app.patch('/contest_box/league_data/update/:id', async (req, resp) => {

    try {
        let id = req.params.id;
        console.log(id);
        await Contest_data.findOneAndUpdate(
            { 'data._id': id },
            { $set: { 'data.$': req.body } },
            { new: true }
        ).then((response) => {
            resp.status(200).send({result:"New value updated successfully.",Response:response});
        }).catch((error) => {
            resp.status(400).send({result:"getting error while updating the values",Response:error});
        })
    }
    catch(e){
        resp.status(500).send({result:"Fatal issue",Response:e});
    }
})

//delete a particular league data

app.post('/contest_box/league_data/delete/:id', async (req, resp) => {

    try {
        let id = req.params.id;
        let data_id = req.body.data_id
        console.log(id, "body ", data_id)
        await Contest_data.findOneAndUpdate(
            { _id: id },
            { $pull: { data: { _id: data_id } } },
            { new: true }
        ).then((response) => {
            resp.status(200).send({result:"deleted successfully.",Response:response.deletedCount});
        }).catch((er) => {
            resp.status(400).send({result:"getting issue while deleting this data",Response:er});
        })
    }
    catch (e) {
        resp.status(500).send({result:"Fatal issue occured.",Response:e});
    }
})


// get all leagues from a particular data array

app.get('/contest_box/league_data/all_league/:id', async (req, resp) => {

    try {
        let id = req.params.id;
        await Contest_data.findById(id).then((response) => {
            resp.status(200).send({Response:response});
        }).catch((error) => {
            resp.status(400).send({result:"Having some issue while picking data",Response:error});
        })
    }
    catch(e){
       resp.status(500).send({result:"Fatal issue occured",Response:e});
    }
})


// get all otp only


app.get('/getall_otp', async (req, resp) => {
    try {

        await OtpModel.find().then((response) => {
            resp.status(200).send({ msg: response });
        }).catch((error) => {
            resp.status(400).send({ msg: error })
        })

    }
    catch (e) {
        resp.status(404).send({ msg: 'issue is occuring there in catch' + e });
    }
})

