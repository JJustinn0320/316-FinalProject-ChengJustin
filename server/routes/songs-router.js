const express = require('express')
const SongController = require('../controllers/songs-controller')
const router = express.Router()

router.get('/songArray', SongController.getSongArray)
router.get('/song/:songId', SongController.getSongById)
router.post('/song/:songId', SongController.copySong)
router.post('/song', SongController.createSong)
router.patch('/song/:songId', SongController.editSong)
router.delete('/song/:songId', SongController.deleteSong)

module.exports = router