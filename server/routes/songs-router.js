const express = require('express')
const SongController = require('../controllers/songs-controller')
const router = express.Router()

router.get('/songArray', SongController.getSongArray)
router.post('/song', SongController.createSong)
router.patch('/song/:songId', SongController.editSong)
router.delete('/song/:songId', SongController.deleteSong)

module.exports = router