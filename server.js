const express = require('express');
const app = express();
const path = require('path');
const ejs = require('ejs');
require('dotenv').config();
const db = require('./db');

const  bodyParser = require('body-parser');
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, 'public'))); 1 

app.get('/', (req, res) => {
    res.send('Home page');
});

// Import the route files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

// Use the routers
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes); // candidate routes ko woii access krr skta hai jiska role="admin" ho.

app.listen(PORT, () => {
    console.log("listening on port");
});





