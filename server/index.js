require('dotenv').config()

const express = require('express')

// creates express app
const app = express()

// middleware
app.use(express.json())
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})

// routes
const playlistRoutes = require('./routes/playlists-router')
app.use('/api/playlist-store', playlistRoutes)

// listen for requests on port (from .env)
app.listen(process.env.PORT, () => {
    console.log(`listening on port ${process.env.PORT}`)
})

