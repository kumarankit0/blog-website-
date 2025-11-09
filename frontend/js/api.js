// api.js

const API_ROOT = ''; // gateway root (relative)

function getCorrelation() {
    return localStorage.getItem('corr') || (localStorage.setItem('corr', crypto.randomUUID()), localStorage.getItem('corr'));
}

async function apiFetch(path, opts = {}) {
    const headers = opts.headers || {};
    const token = localStorage.getItem('jwt');
    
    if (token) headers['Authorization'] = 'Bearer ' + token;
    
    headers['x-correlation-id'] = getCorrelation();
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
    
    const res = await fetch(API_ROOT + path, {
        ...opts,
        headers,
        body: opts.body && JSON.stringify(opts.body)
    });
    
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw err;
    }
    
    return res.json();
}

// API Methods
const api = {
    // Auth
    login: (email, password) => {
        return apiFetch('/api/v1/auth/login', {
            method: 'POST',
            body: { email, password },
        });
    },

    register: (username, email, password) => {
        return apiFetch('/api/v1/auth/register', {
            method: 'POST',
            body: { username, email, password },
        });
    },

    // Posts
    getPosts: (page = 1, limit = 10) => {
        return apiFetch(`/api/v1/posts?page=${page}&limit=${limit}`);
    },

    getPost: (id) => {
        return apiFetch(`/api/v1/posts/${id}`);
    },

    createPost: (title, content, tags = []) => {
        return apiFetch('/api/v1/posts', {
            method: 'POST',
            body: { title, content, tags },
        });
    },

    updatePost: (id, title, content, tags = []) => {
        return apiFetch(`/api/v1/posts/${id}`, {
            method: 'PUT',
            body: { title, content, tags },
        });
    },

    deletePost: (id) => {
        return apiFetch(`/api/v1/posts/${id}`, {
            method: 'DELETE',
        });
    },

    getUserPosts: (userId, page = 1, limit = 10) => {
        return apiFetch(`/api/v1/posts?authorId=${userId}&page=${page}&limit=${limit}`);
    },

    // Comments
    getComments: (postId, page = 1, limit = 10) => {
        return apiFetch(`/api/v1/comments?postId=${postId}&page=${page}&limit=${limit}`);
    },

    createComment: (postId, content) => {
        return apiFetch('/api/v1/comments', {
            method: 'POST',
            body: { postId, content },
        });
    },

    deleteComment: (id) => {
        return apiFetch(`/api/v1/comments/${id}`, {
            method: 'DELETE',
        });
    },

    // Users
    getCurrentUser: () => {
        return apiFetch('/api/v1/users/me');
    },

    getUser: (id) => {
        return apiFetch(`/api/v1/users/${id}`);
    },
};
