const express = require('express')
const PlaylistController = require('../controllers/playlists-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/playlist', auth.verify, PlaylistController.createPlaylist)
router.delete('/playlist/:id', auth.verify, PlaylistController.deletePlaylist)
router.patch('/playlist/:id', auth.verify, PlaylistController.editPlaylist)
router.get('/playlists', auth.verify, PlaylistController.getPlaylists)
router.get('/playlist/:id', auth.verify, PlaylistController.getPlaylistById)
router.get('/playlistpairs', auth.verify, PlaylistController.getPlaylistPairs)

module.exports = router