const mongoose = require('mongoose')

mongoose.connect('mongodb+srv://ashish:Ashish@2001@cluster0.p30vt.mongodb.net/user?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
})