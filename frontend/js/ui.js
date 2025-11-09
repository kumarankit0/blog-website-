// UI Utilities
const ui = {
    // Show toast message
    showToast: (message, type = 'info', duration = 3000) => {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;

        container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, duration);
    },

    // Update navigation based on auth status
    updateNavigation: () => {
        const isAuth = auth.isAuthenticated();
        const user = auth.getCurrentUser();
        
        // Nav auth/user sections
        const navAuth = document.getElementById('navAuth');
        const navUser = document.getElementById('navUser');
        
        if (isAuth && user) {
            if (navAuth) navAuth.style.display = 'none';
            if (navUser) {
                navUser.style.display = 'block';
                const avatar = document.getElementById('userAvatar');
                if (avatar) {
                    avatar.textContent = (user.username || 'U').charAt(0).toUpperCase();
                }
            }
        } else {
            if (navAuth) navAuth.style.display = 'flex';
            if (navUser) navUser.style.display = 'none';
        }

        // Bottom nav
        const bottomCreatePost = document.getElementById('bottomCreatePost');
        const bottomProfile = document.getElementById('bottomProfile');

        if (isAuth) {
            if (bottomCreatePost) bottomCreatePost.style.display = 'flex';
            if (bottomProfile) bottomProfile.style.display = 'flex';
        } else {
            if (bottomCreatePost) bottomCreatePost.style.display = 'none';
            if (bottomProfile) bottomProfile.style.display = 'none';
        }
    },

    // Format date
    formatDate: (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return date.toLocaleDateString();
    },

    // Validate email
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Validate form
    validateForm: (formElement) => {
        const inputs = formElement.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            const errorEl = input.parentElement.querySelector('.form-error');
            
            if (!input.value.trim()) {
                if (errorEl) {
                    errorEl.textContent = 'This field is required';
                    errorEl.classList.add('show');
                }
                isValid = false;
            } else if (input.type === 'email' && !ui.validateEmail(input.value)) {
                if (errorEl) {
                    errorEl.textContent = 'Please enter a valid email';
                    errorEl.classList.add('show');
                }
                isValid = false;
            } else if (input.type === 'password' && input.value.length < 6) {
                if (errorEl) {
                    errorEl.textContent = 'Password must be at least 6 characters';
                    errorEl.classList.add('show');
                }
                isValid = false;
            } else {
                if (errorEl) {
                    errorEl.classList.remove('show');
                }
            }
        });

        return isValid;
    },

    // Clear form errors
    clearFormErrors: (formElement) => {
        const errors = formElement.querySelectorAll('.form-error');
        errors.forEach(error => error.classList.remove('show'));
    },
};

