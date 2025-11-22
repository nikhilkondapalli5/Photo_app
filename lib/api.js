import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

// User API calls
export const fetchUsers = async () => {
    const response = await axios.get(`${API_BASE_URL}/user/list`);
    return response.data;
};

export const fetchUser = async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
    return response.data;
};

export const fetchUserCommentCounts = async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/user/${userId}/commentCounts`);
    return response.data;
};

// Photo API calls
export const fetchUserPhotos = async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/photosOfUser/${userId}`);
    return response.data;
};

// Comment API calls
export const fetchUserComments = async (userId) => {
    const response = await axios.get(`${API_BASE_URL}/commentsOfUser/${userId}`);
    return response.data;
};

// Auth API calls
export const login = async (login_name) => {
    const response = await axios.post(`${API_BASE_URL}/admin/login`, { login_name });
    return response.data;
};

export const logout = async () => {
    const response = await axios.post(`${API_BASE_URL}/admin/logout`);
    return response.data;
};

export const addComment = async (photoId, comment) => {
    const response = await axios.post(
        `${API_BASE_URL}/commentsOfPhoto/${photoId}`,
        { comment },
        { withCredentials: true }
    );
    return response.data;
};

// Check current session
export const checkSession = async () => {
    const response = await axios.get(`${API_BASE_URL}/admin/session`);
    return response.data;
};


