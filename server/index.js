require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')

// creates express app
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(express.json())

// middleware
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}))
app.use(express.json())

// routes
const playlistRoutes = require('./routes/playlists-router')
app.use('/api/playlist-store', playlistRoutes)
// const songRoutes = require('./routes/songs-router')
// app.use('/api/songs-store', songRoutes)
// const authRoutes = require('./routes/auth-router')
// app.use('/api/users-store', authRoutes)

// connect to db
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        // listen for requests on port (from .env)
        app.listen(process.env.PORT, () => {
            console.log(`connected to db and listening on port ${process.env.PORT}`)
        })
    })
    .catch((error) => {
        console.log("db connection error: ", error)
    })


