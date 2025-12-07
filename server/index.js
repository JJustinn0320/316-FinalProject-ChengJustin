require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

// creates express app
const app = express()

// middleware
app.use(cors({
    origin: "http://localhost:3000", // Your frontend URL
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Body parsers (to read req.body)
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// 3. Cookie parser (to read req.cookies)
app.use(cookieParser());

// routes
const playlistRoutes = require('./routes/playlists-router')
app.use('/api/playlist-store', playlistRoutes)
// const songRoutes = require('./routes/songs-router')
// app.use('/api/songs-store', songRoutes)
const authRoutes = require('./routes/auth-router')
app.use('/api/auth', authRoutes)

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


