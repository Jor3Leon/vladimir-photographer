const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('admin_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

export const api = {
    // Content
    fetchContent: async () => {
        const res = await fetch(`${API_URL}/api/content`);
        if (!res.ok) throw new Error('Failed to fetch content');
        return res.json();
    },
    updateContent: async (data) => {
        const res = await fetch(`${API_URL}/api/content`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update content');
        return res.json();
    },

    // Auth
    login: async (password) => {
        const res = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        if (!res.ok) throw new Error('Invalid credentials');
        return res.json();
    },
    checkSession: async () => {
        const res = await fetch(`${API_URL}/api/auth/session`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
    },

    // Messages
    fetchMessages: async () => {
        const res = await fetch(`${API_URL}/api/messages`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch messages');
        return res.json();
    },
    sendMessage: async (formData) => {
        const res = await fetch(`${API_URL}/api/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (!res.ok) throw new Error('Failed to send message');
        return res.json();
    },
    updateMessage: async (id, updates) => {
        const res = await fetch(`${API_URL}/api/messages/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error('Failed to update message');
        return res.json();
    },
    deleteMessage: async (id) => {
        const res = await fetch(`${API_URL}/api/messages/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to delete message');
        return res.json();
    },

    // Uploads
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const res = await fetch(`${API_URL}/api/upload`, {
            method: 'POST',
            headers: { 'Authorization': getAuthHeaders().Authorization },
            body: formData
        });
        if (!res.ok) throw new Error('Upload failed');
        return res.json();
    }
};
