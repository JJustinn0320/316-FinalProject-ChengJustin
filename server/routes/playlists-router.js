const express = require('express')
const router = express.Router()

// GET all playlists
router.get('/', (req, res) => {
    res.json({mssg: 'GET all playlists'})
})

// GET a single playlist
router.get('/:id', (res, req) => {
    res.json({mssg: 'GET a single playlist'})
})



module.exports = router