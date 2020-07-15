const express = require('express')
const User = require('../models/User')
const auth = require('../middleware/auth')
const router = express.Router()
//create new user
router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})
//login a registered user
router.post('/users/login', async(req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findByCredentials(email, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }

})
//get current users details
router.get('/users/me', auth, async(req, res) => {
    res.send({"name":req.user.name,
    "skills":req.user.skills,
    "hobbies":req.user.hobbies,
    "age":req.user.age,
    "gender":req.user.gender,
    "branch":req.user.branch,
    "bio":req.user.bio,
    "yop":req.user.yop,
    
})
})
//get another users details
router.get('/users/:id', auth, async (req, res) => {
    try {
        const users = await User.findById(req.params.id).select(["name", "_id","age","branch","yop","bio","gender","skills","hobbies"])
        res.status(200).json(users)

    }

    catch (err) {
        res.status(404).json({ err: "No User Or Server Error" })
    }

})


//update a user
router.patch('/users', auth, async(req,res)=>{
    const userDetails = req.body
    await User.findByIdAndUpdate(req.user._id,{...userDetails})
    res.status(200).send("User updated")
})
//logout user
router.post('/users/me/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send('Successfully logged out')
    } catch (error) {
        res.status(500).send(error)
    }
})
//logout of all devices
router.post('/users/me/logoutall', auth, async(req, res) => {
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send('Logged out of all devices')
    } catch (error) {
        res.status(500).send(error)
    }
})
//send requests
router.post('/users/send',auth,async (req,res)=>{
    try{
     await User.updateOne({_id:req.body.id},{
        $push:{"requests":{user_id:req.user._id,name:req.user.name}}
    }).then(res=>console.log(res)) 
    await User.updateOne({_id:req.user._id},{
        $push:{"requested":{user_id:req.body.id,name:req.body.name}}
    }).then(res=>console.log(res))
    res.send("Request Sent")
}
catch(err){
    console.log(err)
}
})

//accept request
router.post('/users/accept',auth,async (req,res)=>{
    const users = await User.findById(req.body.id).select(["name","age","branch"])
    console.log(users)
    try{ 
            await User.updateOne({_id:req.body.id},{
                $pull:{"requested":{user_id:req.user._id}},
                $push:{"matches":{user_id:req.user._id,name:req.user.name}}
            })

            await User.updateOne({_id:req.user._id},{
                $pull:{"requests":{user_id:req.body.id}},
                $push:{"matches":{user_id:req.body.id,name:users.name}}
            })
            res.send("Request Accepted")
}
catch(err){
    res.send(err)
}

})

//cancel request
router.post('/users/cancel',auth,async (req,res)=>{
    try{
        await User.updateOne({_id:req.body.id},{
            $pull:{"requested":{user_id:req.user._id}}
        })
        await User.updateOne({_id:req.user._id},{
            $pull:{"requests":{user_id:req.body.id}}
        })
        res.send("Request Cancelled")
    }
    catch(err){
        res.status(500).send("Error Occurred")
    }
})
module.exports = router