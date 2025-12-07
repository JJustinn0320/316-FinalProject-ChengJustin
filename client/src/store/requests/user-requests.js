import axios from 'axios'
axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: 'http://localhost:4000/api/user',
})

export const getUserByEmail = (email) => api.get(`/by-email/${email}`)

const apis = {
    getUserByEmail
}

export default apis