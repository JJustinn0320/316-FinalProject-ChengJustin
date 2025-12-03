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

export const getPlaylistPairs = () => api.get(`/playlistpairs/`)

const apis = {
    getPlaylistPairs,
}

export default apis