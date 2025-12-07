import axios from 'axios'
axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: 'http://localhost:4000/api/song-store',
})

/** ownerUsername: {type: String, required: true},
    ownerEmail: {type: String, required: true},
    title: {type: String, required: true},
    artist: {type: String, required: true},
    year: {type: Number, required: true},
    youTubeId: {type: String, required: true},
    listens: {type: Number, required: true} */

export const getSongArray = () => api.get(`/songArray/`)
export const createSong = (username, userEmail, newTitle, newArtist, newYear, newYouTubeId, newListens) => {
    return api.post(`/playlist/`, {
        // SPECIFY THE PAYLOAD
        ownerUsername: username,
        ownerEmail: userEmail,
        title: newTitle,
        artist: newArtist,
        year: newYear,
        youTubeId: newYouTubeId,
        listens: newListens,
    })
}
const apis = {
    getSongArray,
    createSong,
}

export default apis