const express = require('express')
const userRouter = require('./routers/user')
const cors = require('cors')
require('./db/db')

const app = express()

app.use(express.json())
app.use(cors)
app.use(userRouter)
app.listen(process.env.PORT||3000, () => {
    console.log(`Server running on Heroku`)
})