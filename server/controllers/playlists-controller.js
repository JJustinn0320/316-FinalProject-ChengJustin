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
    console.log('del playlist')
    let userId = auth.verifyUser(req)
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log('verified')

    try{
        const { playlistId } = req.params

        // find playlist
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            return res.status(404).json({ 
                success: false,
                error: "PLAYLIST_NOT_FOUND",
                message: "Playlist not found" 
            });
        }
        console.log('found playlist')
        // check owner
        const user = await User.findById(userId)
        if (!user) {
            console.log('user' + user)
            return res.status(400).json({ success: false, error: 'User not found' });
        }
        if (playlist.ownerEmail !== user.email) {
            return res.status(403).json({ 
                success: false,
                error: "UNAUTHORIZED",
                message: "You don't own this song" 
            });
        }
        console.log('user good')
        // remove playlist from users
        // 1. Delete the song itself
        const oldPlaylist = await Playlist.findByIdAndDelete(playlistId);
        console.log('playlist del')
        // 2. Remove song from all users
        await User.updateMany(
            { playlists: playlistId },
            { $pull: { playlists: playlistId } }
        );
        console.log('update user')
        res.status(200).json({
            success: true, 
            playlist: oldPlaylist,
            message: "playlist delet successfully"
        })
    }
    catch (error) {
        console.error("Error del play:", error);
        res.status(500).json({ 
            success: false,
            error: "SERVER_ERROR",
            message: "Failed to del play" 
        });
    }
}
const copyPlaylist = async (req, res) => {
    console.log('copy playlist')
    let userId = auth.verifyUser(req)
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log('verified')
    try{
        const { playlistId } = req.params
        console.log(`playlistid:${playlistId}`)
        // find playlist
        const playlist = await Playlist.findById(playlistId)
        if (!playlist) {
            return res.status(404).json({ 
                success: false,
                error: "PLAYLIST_NOT_FOUND",
                message: "Playlist not found" 
            });
        }
        console.log('found playlist')
        // find owner
        const user = await User.findById(userId)
        if (!user) {
            console.log('user' + user)
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        // add (copy) untill no playlist with same name
        let newName = playlist.name;
        let exists = null
        do{
            exists = await Playlist.findOne({ name: newName, ownerEmail: user.email })
            if (exists){
                newName = newName + ' (Copy)'
            }
            console.log(newName)
        }
        while(exists)
        
        const copyPlaylist = await Playlist.create({
            name: newName,
            ownerUsername: user.username,
            ownerEmail: user.email,
            songs: playlist.songs,
            listens: [],
            guestHasListened: 0,
        })

        console.log('update user')
        res.status(200).json({
            success: true, 
            playlist: copyPlaylist,
            message: "playlist copy successfully"
        })
    }
    catch (error){
        console.error("Error copy play:", error);
        res.status(500).json({ 
            success: false,
            error: "SERVER_ERROR",
            message: "Failed to copy play" 
        });
    }
}
const editPlaylist = async (req, res) => {
    console.log('edit playlist');
    
    let userId = auth.verifyUser(req);
    if (userId === null) {
        return res.status(401).json({
            success: false,
            error: "UNAUTHORIZED",
            message: "You must be logged in to edit a playlist"
        });
    }
    
    try {
        const { playlistId } = req.params;
        const { name, songs } = req.body;
        
        // Validate at least one field is provided
        if (name === undefined && songs === undefined) {
            return res.status(400).json({ 
                success: false,
                error: "BAD_REQUEST",
                message: "At least one field (name or songs) must be provided" 
            });
        }

        // Find the playlist
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ 
                success: false,
                error: "PLAYLIST_NOT_FOUND",
                message: "Playlist not found" 
            });
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ 
                success: false, 
                error: "USER_NOT_FOUND",
                message: "User not found" 
            });
        }
        
        // Check ownership
        if (playlist.ownerEmail !== user.email) {
            return res.status(403).json({ 
                success: false,
                error: "FORBIDDEN",
                message: "You don't own this playlist" 
            });
        }

        // Build update object with only provided fields
        const updateFields = {};
        if (name !== undefined) updateFields.name = name;
        if (songs !== undefined) updateFields.songs = songs;

        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            updateFields,
            { new: true, runValidators: true }
        ).populate('songs');

        console.log(`Playlist ${playlistId} edited by user ${user.email}`);

        return res.status(200).json({
            success: true,
            message: "Playlist updated successfully",
            playlist: updatedPlaylist
        });

    } catch (error) {
        console.error("Error editing playlist:", error);
        
        // Handle specific errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                error: "VALIDATION_ERROR",
                message: "Validation failed",
                details: Object.values(error.errors).map(err => err.message)
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                error: "INVALID_ID",
                message: "Invalid playlist ID format" 
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: "SERVER_ERROR",
            message: "Failed to edit playlist",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

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
        await Song.findOneAndUpdate({_id: songId }, {playlists: song.playlists+1})
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
        
        
        // Return updated playlist
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
const increamentPlaylist = async (req, res) => {
    const { playlistId } = req.params;
    const { userId } = req.body;

    try {
        console.log('playlist incr')
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) return res.status(404).send("Playlist not found");

        // Add listen only if user hasn't listened before
        if (!playlist.listens.includes(userId)) {
            playlist.listens.push(userId);
            await playlist.save();
        }

        return res.json(playlist);
    } catch (err) {
        res.status(500).send(err.message);
    }
}
module.exports = {
    createPlaylist,
    copyPlaylist,
    deletePlaylist,
    editPlaylist,
    getPlaylists,
    getPlaylistById,
    getPlaylistArray,
    addSongToPlaylist,
    removeSongFromPlaylist,
    increamentPlaylist
}