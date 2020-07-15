const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error({error: 'Invalid Email address'})
            }
        }
    },
    age:{
        type:Number
    },
    mobileNo:{
        type: Number,
        required: true,
        unique: true,
    },
    college: {
        type: String
    },
    branch: {
        type: String
    },
    yop:{
        type: Number
    },
    bio:{
        type: String
    },
    gender: {
        type: String,
        required: true,
        enum: ['m', 'f', 'o']
    },
    skills:{
        type:Array,
        maximum:5
    },
    hobbies:{
        type:Array,
        maximum:5
    },
    requested:[{
        user_id:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
        name:{type:String}
    }],
    requests:[{
        user_id:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
        name:{type:String}
    }],
    matches:[{
        user_id:{type:mongoose.Schema.Types.ObjectId, ref:'User'},
        name:{type:String}
    }],
    password: {
        type: String,
        required: true,
        minLength: 7
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
})

userSchema.pre('save', async function (next) {
    // Hash the password before saving the user model
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.methods.generateAuthToken = async function() {
    // Generate an auth token for the user
    const user = this
    const token = jwt.sign({_id: user._id}, 'WinterIsComing2019')
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    // Search for a user by email and password.
    const user = await User.findOne({ email} )
    if (!user) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User