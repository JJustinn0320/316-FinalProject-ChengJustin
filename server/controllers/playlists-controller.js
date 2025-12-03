const Playlist = require('../models/playlist-model')

const createPlaylist = async (req, res) => {
    const {name, ownerEmail, songs, listens} = req.body
    
    if(!name || !ownerEmail){
        return res.status(400).json({error: "Required fields missing"})
    }
    if (songs && !Array.isArray(songs)) {
        return res.status(400).json({ 
            error: "Songs must be an array" 
        });
    }

    try{
        const playlist = await Playlist.create({name, ownerEmail, songs, listens})
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
    const playlists = await Playlist.find({});
        
    if (!playlists || playlists.length === 0) {
        console.log("!playlists.length");
        return res.status(200).json({ success: true, idNamePairs: [] });
    }

    console.log("Send the Playlist pairs");
    // PUT ALL THE LISTS INTO ID, NAME PAIRS
    let pairs = [];
    for (let key in playlists) {
        let list = playlists[key];
        
        // FIX: Make sure we include the ID
        let pair = {
            _id: list._id,  // Use whichever ID property exists
            name: list.name
        };
        pairs.push(pair);
    }
    
    // console.log("Final pairs:", pairs); // Debug the output
    return res.status(200).json({ success: true, idNamePairs: pairs });
}

module.exports = {
    createPlaylist,
    deletePlaylist,
    editPlaylist,
    getPlaylists,
    getPlaylistById,
    getPlaylistPairs
}