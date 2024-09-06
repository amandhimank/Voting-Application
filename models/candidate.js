const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    party: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    votes: [ // in this we will store user id who voted along with time when we voted
        {
            user: {
                type: mongoose.Schema.Types.ObjectId, // yeh wo id hai jo mongodb provide krta hai at the time of creation of a document ==> usko 'ObjectId' kehte hai
                ref: 'User', // reference table => yeh id kahan se aayegi User model se
                required: true
            },
            votedAt: {
                type: Date,
                default: Date.now(),
                required: true
            }
        }
    ],
    voteCount: { // jitne objects uper votes mein honge utna hii count hoga
        type: Number,
        default: 0,
        required: true
    }
});

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;