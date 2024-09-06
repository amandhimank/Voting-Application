const mongoose = require('mongoose');
require('dotenv').config(); // YEH LIKHNA BHUL GYA THA ERROR AA GYA THA MONGODB MEIN

const mongoURL = process.env.MONGO_URL_LOCAL;

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// get the default connection object
const db = mongoose.connection;

// Event Handling
db.on('connected', () => {
    console.log("successfully connected to mongodb");
})
db.on('disconnected', () => {
    console.log("successfully disconnected to mongodb");
})
db.on('error', () => {
    console.log("error occurred");
})

module.exports = db;