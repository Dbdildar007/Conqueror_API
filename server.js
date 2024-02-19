import express, { response } from 'express'
import connect from './config.js'

import User from './userModel.js'
import { ObjectId } from 'mongoose';
const app = express();


/** middlewares */
app.use(express.json());

app.disable('x-powered-by'); // less hackers know about our stack


const port = 8080;

/** HTTP GET Request */
app.get('/', (req, res) => {
    res.status(201).json("Home GET Request");
});

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

/*const data = new User({username:'dildarhussain',number:'9199292992'});
let result = data.save().then((res)=>{
    console.log(res)
}).catch((err)=>{
    console.log(err)
});*/

/*
let ff = User.findById('64fc9ad8de73f48a7d479dfa').then((res)=>{
    console.log(res)
}).catch((err)=>{
    console.log(err)
})*/
/*
User.findByIdAndDelete('64fc9ad8de73f48a7d479dfa').then((resp)=>{
    console.log(resp)
}).catch((err)=>{
    console.log(err)
})*/


/*
let s = new User({username:'diididdi',number:'8271289383',Balance:20})

let result = s.save().then((resp)=>{
    console.log(resp)
}).catch((err)=>{
    console.log(err);
});
*/



/*
User.updateOne({username:'diididdi'}, 
    {$inc:{Balance:5}}).then((respo)=>{
        console.log(respo)
    }).catch((err)=>{
        console.log(err)
    });
    */

    app.get('/inc', (req, res) => {

        try{
            User.updateOne({username:'diididdi'},
            {$inc:{Balance:100}}).then((response)=>{
                console.log(response)
            }).catch((err)=>{
                console.log('eeror',err)
            })

        }catch{

            res.send('getting error');
        }

        res.status(200).send(response);
    });



    app.post('/number',(req,resp)=>{
        console.log(req);
    })

    console.log('hellp')