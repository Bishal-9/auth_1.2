require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')

const app = express()

mongoose.connect(
    process.env.DB_CONN_STRING,
    () => console.log('Connected to MongoDB!!')
)

// middleware
app.use(express.json())

// routes
const auth_routes = require('./routes/auth.route')
const user_routes = require('./routes/user.route')

app.use('/v1/auth', auth_routes)
app.use('/v1/user', user_routes)

app.listen(3000, () => console.log(`Server is running on http:localhost:3000`))
