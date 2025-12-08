const express = require('express')
const SongController = require('../controllers/songs-controller')
const router = express.Router()

router.get('/songArray', SongController.getSongArray)
router.post('/song', SongController.createSong)

module.exports = router