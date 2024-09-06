const express = require('express');
const Candidate = require('../models/candidate');
const User = require('../models/user');
const router = express.Router();
const {jwtAuthMiddleware} = require('../jwt');

const checkAdminRole = async (userId) => {
    try{
        const user = await User.findById(userId);
        return user.role === 'admin';
    }
    catch(err){
        return false;
    }
};

// GET route to see list of candidates
router.get('/', async (req, res) => {
    try{
        const candidates = await Candidate.find({});
        const record = candidates.map((data) => {
            return {
                name: data.name,
                party: data.party,
            }
        })
        res.status(200).json(record);
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
})

// POST route to add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
    try{
        // check if the person is admin or not
        if(! await checkAdminRole(req.userPayload.id))    // yeh run nhi ho rha tha => qki humne isse "await" nhi diya tha qki uper dekho yeh function "async" hai
            return res.status(403).json({message: 'user is not admin'}); 

        // Assuming request body contains candidate data
        const data = req.body;
        
        // create a candidate document
        const newCandidate = new Candidate(data);

        // save the document in the database
        const savedCandidate = await newCandidate.save();
        console.log('candidate added to database');
        res.status(200).json({candidate: savedCandidate});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// PUT route for updating candidate data
router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try{
        // check if the person is admin or not
        if(!checkAdminRole(req.userPayload.id)) 
            return res.status(403).json({message: 'user is not admin'}) 

        const candidateId = req.params.candidateId;
        const updatedData = req.body;

        const response = await Candidate.findByIdAndUpdate(candidateId, updatedData, {
            new: true,
            runValidators: true
        });

        if(!response){
            return res.status(404).json({message: 'Candidate not found'});
        }

        console.log('data updated');
        res.status(200).json({response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// DELETE route for deleting a candidate
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
    try{
        // check if the person is admin or not
        if(!checkAdminRole(req.userPayload.id)) 
            return res.status(403).json({message: 'user is not admin'}) 

        const candidateId = req.params.candidateId;
    
        const response = await Candidate.findByIdAndDelete(candidateId);

        if(!response){
            return res.status(404).json({message: 'Candidate not found'});
        }

        console.log('candidate deleted');
        res.status(200).json({response});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

// Let's start voting
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
    // 1-> admin cannot vote
    // 2-> user can vote only once
    try{
        const userId = req.userPayload.id;
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message: "user not found"});
        }

        if(user.role === 'admin'){
            return res.status(403).json({message: "Admin cannot vote"});
        }

        if(user.isVoted){
            return res.status(400).json({message: "You can vote only once"});
        }

        const candidateId = req.params.candidateId;
        const candidate = await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({message: "candidate not found"});
        }

        candidate.voteCount++; // increment the vote count
        // Update the candidate document to add user who voted 
        candidate.votes.push({user: userId}); // "vote" array hai isiliye "push" use kiya
        await candidate.save();
        
        // update the user document to mark as voted
        user.isVoted = true;
        await user.save();

        console.log('voted successfully');
        res.status(200).json({message: "voted successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"Internal Server Error"});
    }
});

// vote count
router.get('/vote/count', async (req, res) => {
    try{
        // Find all the candidates and sort them by voteCount in descending order
        const candidates = await Candidate.find().sort({voteCount: 'desc'});

        // Map candidates to only return name and voteCount
        const voteRecord = candidates.map((data) => {
            return {
                party: data.party,
                voteCount: data.voteCount
            }
        });
        return res.status(200).json(voteRecord);
    }
    catch(err){
        console.log(err);
        res.status(500).json({message:"Internal Server Error"});
    }
});

module.exports = router;