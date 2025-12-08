const express = require('express')
const SongController = require('../controllers/songs-controller')
const router = express.Router()

router.get('/songArray', SongController.getSongArray)
router.post('/song', SongController.createSong)
// router.post('/playlist/:id', SongController.addToPlaylist)
// router.post('/song/:id', SongController.editSong)
// router.post('/song/:id', SongController.deleteSong)

module.exports = router