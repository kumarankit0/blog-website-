// Main Application
const app = {
    currentPage: 'feed',
    currentPageNum: 1,
    pageLimit: 10,

    // Initialize app
    init: () => {
        // Setup navigation listeners
        document.querySelectorAll('[data-route]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                app.navigate(route);
            });
        });

        // Handle browser back/forward
        window.addEventListener('popstate', () => {
            const route = window.location.hash.slice(1) || 'feed';
            app.navigate(route, false);
        });

        // Initial navigation
        const route = window.location.hash.slice(1) || 'feed';
        app.navigate(route, false);
        
        // Update navigation
        ui.updateNavigation();
    },

    // Navigate to page
    navigate: (route, pushState = true) => {
        app.currentPage = route;
        
        if (pushState) {
            window.history.pushState({}, '', `#${route}`);
        }

        // Update active nav links
        document.querySelectorAll('[data-route]').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-route') === route) {
                link.classList.add('active');
            }
        });

        // Add fade-in animation
        const container = document.getElementById('app');
        if (container) {
            container.classList.add('fade-in');
            setTimeout(() => container.classList.remove('fade-in'), 300);
        }

        // Render page
        app.renderPage(route);
    },

    // Handle search
    handleSearch: () => {
        const searchInput = document.getElementById('searchInput');
        const query = searchInput?.value.trim();
        if (query) {
            // Navigate to feed with search query
            app.navigate(`feed?search=${encodeURIComponent(query)}`);
        }
    },

    // Render page based on route
    renderPage: async (route) => {
        const container = document.getElementById('app');
        if (!container) return;

        container.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';

        try {
            switch (route) {
                case 'login':
                    container.innerHTML = app.renderLogin();
                    break;
                case 'register':
                    container.innerHTML = app.renderRegister();
                    break;
                case 'feed':
                    await app.renderFeed();
                    break;
                case 'post':
                    const hashPartsPost = window.location.hash.split('?');
                    const postId = hashPartsPost.length > 1 ? new URLSearchParams(hashPartsPost[1]).get('id') : null;
                    if (postId) {
                        await app.renderPostDetail(postId);
                    } else {
                        app.navigate('feed');
                    }
                    break;
                case 'create-post':
                    if (auth.requireAuth(() => true)) {
                        container.innerHTML = app.renderCreatePost();
                    }
                    break;
                case 'edit-post':
                    const hashPartsEdit = window.location.hash.split('?');
                    const editId = hashPartsEdit.length > 1 ? new URLSearchParams(hashPartsEdit[1]).get('id') : null;
                    if (editId && auth.requireAuth(() => true)) {
                        await app.renderEditPost(editId);
                    }
                    break;
                case 'profile':
                    if (auth.requireAuth(() => true)) {
                        await app.renderProfile();
                    }
                    break;
                case 'debug':
                    container.innerHTML = app.renderDebug();
                    break;
                default:
                    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">404</div><h2>Page not found</h2></div>';
            }
        } catch (error) {
            console.error('Render error:', error);
            container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h2>Error loading page</h2><p>${error.message}</p></div>`;
        }
    },

    // Render Login Page
    renderLogin: () => {
        return `
            <div class="page fade-in">
                <h1 class="page-title">Login</h1>
                <form class="form" id="loginForm">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email" required>
                        <div class="form-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-input" name="password" required>
                        <div class="form-error"></div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                    <p class="text-center mt-2" style="font-size: 0.75rem; color: var(--text-muted);">
                        By logging in you accept our Terms of Service
                    </p>
                    <p class="text-center mt-2">
                        Don't have an account? <a href="#" data-route="register" style="color: var(--accent-primary);">Register</a>
                    </p>
                </form>
            </div>
        `;
    },

    // Render Register Page
    renderRegister: () => {
        return `
            <div class="page fade-in">
                <h1 class="page-title">Register</h1>
                <form class="form" id="registerForm">
                    <div class="form-group">
                        <label class="form-label">Username</label>
                        <input type="text" class="form-input" name="username" required minlength="3">
                        <div class="form-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" name="email" required>
                        <div class="form-error"></div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-input" name="password" required minlength="6">
                        <div class="form-error"></div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
                    <p class="text-center mt-2" style="font-size: 0.75rem; color: var(--text-muted);">
                        By registering you accept our Terms of Service
                    </p>
                    <p class="text-center mt-2">
                        Already have an account? <a href="#" data-route="login" style="color: var(--accent-primary);">Login</a>
                    </p>
                </form>
            </div>
        `;
    },

    // Render Feed Page
    renderFeed: async () => {
        const container = document.getElementById('app');
        const hashParts = window.location.hash.split('?');
        const params = hashParts.length > 1 ? new URLSearchParams(hashParts[1]) : new URLSearchParams();
        const page = parseInt(params.get('page')) || 1;
        const searchQuery = params.get('search') || '';
        app.currentPageNum = page;

        try {
            let response;
            if (searchQuery) {
                // TODO: Implement search API endpoint
                response = await api.getPosts(page, app.pageLimit);
            } else {
                response = await api.getPosts(page, app.pageLimit);
            }
            
            if (response.status === 'success') {
                const posts = response.data.posts || [];
                const pagination = response.data.pagination || {};

                container.innerHTML = `
                    <div class="page fade-in">
                        <h1 class="page-title">Feed</h1>
                        ${auth.isAuthenticated() ? `
                            <div class="create-post-quick">
                                <input type="text" class="create-post-quick-input" id="quickPostTitle" placeholder="What's on your mind? (Click to create full post)">
                                <div class="create-post-quick-actions">
                                    <span class="create-post-quick-hint">Press Enter or click to create post</span>
                                    <button class="btn btn-primary" onclick="app.handleQuickCreate()">Create Post</button>
                                </div>
                            </div>
                        ` : ''}
                        <div id="postsContainer">
                            ${posts.length > 0 
                                ? posts.map(post => app.renderPostCard(post)).join('')
                                : '<div class="empty-state"><div class="empty-state-icon">📝</div><h2>No posts yet</h2><p>Be the first to create a post!</p></div>'
                            }
                        </div>
                        ${pagination.pages > 1 ? app.renderPagination(pagination) : ''}
                    </div>
                `;

                // Setup quick create
                if (auth.isAuthenticated()) {
                    const quickInput = document.getElementById('quickPostTitle');
                    quickInput.addEventListener('click', () => app.navigate('create-post'));
                    quickInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            app.handleQuickCreate();
                        }
                    });
                }

                // Re-attach route listeners
                document.querySelectorAll('[data-route]').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const route = link.getAttribute('data-route');
                        app.navigate(route);
                    });
                });
            }
        } catch (error) {
            container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h2>Error loading feed</h2><p>${error.message}</p></div>`;
        }
    },

    // Handle quick create
    handleQuickCreate: () => {
        const title = document.getElementById('quickPostTitle')?.value.trim();
        if (title) {
            // Store title in sessionStorage and navigate to create post
            sessionStorage.setItem('quickPostTitle', title);
            app.navigate('create-post');
        } else {
            app.navigate('create-post');
        }
    },

    // Render Post Detail Page
    renderPostDetail: async (postId) => {
        const container = document.getElementById('app');

        try {
            const [postResponse, commentsResponse] = await Promise.all([
                api.getPost(postId),
                api.getComments(postId, 1, 50)
            ]);

            if (postResponse.status === 'success' && commentsResponse.status === 'success') {
                const post = postResponse.data.post;
                const comments = commentsResponse.data.comments || [];
                const user = auth.getCurrentUser();
                const isAuthor = user && user._id === post.authorId?._id;
                const authorInitial = (post.authorId?.username || 'U').charAt(0).toUpperCase();
                const tags = post.tags || [];

                container.innerHTML = `
                    <div class="page fade-in">
                        <div class="content-wrapper">
                            <div class="container">
                                <div class="card">
                                    <div class="post-card-header">
                                        <span class="post-author-avatar">${authorInitial}</span>
                                        <div class="post-author-info">
                                            <a href="#" data-route="profile" data-user-id="${post.authorId?._id || ''}" class="post-author-name">
                                                ${app.escapeHtml(post.authorId?.username || 'Unknown')}
                                            </a>
                                            <div class="post-meta">
                                                <span>${ui.formatDate(post.createdAt)}</span>
                                            </div>
                                        </div>
                                        ${isAuthor ? `
                                            <div class="card-actions">
                                                <a href="#" data-route="edit-post" data-id="${post._id}" class="btn btn-secondary">Edit</a>
                                                <button onclick="app.deletePost('${post._id}')" class="btn btn-danger">Delete</button>
                                            </div>
                                        ` : ''}
                                    </div>
                                    <h1 class="card-title">${app.escapeHtml(post.title)}</h1>
                                    ${tags.length > 0 ? `
                                        <div class="post-tags">
                                            ${tags.map(tag => `<span class="post-tag">#${app.escapeHtml(tag)}</span>`).join('')}
                                        </div>
                                    ` : ''}
                                    <div class="card-content" style="white-space: pre-wrap; line-height: 1.8;">${app.escapeHtml(post.content)}</div>
                                </div>

                                <div class="card">
                                    <h2 class="card-title">Comments (${comments.length})</h2>
                                    ${auth.isAuthenticated() ? `
                                        <form id="commentForm" class="mt-2">
                                            <div class="form-group">
                                                <textarea class="form-textarea" name="content" placeholder="Write a comment..." required></textarea>
                                                <div class="form-error"></div>
                                            </div>
                                            <button type="submit" class="btn btn-primary">Post Comment</button>
                                        </form>
                                    ` : '<p class="text-center mt-2"><a href="#" data-route="login" style="color: var(--accent-primary);">Login</a> to comment</p>'}
                                </div>

                                <div id="commentsContainer">
                                    ${comments.length > 0 
                                        ? comments.map(comment => app.renderCommentCard(comment)).join('')
                                        : '<div class="empty-state"><div class="empty-state-icon">💬</div><p>No comments yet</p></div>'
                                    }
                                </div>
                            </div>
                            <aside class="right-sidebar">
                                <div class="post-detail-sidebar">
                                    <h3 class="post-detail-sidebar-title">More from ${app.escapeHtml(post.authorId?.username || 'Author')}</h3>
                                    <div id="relatedPosts">
                                        <div class="related-post">
                                            <div class="related-post-title">Loading...</div>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                `;

                // Load related posts
                try {
                    const relatedResponse = await api.getUserPosts(post.authorId?._id, 1, 5);
                    if (relatedResponse.status === 'success') {
                        const relatedPosts = (relatedResponse.data.posts || []).filter(p => p._id !== postId);
                        const relatedContainer = document.getElementById('relatedPosts');
                        if (relatedContainer && relatedPosts.length > 0) {
                            relatedContainer.innerHTML = relatedPosts.map(relatedPost => `
                                <div class="related-post" onclick="app.navigate('post?id=${relatedPost._id}')">
                                    <div class="related-post-title">${app.escapeHtml(relatedPost.title)}</div>
                                    <div class="related-post-meta">${ui.formatDate(relatedPost.createdAt)}</div>
                                </div>
                            `).join('');
                        } else if (relatedContainer) {
                            relatedContainer.innerHTML = '<div class="empty-state" style="padding: 1rem;"><p style="font-size: 0.875rem;">No other posts</p></div>';
                        }
                    }
                } catch (error) {
                    console.error('Error loading related posts:', error);
                }

                // Setup comment form
                if (auth.isAuthenticated()) {
                    const commentForm = document.getElementById('commentForm');
                    commentForm.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        await app.handleCreateComment(postId, commentForm);
                    });
                }

                // Re-attach route listeners
                document.querySelectorAll('[data-route]').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const route = link.getAttribute('data-route');
                        const id = link.getAttribute('data-id');
                        if (id) {
                            app.navigate(`${route}?id=${id}`);
                        } else {
                            app.navigate(route);
                        }
                    });
                });
            }
        } catch (error) {
            container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h2>Error loading post</h2><p>${error.message}</p></div>`;
        }
    },

    // Render Create Post Page
    renderCreatePost: () => {
        const quickTitle = sessionStorage.getItem('quickPostTitle') || '';
        if (quickTitle) sessionStorage.removeItem('quickPostTitle');

        return `
            <div class="page fade-in">
                <h1 class="page-title">Create Post</h1>
                <div class="post-editor">
                    <form class="post-editor-form" id="createPostForm">
                        <div class="form-group">
                            <label class="form-label">Title</label>
                            <input type="text" class="form-input" name="title" value="${app.escapeHtml(quickTitle)}" required>
                            <div class="form-error"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tags (comma-separated)</label>
                            <input type="text" class="form-input" name="tags" placeholder="javascript, nodejs, microservices">
                            <div class="form-error"></div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Content</label>
                            <textarea class="form-textarea" name="content" id="postContent" required style="min-height: 300px;"></textarea>
                            <div class="form-error"></div>
                        </div>
                        <div class="publish-toggle">
                            <label class="form-label">Publish immediately</label>
                            <div class="toggle-switch active" id="publishToggle" onclick="app.togglePublish()"></div>
                        </div>
                        <div class="card-actions">
                            <button type="submit" class="btn btn-primary">Publish</button>
                            <a href="#" data-route="feed" class="btn btn-secondary">Cancel</a>
                        </div>
                    </form>
                    <div class="post-editor-preview">
                        <h3 class="sidebar-title">Preview</h3>
                        <div id="postPreview" style="color: var(--text-secondary); line-height: 1.8; white-space: pre-wrap;"></div>
                    </div>
                </div>
            </div>
        `;

        // Setup live preview after form is rendered
        setTimeout(() => {
            const postContent = document.getElementById('postContent');
            const postPreview = document.getElementById('postPreview');
            if (postContent && postPreview) {
                postContent.addEventListener('input', () => {
                    postPreview.textContent = postContent.value;
                });
            }
        }, 100);
    },

    // Render Edit Post Page
    renderEditPost: async (postId) => {
        const container = document.getElementById('app');

        try {
            const response = await api.getPost(postId);
            
            if (response.status === 'success') {
                const post = response.data.post;
                const user = auth.getCurrentUser();
                
                if (!user || user._id !== post.authorId?._id) {
                    ui.showToast('You can only edit your own posts', 'error');
                    app.navigate('feed');
                    return;
                }

                const tags = (post.tags || []).join(', ');
                container.innerHTML = `
                    <div class="page fade-in">
                        <h1 class="page-title">Edit Post</h1>
                        <div class="post-editor">
                            <form class="post-editor-form" id="editPostForm">
                                <div class="form-group">
                                    <label class="form-label">Title</label>
                                    <input type="text" class="form-input" name="title" value="${app.escapeHtml(post.title)}" required>
                                    <div class="form-error"></div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Tags (comma-separated)</label>
                                    <input type="text" class="form-input" name="tags" value="${app.escapeHtml(tags)}" placeholder="javascript, nodejs, microservices">
                                    <div class="form-error"></div>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Content</label>
                                    <textarea class="form-textarea" name="content" id="editPostContent" required style="min-height: 300px;">${app.escapeHtml(post.content)}</textarea>
                                    <div class="form-error"></div>
                                </div>
                                <div class="card-actions">
                                    <button type="submit" class="btn btn-primary">Update</button>
                                    <a href="#" data-route="post" data-id="${postId}" class="btn btn-secondary">Cancel</a>
                                </div>
                            </form>
                            <div class="post-editor-preview">
                                <h3 class="sidebar-title">Preview</h3>
                                <div id="editPostPreview" style="color: var(--text-secondary); line-height: 1.8; white-space: pre-wrap;">${app.escapeHtml(post.content)}</div>
                            </div>
                        </div>
                    </div>
                `;

                // Setup live preview for edit
                const editContent = document.getElementById('editPostContent');
                const editPreview = document.getElementById('editPostPreview');
                if (editContent && editPreview) {
                    editContent.addEventListener('input', () => {
                        editPreview.textContent = editContent.value;
                    });
                }

                // Re-attach route listeners
                document.querySelectorAll('[data-route]').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const route = link.getAttribute('data-route');
                        const id = link.getAttribute('data-id');
                        if (id) {
                            app.navigate(`${route}?id=${id}`);
                        } else {
                            app.navigate(route);
                        }
                    });
                });
            }
        } catch (error) {
            container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h2>Error loading post</h2><p>${error.message}</p></div>`;
        }
    },

    // Render Profile Page
    renderProfile: async () => {
        const container = document.getElementById('app');
        const user = auth.getCurrentUser();
        const hashParts = window.location.hash.split('?');
        const params = hashParts.length > 1 ? new URLSearchParams(hashParts[1]) : new URLSearchParams();
        const page = parseInt(params.get('page')) || 1;
        const activeTab = params.get('tab') || 'posts';

        if (!user) {
            app.navigate('login');
            return;
        }

        try {
            const [postsResponse, commentsResponse] = await Promise.all([
                api.getUserPosts(user._id, page, app.pageLimit),
                api.getComments(null, 1, 10) // TODO: Get user's comments
            ]);
            
            if (postsResponse.status === 'success') {
                const posts = postsResponse.data.posts || [];
                const pagination = postsResponse.data.pagination || {};
                const userInitial = (user.username || 'U').charAt(0).toUpperCase();

                container.innerHTML = `
                    <div class="page fade-in">
                        <div class="profile-header">
                            <span class="profile-avatar-large">${userInitial}</span>
                            <div class="profile-info">
                                <h1 class="profile-name">${app.escapeHtml(user.username)}</h1>
                                <div class="profile-bio">${user.bio || 'No bio yet.'}</div>
                                <div class="profile-meta">
                                    <span>${posts.length} posts</span>
                                    <span>•</span>
                                    <span>${app.escapeHtml(user.email)}</span>
                                </div>
                            </div>
                        </div>
                        <div class="profile-tabs">
                            <button class="profile-tab ${activeTab === 'posts' ? 'active' : ''}" onclick="app.switchProfileTab('posts')">Posts</button>
                            <button class="profile-tab ${activeTab === 'comments' ? 'active' : ''}" onclick="app.switchProfileTab('comments')">Comments</button>
                        </div>
                        <div id="profileContent">
                            ${activeTab === 'posts' ? `
                                <div id="postsContainer">
                                    ${posts.length > 0 
                                        ? posts.map(post => app.renderPostCard(post)).join('')
                                        : '<div class="empty-state"><div class="empty-state-icon">📝</div><p>You haven\'t created any posts yet</p></div>'
                                    }
                                </div>
                                ${pagination.pages > 1 ? app.renderPagination(pagination) : ''}
                            ` : `
                                <div id="commentsContainer">
                                    <div class="empty-state"><div class="empty-state-icon">💬</div><p>Your comments will appear here</p></div>
                                </div>
                            `}
                        </div>
                    </div>
                `;

                // Re-attach route listeners
                document.querySelectorAll('[data-route]').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const route = link.getAttribute('data-route');
                        app.navigate(route);
                    });
                });
            }
        } catch (error) {
            container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">⚠️</div><h2>Error loading profile</h2><p>${error.message}</p></div>`;
        }
    },

    // Switch profile tab
    switchProfileTab: (tab) => {
        app.navigate(`profile?tab=${tab}`);
    },

    // Render Post Card
    renderPostCard: (post) => {
        const excerpt = post.content.length > 200 
            ? post.content.substring(0, 200) + '...' 
            : post.content;
        const tags = post.tags || [];
        const authorInitial = (post.authorId?.username || 'U').charAt(0).toUpperCase();
        const likeCount = post.likesCount || 0;
        const commentCount = post.commentsCount || 0;
        
        return `
            <div class="card">
                <div class="post-card-header">
                    <span class="post-author-avatar">${authorInitial}</span>
                    <div class="post-author-info">
                        <a href="#" data-route="profile" data-user-id="${post.authorId?._id || ''}" class="post-author-name">
                            ${app.escapeHtml(post.authorId?.username || 'Unknown')}
                        </a>
                        <div class="post-meta">
                            <span>${ui.formatDate(post.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <h2 class="card-title">
                    <a href="#" data-route="post" data-id="${post._id}" style="color: var(--text-primary); text-decoration: none;">
                        ${app.escapeHtml(post.title)}
                    </a>
                </h2>
                ${tags.length > 0 ? `
                    <div class="post-tags">
                        ${tags.map(tag => `<span class="post-tag">#${app.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
                <div class="card-content">${app.escapeHtml(excerpt)}</div>
                <div class="card-footer">
                    <div class="post-stats">
                        <span class="post-stat">❤️ ${likeCount}</span>
                        <span class="post-stat">💬 ${commentCount}</span>
                    </div>
                    <a href="#" data-route="post" data-id="${post._id}" class="btn btn-secondary">Read More</a>
                </div>
            </div>
        `;
    },

    // Render Comment Card
    renderCommentCard: (comment) => {
        const user = auth.getCurrentUser();
        const isAuthor = user && user._id === comment.authorId?._id;

        return `
            <div class="comment-card" data-comment-id="${comment._id}">
                <div class="comment-header">
                    <span class="comment-author">${app.escapeHtml(comment.authorId?.username || 'Unknown')}</span>
                    <div>
                        <span class="comment-date">${ui.formatDate(comment.createdAt)}</span>
                        ${isAuthor ? `<button onclick="app.deleteComment('${comment._id}')" class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.875rem; margin-left: 0.5rem;">Delete</button>` : ''}
                    </div>
                </div>
                <div class="comment-content">${app.escapeHtml(comment.content).replace(/\n/g, '<br>')}</div>
            </div>
        `;
    },

    // Render Pagination
    renderPagination: (pagination) => {
        const currentPage = pagination.page;
        const totalPages = pagination.pages;
        const route = app.currentPage;

        return `
            <div class="pagination">
                <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} 
                    onclick="app.navigate('${route}?page=${currentPage - 1}')">Previous</button>
                <span class="pagination-info">Page ${currentPage} of ${totalPages}</span>
                <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} 
                    onclick="app.navigate('${route}?page=${currentPage + 1}')">Next</button>
            </div>
        `;
    },

    // Handle Create Comment (Optimistic UI)
    handleCreateComment: async (postId, form) => {
        const content = form.querySelector('[name="content"]').value.trim();
        
        if (!content) {
            ui.showToast('Comment cannot be empty', 'error');
            return;
        }

        const user = auth.getCurrentUser();
        const tempComment = {
            _id: 'temp-' + Date.now(),
            postId,
            content,
            authorId: { username: user.username },
            createdAt: new Date().toISOString(),
        };

        // Optimistic update with animation
        const commentsContainer = document.getElementById('commentsContainer');
        const emptyState = commentsContainer.querySelector('.empty-state');
        if (emptyState) emptyState.remove();
        
        const tempHtml = app.renderCommentCard(tempComment);
        commentsContainer.insertAdjacentHTML('afterbegin', tempHtml);
        
        // Add optimistic animation
        const tempEl = commentsContainer.querySelector(`[data-comment-id="${tempComment._id}"]`);
        if (tempEl) {
            tempEl.classList.add('optimistic');
            setTimeout(() => tempEl.classList.remove('optimistic'), 500);
        }
        
        form.querySelector('[name="content"]').value = '';

        try {
            const response = await api.createComment(postId, content);
            
            if (response.status === 'success') {
                // Replace temp comment with real one
                if (tempEl) {
                    tempEl.outerHTML = app.renderCommentCard(response.data.comment);
                }
                ui.showToast('Comment posted successfully', 'success');
            } else {
                throw new Error(response.message || 'Failed to post comment');
            }
        } catch (error) {
            // Rollback
            if (tempEl) tempEl.remove();
            
            if (commentsContainer.children.length === 0) {
                commentsContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💬</div><p>No comments yet</p></div>';
            }
            
            ui.showToast(error.message || 'Failed to post comment', 'error');
        }
    },

    // Handle Delete Comment
    deleteComment: async (commentId) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        const commentEl = document.querySelector(`[data-comment-id="${commentId}"]`);
        if (!commentEl) return;

        // Optimistic delete
        commentEl.style.opacity = '0.5';

        try {
            const response = await api.deleteComment(commentId);
            
            if (response.status === 'success') {
                commentEl.remove();
                ui.showToast('Comment deleted', 'success');
                
                const commentsContainer = document.getElementById('commentsContainer');
                if (commentsContainer && commentsContainer.children.length === 0) {
                    commentsContainer.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💬</div><p>No comments yet</p></div>';
                }
            }
        } catch (error) {
            commentEl.style.opacity = '1';
            ui.showToast(error.message || 'Failed to delete comment', 'error');
        }
    },

    // Handle Delete Post
    deletePost: async (postId) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            const response = await api.deletePost(postId);
            
            if (response.status === 'success') {
                ui.showToast('Post deleted', 'success');
                app.navigate('feed');
            }
        } catch (error) {
            ui.showToast(error.message || 'Failed to delete post', 'error');
        }
    },

    // Escape HTML
    escapeHtml: (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Toggle publish switch
    togglePublish: () => {
        const toggle = document.getElementById('publishToggle');
        if (toggle) {
            toggle.classList.toggle('active');
        }
    },

    // Render Debug Page
    renderDebug: () => {
        return `
            <div class="page fade-in">
                <h1 class="page-title">Debug Dashboard</h1>
                <iframe src="debug.html" style="width: 100%; height: 800px; border: 1px solid var(--border-color); border-radius: var(--radius-lg);"></iframe>
            </div>
        `;
    },
};

// Setup form handlers after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    app.init();

    // Login form
    document.addEventListener('submit', async (e) => {
        if (e.target.id === 'loginForm') {
            e.preventDefault();
            ui.clearFormErrors(e.target);
            
            if (!ui.validateForm(e.target)) return;

            const formData = new FormData(e.target);
            const result = await auth.login(formData.get('email'), formData.get('password'));
            
            if (result.success) {
                ui.showToast('Login successful', 'success');
                ui.updateNavigation();
                app.navigate('feed');
            } else {
                ui.showToast(result.error || 'Login failed', 'error');
            }
        }

        // Register form
        if (e.target.id === 'registerForm') {
            e.preventDefault();
            ui.clearFormErrors(e.target);
            
            if (!ui.validateForm(e.target)) return;

            const formData = new FormData(e.target);
            const result = await auth.register(
                formData.get('username'),
                formData.get('email'),
                formData.get('password')
            );
            
            if (result.success) {
                ui.showToast('Registration successful', 'success');
                ui.updateNavigation();
                app.navigate('feed');
            } else {
                ui.showToast(result.error || 'Registration failed', 'error');
            }
        }

        // Create post form
        if (e.target.id === 'createPostForm') {
            e.preventDefault();
            ui.clearFormErrors(e.target);
            
            if (!ui.validateForm(e.target)) return;

            const formData = new FormData(e.target);
            const title = formData.get('title').trim();
            const content = formData.get('content').trim();
            const tagsStr = formData.get('tags')?.trim() || '';
            const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];

            try {
                const response = await api.createPost(title, content, tags);
                
                if (response.status === 'success') {
                    ui.showToast('Post created successfully', 'success');
                    app.navigate(`post?id=${response.data.post._id}`);
                } else {
                    throw new Error(response.message || 'Failed to create post');
                }
            } catch (error) {
                ui.showToast(error.message || 'Failed to create post', 'error');
            }
        }

        // Edit post form
        if (e.target.id === 'editPostForm') {
            e.preventDefault();
            ui.clearFormErrors(e.target);
            
            if (!ui.validateForm(e.target)) return;

            const hashParts = window.location.hash.split('?');
            const postId = hashParts.length > 1 ? new URLSearchParams(hashParts[1]).get('id') : null;
            if (!postId) {
                ui.showToast('Post ID not found', 'error');
                return;
            }

            const formData = new FormData(e.target);
            const title = formData.get('title').trim();
            const content = formData.get('content').trim();
            const tagsStr = formData.get('tags')?.trim() || '';
            const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];

            try {
                const response = await api.updatePost(postId, title, content, tags);
                
                if (response.status === 'success') {
                    ui.showToast('Post updated successfully', 'success');
                    app.navigate(`post?id=${postId}`);
                } else {
                    throw new Error(response.message || 'Failed to update post');
                }
            } catch (error) {
                ui.showToast(error.message || 'Failed to update post', 'error');
            }
        }
    });
});

