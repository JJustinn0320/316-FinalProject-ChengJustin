const Playlist = require('../models/playlist-model')

const createPlaylist = async (req, res) => {
    const {name, ownerEmail, songs} = req.body
        
    try{
        console.log(req)
        const playlist = await Playlist.create({name, ownerEmail, songs})
        res.status(200).json(playlist)
    }
    catch(error){
        res.status(400).json({error: error.message})
    }
}

module.exports = {
    createPlaylist
}