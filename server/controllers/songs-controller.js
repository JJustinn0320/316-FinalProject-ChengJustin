const Song = require('../models/song-model')
const User = require('../models/user-model')
const Playlist = require('../models/playlist-model')
const auth = require('../auth')

const getSongArray = async (req, res) => {
    const songs = await Song.find({})
    return res.status(200).json({ success: true, songArray: songs });
}
const createSong = async (req, res) => {
    console.log("create Song")
    let id = auth.verifyUser(req)
    console.log(id)
    // if(auth.verifyUser(req) === null){
    //     return res.status(400).json({
    //         errorMessage: 'UNAUTHORIZED'
    //     })
    // }
    // console.log('verified')
    const { ownerUsername, ownerEmail, title, artist, year, youTubeId, listens, playlists } = req.body

    console.log(req.body)
    if( !ownerUsername || !ownerEmail || !title || !artist || year===undefined || !youTubeId || listens === undefined || playlists === undefined){
        console.log('missing fields')
        return res.status(400).json({error: "Required fields missing"})
    }
    try{
        const user = await User.findOne({email: ownerEmail})
        if (!user) {
            console.log('user' + user)
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        const song = await Song.create({title, artist, year, youTubeId, listens, playlists, ownerUsername, ownerEmail})
        console.log('created song')

        const updatedSongs = [...user.songs, song._id];
        await User.findOneAndUpdate( 
            { _id: id },
            { songs: updatedSongs },
            { new: true }
        );
        console.log('updated playlist')

        res.status(200).json(song)
    }
    catch (error) {
         res.status(400).json({error: error.message})
    }
}

module.exports = {
    getSongArray,
    createSong,
}