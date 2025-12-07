const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const UserSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String, required: true },
    passwordHash: { type: String, required: true },
    playlists: [{type: ObjectId, ref: 'Playlist'}],
    songs: [{type: ObjectId, ref: 'Song'}]
}, {timestamps: true})

module.exports = mongoose.model('User', UserSchema)
