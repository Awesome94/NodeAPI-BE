const router = require('express').Router();
const User = require('../model/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res)=>{
    const userExists = await User.findOne({username: req.body.username})

    if(userExists) return res.status(400).send('Email already exists');
    
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const user = new User({
        username: req.body.username,
        password: hashPassword
    });
    try{
        const savedUser = await user.save()
        res.send({user:user._id})
    }catch(err){
        res.status(400).send(err);
    }
});

router.post('/login/:username/:password', async (req, res)=>{
    // returns jwt token  as a Bearer token
    const user = await User.findOne({username: req.params.username})
    if(!user) return res.status(400).send('Username or Password is wrong');
    const validpass = await bcrypt.compare(req.params.password, user.password);
    if(!validpass) return res.status(400).send('Password is wrong');

    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.header('Bearer', token).send({"Bearer":token});

    res.send('successfully logged in')
});

module.exports = router;