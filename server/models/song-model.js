const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const songSchema = new Schema({
    ownerEmail: {type: String, required: true},
    title: {type: String, required: true},
    artist: {type: String, required: true},
    year: {type: Number, required: true},
    youTubeId: {type: String, required: true},
    listens: {type: Number, required: true}
}, {timestamps: true})

module.exports = mongoose.model('Song', songSchema)