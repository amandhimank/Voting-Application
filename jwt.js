const jwt = require('jsonwebtoken');
require('dotenv').config(); // isse iss file ko pata chlega .env file ke baare mein

// Function to verify the token
const jwtAuthMiddleware = function(req, res, next) {
    // check the request header has authorization or not
    const authorization = req.headers.authorization;
    if(!authorization) return res.status(401).json({error: 'Token Not Found'}); 

    // extract the token from the request header
    const token = req.headers.authorization.split(' ')[1];

    // got the token => verify it
    try{
        // verify() returns payload if successfully verified the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userPayload = decoded; // adding payload to the request object
        next();
    }
    catch(err){
        return next(err);
    }
};

// Function to generate new token
const generateToken = (userData) => {
    // generate a new token using user data
    return jwt.sign(userData, process.env.JWT_SECRET);
};

module.exports = {jwtAuthMiddleware, generateToken};