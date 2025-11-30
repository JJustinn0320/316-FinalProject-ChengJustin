const Playlist = require('../models/playlist-model')

const createPlaylist = async (req, res) => {
    const {name, ownerEmail, songs} = req.body
    
    if(!name || !ownerEmail){
        return res.status(400).json({error: "Required fields missing"})
    }
    if (songs && !Array.isArray(songs)) {
        return res.status(400).json({ 
            error: "Songs must be an array" 
        });
    }

    try{
        const playlist = await Playlist.create({name, ownerEmail, songs})
        res.status(200).json(playlist)
    }
    catch(error){
        res.status(400).json({error: error.message})
    }
}

const deletePlaylist = async (req, res) => {

}

const editPlaylist = async (req, res) => {

}

const getPlaylists = async (req, res) => {

}

const getPlaylistById = async (req, res) => {

}

const getPlaylistPairs = async (req, res) => {

}

module.exports = {
    createPlaylist,
    deletePlaylist,
    editPlaylist,
    getPlaylists,
    getPlaylistById,
    getPlaylistPairs
}