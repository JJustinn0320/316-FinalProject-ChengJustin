const express = require('express')
const PlaylistController = require('../controllers/playlists-controller')
const router = express.Router()
const auth = require('../auth')

router.post('/playlist', PlaylistController.createPlaylist)
router.delete('/playlist/:playlistId', PlaylistController.deletePlaylist)
router.patch('/playlist/:playlistId', PlaylistController.editPlaylist)
router.get('/playlists', PlaylistController.getPlaylists)
router.get('/playlist/:playlistId', PlaylistController.getPlaylistById)
router.get('/playlistArray', PlaylistController.getPlaylistArray)
router.post('/:playlistId/songs', PlaylistController.addSongToPlaylist);
router.delete('/:playlistId/songs/:songId', PlaylistController.removeSongFromPlaylist);

module.exports = router