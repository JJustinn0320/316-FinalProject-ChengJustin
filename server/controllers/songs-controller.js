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
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log('verified')
    const { ownerUsername, ownerEmail, title, artist, year, youTubeId, listens, playlists } = req.body

    console.log(req.body)
    if( !ownerUsername || !ownerEmail || !title || !artist || year===undefined || !youTubeId || listens === undefined || playlists === undefined){
        console.log('missing fields')
        return res.status(400).json({
            error: "VALIDATION_ERROR",
            message: "Missing required fields",
        })
    }
    try{
        const user = await User.findOne({email: ownerEmail})
        if (!user) {
            console.log('user' + user)
            return res.status(400).json({ 
                success: false, 
                error: "USER_NOT_FOUND",
                message: "User not found",
            });
        }

        const exists = await Song.findOne( { title, artist, year, youTubeId } )
        if(exists){
            console.log('song already exists' + exists)
            return res.status(400).json({ 
                success: false, 
                error: "DUPLICATE_SONG",
                message: "This song already exists in the database",
            })
        }

        const song = await Song.create({title, artist, year, youTubeId, listens, playlists, ownerUsername, ownerEmail})
        console.log('created song')

        const updatedSongs = [...user.songs, song._id];
        await User.findOneAndUpdate( 
            { _id: id },
            { songs: updatedSongs },
            { new: true }
        );
        console.log('updated songs')

        res.status(201).json({
            success: true, 
            song: song,
            message: "Song created successfully"
        })
    }
    catch (error) {
         res.status(400).json({error: error.message})
    }
}
const editSong = async (req, res) => {
    console.log('controller edit song')
    let userId = auth.verifyUser(req)
    console.log(userId)
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log('verified')
    console.log(req.body)
    try{
        const { songId }= req.params
        console.log(songId)
        const { title, artist, year, youTubeId } = req.body
        if(!title || !artist || year===undefined || !youTubeId){
            console.log('missing fields')
            return res.status(400).json({
                error: "VALIDATION_ERROR",
                message: "Missing required fields",
            })
        }

        // find song
        const song = await Song.findById(songId)
        if (!song) {
            return res.status(404).json({ 
                success: false,
                error: "SONG_NOT_FOUND",
                message: "Song not found" 
            });
        }

        // check owner
        const user = await User.findById(userId)
        if (!user) {
            console.log('user' + user)
            return res.status(400).json({ success: false, error: 'User not found' });
        }
        if (song.ownerEmail !== user.email) {
            return res.status(403).json({ 
                success: false,
                error: "UNAUTHORIZED",
                message: "You don't own this song" 
            });
        }

        // check if exists
        const exists = await Song.findOne({ 
            title, artist, year, youTubeId,
            _id: { $ne: songId }  // exclude current song
        });
        if(exists){
            console.log('song already exists' + exists)
            return res.status(400).json({ 
                success: false, 
                error: "DUPLICATE_SONG",
                message: "This song already exists in the database",
            })
        }

        // update
        const newSong = await Song.findOneAndUpdate(
            {_id: songId }, 
            {title, artist, year, youTubeId},
            {new: true})
        console.log('updated song')

        res.status(200).json({
            success: true, 
            song: newSong,
            message: "Song edit successfully"
        })
    }
    catch (error) {
        console.error("Error edting Song:", error);
        res.status(500).json({ 
            success: false,
            error: "SERVER_ERROR",
            message: "Failed to edit Song" 
        });
    }
}
const deleteSong = async (req, res) => {
    console.log('controller delete song')
    let userId = auth.verifyUser(req)
    console.log(userId)
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log('verified')

    try{
        const { songId } = req.params
        console.log(songId)


        // find song
        const song = await Song.findById(songId)
        if (!song) {
            return res.status(404).json({ 
                success: false,
                error: "SONG_NOT_FOUND",
                message: "Song not found" 
            });
        }

        // check owner
        const user = await User.findById(userId)
        if (!user) {
            console.log('user' + user)
            return res.status(400).json({ success: false, error: 'User not found' });
        }
        if (song.ownerEmail !== user.email) {
            return res.status(403).json({ 
                success: false,
                error: "UNAUTHORIZED",
                message: "You don't own this song" 
            });
        }

        // remove song from user and playlist
        // 1. Delete the song itself
        const oldSong = await Song.findByIdAndDelete(songId);

        // 2. Remove song from all users
        await User.updateMany(
            { songs: songId },
            { $pull: { songs: songId } }
        );

        // 3. Remove song from all playlists
        await Playlist.updateMany(
            { songs: songId },
            { $pull: { songs: songId } }
        );

        res.status(200).json({
            success: true, 
            song: oldSong,
            message: "Song delet successfully"
        })
    }
    catch (error) {
        console.error("Error del Song:", error);
        res.status(500).json({ 
            success: false,
            error: "SERVER_ERROR",
            message: "Failed to del Song" 
        });
    }
}

const getSongById = async (req, res) => {
    const {songId} = req.params
    try{
        const song = await Song.findById(songId)
        res.status(200).json({
            success: true, 
            song: song,
            message: "get song"
        })
    }
    catch(error) {
        console.error("Error del Song:", error);
        res.status(500).json({ 
            success: false,
            error: "SERVER_ERROR",
            message: "Failed to del Song" 
        });
    } 
}

const copySong = async (req, res) => {
    console.log('controller copy song')
    let userId = auth.verifyUser(req)
    console.log(userId)
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log('verified')

    try{
        const {songId} = req.params

        const user = await User.findById(userId)
        if (!user) {
            console.log('user' + user)
            return res.status(400).json({ success: false, error: 'User not found' });
        }

        const origSong = await Song.findById(songId)
        const { artist, year, youTubeId } = origSong

        let newTitle = origSong.title + " (Copy)";
        let exists = null
        do{
            exists = await Song.findOne({ title: newTitle, artist, year, youTubeId })
            if (exists){
                newTitle = newTitle + ' (Copy)'
            }
            console.log(newTitle)
        }
        while(exists)
        console.log("new song title " + newTitle)

        const copiedSong = await Song.create({title: newTitle, artist, year, youTubeId, listens: 0, playlists: 0, ownerUsername: user.username, ownerEmail: user.email})
        console.log('created song')

        const updatedSongs = [...user.songs, copiedSong._id];
        await User.findOneAndUpdate( 
            { _id: userId },
            { songs: updatedSongs },
            { new: true }
        );
        console.log('updated songs')

        res.status(201).json({
            success: true, 
            song: copiedSong,
            message: "Copy Song created successfully"
        })

    }
    catch (error) {
        console.error("Error copy Song:", error);
        res.status(500).json({ 
            success: false,
            error: "SERVER_ERROR",
            message: "Failed to copy Song" 
        });
    }
}
module.exports = {
    getSongArray,
    createSong,
    editSong,
    deleteSong,
    getSongById,
    copySong
}