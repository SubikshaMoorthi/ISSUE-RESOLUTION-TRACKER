import axios from 'axios';

// const API = axios.create({
//     baseURL: 'http://localhost:5000/api',
// });

const API = axios.create({ baseURL: 'https://online-issue-resolution-tracker.onrender.com' });

// Automatically add the Token to every request if it exists
API.interceptors.request.use((req) => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;
