const express = require('express')
const PlaylistController = require('../controllers/playlists-controller')
const router = express.Router()

router.post('/playlist', PlaylistController.createPlaylist)
router.delete('/playlist/:id', PlaylistController.deletePlaylist)
router.patch('/playlist/:id', PlaylistController.editPlaylist)
router.get('/playlists', PlaylistController.getPlaylists)
router.get('/playlist/:id', PlaylistController.getPlaylistById)
router.get('/playlistpairs', PlaylistController.getPlaylistPairs)

module.exports = router