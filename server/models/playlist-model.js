const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const playlistSchema = new Schema({
    name: {type: String, required: true},
    ownerEmail: {type: String, required: true},
    songs: {type: [{type: ObjectId, ref: 'Song'}], required: true},
    listens: {type: Number, required: true}
}, {timestamps: true})

module.exports = mongoose.model('Playlist', playlistSchema)