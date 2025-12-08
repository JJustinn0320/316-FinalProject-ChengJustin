import axios from 'axios'
axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: 'http://localhost:4000/api/playlist-store',
})

api.interceptors.request.use(config => {
  console.log(`Making ${config.method.toUpperCase()} request to:`, config.baseURL + config.url);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log(`Response ${response.status} from:`, response.config.url);
    return response;
  },
  error => {
    console.error('API Error:', {
      message: error.message,
      code: error.code,
      url: error.config?.baseURL + error.config?.url,
      method: error.config?.method,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

export const getPlaylistArray = () => api.get(`/playlistArray/`)
export const createPlaylist = (newListName, username, userEmail, newSongs, newListens, guestHasListened) => {
  return api.post(`/playlist/`, {
      // SPECIFY THE PAYLOAD
      name: newListName,
      ownerUsername: username,
      ownerEmail: userEmail,
      songs: newSongs,
      listens: newListens,
      guestHasListened: guestHasListened
  })
}
export const getPlaylistById = (id) => api.get(`/playlist/${id}`)
export const addSongToPlaylist = (playlistId, songId) => {
    return api.post(`/${playlistId}/songs`, { songId });
};
export const removeSongFromPlaylist = (playlistId, songId) => {
    return api.delete(`/${playlistId}/songs/${songId}`);
};
export const deletePlaylist = (playlistId) => api.delete(`/playlist/${playlistId}`)
const apis = {
    getPlaylistArray,
    createPlaylist,
    getPlaylistById,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist
}

export default apis