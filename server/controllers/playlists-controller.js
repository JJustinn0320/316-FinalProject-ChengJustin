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

        const updatedPlaylists = [...user.playlists, playlist.id];
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
    console.log("Available mongoose models:", Object.keys(mongoose.models));
    const playlists = await Playlist.find({})
        .populate('songs') // Populate song objects
        .exec();
        
    // if (!playlists || playlists.length === 0) {
    //     console.log("!playlists.length");
    //     return res.status(200).json({ success: true, playlistArray: [] });
    // }

    // console.log("Send the Playlist pairs");
    // // PUT ALL THE LISTS INTO ID, NAME PAIRS
    // let array = [];
    // for (let key in playlists) {
    //     let list = playlists[key];
        
    //     // FIX: Make sure we include the ID
    //     let playlist = {
    //         _id: list._id,  // Use whichever ID property exists
    //         name: list.name,
    //         ownerUsername: list.ownerUsername,
    //         ownerEmail: list.ownerEmail,
    //         songs: list.songs
    //     };
    //     array.push(playlist);
    // }
    
    console.log("Final list:", playlists); // Debug the output
    return res.status(200).json({ success: true, playlistArray: playlists });
}

module.exports = {
    createPlaylist,
    deletePlaylist,
    editPlaylist,
    getPlaylists,
    getPlaylistById,
    getPlaylistArray
}