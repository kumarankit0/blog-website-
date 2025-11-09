// Authentication Management
const auth = {
    // Check if user is logged in
    isAuthenticated: () => {
        return !!localStorage.getItem('auth_token');
    },

    // Get current user info
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Login
    login: async (email, password) => {
        try {
            const response = await api.login(email, password);
            
            if (response.status === 'success' && response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return { success: true, user: response.data.user };
            }
            
            throw new Error(response.message || 'Login failed');
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Register
    register: async (username, email, password) => {
        try {
            const response = await api.register(username, email, password);
            
            if (response.status === 'success' && response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return { success: true, user: response.data.user };
            }
            
            throw new Error(response.message || 'Registration failed');
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        app.navigate('feed');
        ui.updateNavigation();
        ui.showToast('Logged out successfully', 'success');
    },

    // Require authentication
    requireAuth: (callback) => {
        if (!auth.isAuthenticated()) {
            app.navigate('login');
            ui.showToast('Please login to continue', 'info');
            return false;
        }
        return callback();
    },
};

