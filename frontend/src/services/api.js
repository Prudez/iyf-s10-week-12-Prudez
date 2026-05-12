const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;
    
    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
            ...options.headers
        }
    };
    
    const response = await fetch(url, config);
    
    if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expired');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error || 'Request failed');
    }
    
    return data;
};

export const authAPI = {
    register: (userData) => request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    }),
    
    login: (credentials) => request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    }),
    
    getMe: () => request('/auth/me')
};

export const postsAPI = {
    getAll: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/posts${query ? `?${query}` : ''}`);
    },
    
    getById: (id) => request(`/posts/${id}`),
    
    create: (postData) => request('/posts', {
        method: 'POST',
        body: JSON.stringify(postData)
    }),
    
    update: (id, postData) => request(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(postData)
    }),
    
    delete: (id) => request(`/posts/${id}`, {
        method: 'DELETE'
    }),
    
    like: (id) => request(`/posts/${id}/like`, {
        method: 'POST'
    })
};

export const commentsAPI = {
    getByPost: (postId) => request(`/posts/${postId}/comments`),
    
    create: (postId, commentData) => request(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify(commentData)
    }),
    
    delete: (postId, commentId) => request(`/posts/${postId}/comments/${commentId}`, {
        method: 'DELETE'
    })
};