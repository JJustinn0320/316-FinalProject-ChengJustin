const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const playlistSchema = new Schema({
    name: {type: String, required: true},
    ownerUsername: {type: String, required: true},
    ownerEmail: {type: String, required: true},
    songs: {type: [{type: ObjectId, ref: 'Song'}], required: true},
    listens: {type: [{type: ObjectId, ref: 'User'}], required: true},
    guestHasListened: {type: Boolean, required: true}
}, {timestamps: true})

module.exports = mongoose.model('Playlist', playlistSchema)