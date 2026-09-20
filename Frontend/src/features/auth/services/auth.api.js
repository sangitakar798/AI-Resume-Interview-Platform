// import axios from 'axios'

// const api = axios.create({
//     baseURL: "https://ai-resume-interview-platform-yfgl.onrender.com",
// })

// // Attach Bearer token to headers before sending requests
// api.interceptors.request.use((config) => {
//     const token = localStorage.getItem("token")
//     if (token) {
//         config.headers.Authorization = `Bearer ${token}`
//     }
//     return config;
// }, (error) => Promise.reject(error))

// export async function register({ username, email, password }) {
//     const response = await api.post('/api/auth/register', { username, email, password })
//     if (response.data.token) {
//         localStorage.setItem("token", response.data.token)
//     }
//     return response.data
// }

// export async function login({ email, password }) {
//     const response = await api.post('/api/auth/login', { email, password })
//     if (response.data.token) {
//         localStorage.setItem("token", response.data.token)
//     }
//     return response.data
// }

// export async function logout() {
//     localStorage.removeItem("token")
//     const response = await api.get('/api/auth/logout')
//     return response.data
// }

// export async function getMe() {
//     const response = await api.get('/api/auth/get-me')
//     return response.data
// }
import axios from "axios";

const api = axios.create({
    baseURL: "https://ai-resume-interview-platform-yfgl.onrender.com",
    withCredentials: true,
});


// Register
export async function register({ username, email, password }) {
    const response = await api.post("/api/auth/register", {
        username,
        email,
        password
    });

    return response.data;
}


// Login
export async function login({ email, password }) {
    const response = await api.post("/api/auth/login", {
        email,
        password
    });

    return response.data;
}


// Logout
export async function logout() {
    const response = await api.get("/api/auth/logout");

    return response.data;
}


// Get logged-in user
export async function getMe() {
    const response = await api.get("/api/auth/get-me");

    return response.data;
}