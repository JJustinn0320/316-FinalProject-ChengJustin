const mongoose = require('mongoose')
const Playlist = require('../models/playlist-model')
const User = require('../models/user-model')
const Song = require('../models/song-model')
const auth = require('../auth')

const createPlaylist = async (req, res) => {
    console.log('create playlist')
    let id = auth.verifyUser(req)
    console.log(id)
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log('verified')
    console.log(req.body)
    const {name, ownerUsername, ownerEmail, songs, listens, guestHasListened} = req.body
    
    if(!name || !ownerUsername || !ownerEmail || guestHasListened === undefined){
        console.log(`name:${name}, email:${ownerEmail}, guestHasLis:${guestHasListened}`)
        return res.status(400).json({error: "Required fields missing"})
    }
    if (songs && !Array.isArray(songs)) {
        return res.status(400).json({ 
            error: "Songs must be an array" 
        });
    }
    if (listens && !Array.isArray(listens)) {
        return res.status(400).json({ 
            error: "listens must be an array" 
        });
    }

    try{
        const user = await User.findById(id);
        if (!user) {
            console.log('user' + user)
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        const playlist = await Playlist.create({name, ownerUsername, ownerEmail, songs, listens, guestHasListened})
        console.log('created playlist')

        const updatedPlaylists = [...user.playlists, playlist._id];
        await User.findOneAndUpdate( 
            { _id: id },
            { playlists: updatedPlaylists },
            { new: true }
        );
        console.log('updated playlist')

        res.status(200).json(playlist)
    }
    catch(error){
        res.status(400).json({error: error.message})
    }
}
const deletePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
}

const editPlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
}

const getPlaylists = async (req, res) => {

}

const getPlaylistById = async (req, res) => {

}

const getPlaylistArray = async (req, res) => {
    // if(auth.verifyUser(req) === null){
    //     return res.status(400).json({
    //         errorMessage: 'UNAUTHORIZED'
    //     })
    // }
    // console.log("Available mongoose models:", Object.keys(mongoose.models));
    const playlists = await Playlist.find({})
        .populate('songs') // Populate song objects
        .exec();
    
    // console.log("Final list:", playlists); // Debug the output
    return res.status(200).json({ success: true, playlistArray: playlists });
}

const addSongToPlaylist = async (req, res) => {
    console.log('play-control addSongToPlaylist')
    try {
        const { playlistId } = req.params;
        const { songId } = req.body;
        const userId = auth.verifyUser(req) 

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ 
                success: false,
                error: "PLAYLIST_NOT_FOUND",
                message: "Playlist not found" 
            });
        }

        // Check ownership 
        const user = await User.findById(userId);
        if (!user) {
            console.log('user' + user)
            return res.status(400).json({ success: false, error: 'User not found' });
        }
        if (playlist.ownerEmail !== user.email) {
            return res.status(403).json({ 
                success: false,
                error: "UNAUTHORIZED",
                message: "You don't own this playlist" 
            });
        }

        //Check if song exists
        const song = await Song.findById(songId);
        if (!song) {
            return res.status(404).json({ 
                success: false,
                error: "SONG_NOT_FOUND",
                message: "Song not found" 
            });
        }

        // Check if song already in playlist
        if (playlist.songs.includes(songId)) {
            return res.status(400).json({ 
                success: false,
                error: "SONG_ALREADY_IN_PLAYLIST",
                message: "This song is already in the playlist" 
            });
        }

        playlist.songs.push(songId);
        await playlist.save();

        const updatedPlaylist = await Playlist.findById(playlistId)
            .populate('songs')
            .exec();
        
        res.status(200).json({ 
            success: true,
            playlist: updatedPlaylist,
            message: "Song added to playlist successfully" 
        });
    } catch (error) {
        console.error("Error adding song to playlist:", error);
        res.status(500).json({ 
            success: false,
            error: "SERVER_ERROR",
            message: "Failed to add song to playlist" 
        });
    }
}

const removeSongFromPlaylist = async (req, res) => {
    try{
        const { playlistId, songId } = req.params;
        // Find playlist
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({
                success: false,
                error: "PLAYLIST_NOT_FOUND",
                message: "Playlist not found"
            });
        }
        
        // Check ownership 
        if (playlist.ownerEmail !== auth.user.email) {
            return res.status(403).json({
                success: false,
                error: "UNAUTHORIZED",
                message: "You don't own this playlist"
            });
        }
        
        // Check if song exists in playlist
        if (!playlist.songs.includes(songId)) {
            return res.status(400).json({
                success: false,
                error: "SONG_NOT_IN_PLAYLIST",
                message: "Song is not in this playlist"
            });
        }
        
        //Remove song from playlist
        playlist.songs = playlist.songs.filter(id => id.toString() !== songId);
        await playlist.save();
        
        
        // 6. Return updated playlist
        const updatedPlaylist = await Playlist.findById(playlistId)
            .populate('songs')
            .exec();
            
        res.json({
            success: true,
            playlist: updatedPlaylist,
            message: "Song removed from playlist"
        });
    }
    catch (error){
        console.error("Error deleting song to playlist:", error);
        res.status(500).json({ 
            success: false,
            error: "SERVER_ERROR",
            message: "Failed to delete song to playlist" 
        });
    }
}

module.exports = {
    createPlaylist,
    deletePlaylist,
    editPlaylist,
    getPlaylists,
    getPlaylistById,
    getPlaylistArray,
    addSongToPlaylist,
    removeSongFromPlaylist
}