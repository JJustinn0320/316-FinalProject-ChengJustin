import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:4000/api/auth',
    withCredentials: true, 
    headers: {
        'Content-Type': 'application/json',
    }
})

export const getLoggedIn = () => api.get(`/loggedIn`);
export const loginUser = (email, password) => {
    return api.post(`/login`, {
        email : email,
        password : password
    })
}
export const logoutUser = () => api.get(`/logout`)
export const registerUser = (username, email, avatar, password, passwordConfirm) => {
    return api.post(`/register`, {
        username, email, avatar, password, passwordConfirm
    })
}
const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}

export default apis