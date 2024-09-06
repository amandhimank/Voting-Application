const express = require('express');
const User = require('../models/user');
const router = express.Router();
const {jwtAuthMiddleware, generateToken} = require('../jwt');

// SIGNUP ROUTE
router.post('/signup', async (req, res) => {
    try{
        const data = req.body;

        // make sure there is only one admin
        if(data.role === 'admin'){
            const admin = await User.findOne({role: 'admin'});
            if(admin){
                return res.status(404).json({message: "there is already an admin, create account as a voter"});
            }
        }

        // creating a new user using the mongoose model
        const newUser = new User(data);

        // save the new user data to the database
        const savedUser = await newUser.save();
        console.log('data saved');

        // generate a token
        const payload = {
            id: savedUser.id
        };
        const token = generateToken(payload);
        console.log('Token: ', token);

        res.status(200).json({response: savedUser, token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});

    }
})

// LOGIN ROUTE
router.post('/login', async (req, res) => {
    try{
        // Extract aadhar and password from the request body
        const {aadharCardNumber, password} = req.body;

        // Find user by aadhar card number
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});

        // If user does not exists or password doesnt match, return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error: "Invalid username or password"});
        } 

        // generate a new token
        const payload = {
            id: user.id
        }
        const token = generateToken(payload);
        res.send(json);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// PROFILE ROUTE => protected route hai yeh ==> toh yeh pehle yeh jwtAuthMiddleware chalga and usme humne userPayload add kiya tha wo use krenge yahan pe ==> userPayload mein id add ki thi humne
router.get('/profile', jwtAuthMiddleware, async (req, res) => {
    try{
        const userData = req.userPayload;

        const userId = userData.id;
        const user = await User.findById(userId);

        res.status(200).json(user);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// CHANGE PASSWORD ROUTE
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
    try{
        const userId = req.userPayload.id;
        const {currentPassword, newPassword} = req.body; // extract current and new password from the request body => password change krte samay wo purana password mangta hai humne bahut jagah dekha hai

        //  Find the user by id
        const user = await User.findById(userId);

        // check if current password provided matches with the acutal password
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error: "Invalid current password"});
        }
        
        // current password matches, now change the passowrd with new password
        user.password = newPassword;
        await user.save();

        console.log('password updated');
        res.status(200).json({message: "Password updated successfully!"})
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

module.exports = router;