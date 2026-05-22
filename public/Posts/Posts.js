document.addEventListener('DOMContentLoaded', () => {
    const currentUser = document.body.getAttribute('data-current-user') || 'Guest';
    loadState();

    // LIKE LOGIC
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const postCard = btn.closest('.post-card');
            const postId = postCard.getAttribute('data-post-id');
            const countSpan = btn.querySelector('.like-count');
            
            let userLikes = JSON.parse(localStorage.getItem(`likes_${currentUser}`)) || {};
            let globalLikes = JSON.parse(localStorage.getItem('global_likes')) || {};

            if (!userLikes[postId]) {
                userLikes[postId] = true;
                globalLikes[postId] = (globalLikes[postId] || parseInt(countSpan.innerText)) + 1;
                updateLikeUI(btn, true, globalLikes[postId]);
            } else {
                delete userLikes[postId];
                globalLikes[postId] = Math.max(0, (globalLikes[postId] || 1) - 1);
                updateLikeUI(btn, false, globalLikes[postId]);
            }
            localStorage.setItem(`likes_${currentUser}`, JSON.stringify(userLikes));
            localStorage.setItem('global_likes', JSON.stringify(globalLikes));
        });
    });

    // COMMENT MODAL LOGIC
    const modal = document.getElementById("commentModal");
    const closeBtn = document.querySelector(".close-modal");
    const submitBtn = document.getElementById('submitComment');
    const commentInput = document.getElementById('newCommentInput');

    document.querySelectorAll('.comment-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const postId = btn.closest('.post-card').getAttribute('data-post-id');
            modal.setAttribute('data-active-post', postId);
            document.getElementById('modalTitle').innerText = `Comments on "${postId}"`;
            renderComments(postId);
            modal.style.display = "block";
        });
    });

    submitBtn.addEventListener('click', () => {
        const postId = modal.getAttribute('data-active-post');
        const text = commentInput.value.trim();
        if (!text) return;

        let allComments = JSON.parse(localStorage.getItem('global_comments')) || {};
        if (!allComments[postId]) allComments[postId] = [];

        allComments[postId].push({
            id: Date.now(),
            username: currentUser,
            text: text,
            likes: 0,
            likedBy: []
        });

        localStorage.setItem('global_comments', JSON.stringify(allComments));
        commentInput.value = "";
        renderComments(postId);
        updateCommentCountUI(postId, allComments[postId].length);
    });

    closeBtn.onclick = () => modal.style.display = "none";
    window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; };

    function renderComments(postId) {
        const container = document.getElementById('commentsList');
        const allComments = JSON.parse(localStorage.getItem('global_comments')) || {};
        const comments = allComments[postId] || [];

        container.innerHTML = comments.map(c => {
            const hasLiked = c.likedBy.includes(currentUser);
            // Only show delete button if current user is the author
            const deleteBtn = c.username === currentUser ? 
                `<button class="delete-comment-btn" onclick="deleteComment('${postId}', ${c.id})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>` : '';

            return `
                <div class="comment-item">
                    <div class="comment-main">
                        <div class="comment-user"><strong>${c.username}</strong></div>
                        <div class="comment-text">${c.text}</div>
                        <div class="comment-actions">
                            <button class="c-like-btn ${hasLiked ? 'active' : ''}" onclick="toggleCommentLike('${postId}', ${c.id})">
                                ${hasLiked ? '❤️' : '🤍'} ${c.likes}
                            </button>
                            ${deleteBtn}
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    window.deleteComment = (postId, commentId) => {
        if (!confirm("Delete this comment?")) return;
        let allComments = JSON.parse(localStorage.getItem('global_comments'));
        allComments[postId] = allComments[postId].filter(c => c.id !== commentId);
        localStorage.setItem('global_comments', JSON.stringify(allComments));
        renderComments(postId);
        updateCommentCountUI(postId, allComments[postId].length);
    };

    window.toggleCommentLike = (postId, commentId) => {
        let allComments = JSON.parse(localStorage.getItem('global_comments'));
        let comment = allComments[postId].find(c => c.id === commentId);
        if (comment.likedBy.includes(currentUser)) {
            comment.likes--;
            comment.likedBy = comment.likedBy.filter(u => u !== currentUser);
        } else {
            comment.likes++;
            comment.likedBy.push(currentUser);
        }
        localStorage.setItem('global_comments', JSON.stringify(allComments));
        renderComments(postId);
    };

    // Helper UI functions
    function updateLikeUI(btn, isLiked, count) {
        const countSpan = btn.querySelector('.like-count');
        const heartIcon = btn.querySelector('.heart-icon');
        countSpan.innerText = count;
        heartIcon.style.fill = isLiked ? "red" : "none";
        heartIcon.style.stroke = isLiked ? "red" : "currentColor";
        btn.style.color = isLiked ? "red" : "inherit";
    }

    function updateCommentCountUI(postId, count) {
        const card = document.querySelector(`.post-card[data-post-id="${postId}"]`);
        if (card) card.querySelector('.comment-count').innerText = count;
    }

    function loadState() {
        const userLikes = JSON.parse(localStorage.getItem(`likes_${currentUser}`)) || {};
        const globalLikes = JSON.parse(localStorage.getItem('global_likes')) || {};
        const globalComments = JSON.parse(localStorage.getItem('global_comments')) || {};

        document.querySelectorAll('.post-card').forEach(card => {
            const postId = card.getAttribute('data-post-id');
            if (globalLikes[postId] !== undefined) card.querySelector('.like-count').innerText = globalLikes[postId];
            if (userLikes[postId]) updateLikeUI(card.querySelector('.like-btn'), true, globalLikes[postId]);
            if (globalComments[postId]) card.querySelector('.comment-count').innerText = globalComments[postId].length;
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = document.body.getAttribute('data-current-user') || 'Guest';
    
    // --- POST VIEW MODAL LOGIC ---
    const postViewModal = document.getElementById("postViewModal");
    const closeViewBtn = document.querySelector(".close-view-modal");

    document.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Check if user clicked a button or icon; if so, don't open the full post
            if (e.target.closest('button') || e.target.closest('.stat-item')) return;

            // Extract data from the card
            const title = card.querySelector('.post-content h2').innerText;
            const content = card.querySelector('.post-content p').innerText;
            const user = card.querySelector('.user-details h4').innerText;
            const avatar = card.querySelector('.avatar').innerText;
            const topic = card.querySelector('.topic-badge').innerText;
            const footerClone = card.querySelector('.post-footer').innerHTML;

            // Populate Modal
            document.getElementById('viewTitle').innerText = title;
            document.getElementById('viewFullText').innerText = content;
            document.getElementById('viewUser').innerText = user;
            document.getElementById('viewAvatar').innerText = avatar;
            document.getElementById('viewTopic').innerText = topic;
            document.getElementById('viewFooter').innerHTML = footerClone;

            postViewModal.style.display = "block";
        });
    });

    closeViewBtn.onclick = () => postViewModal.style.display = "none";

    // --- EXISTING COMMENT/LIKE LOGIC ---
    // Note: Use Event Delegation for likes/comments inside the Post View Modal
    postViewModal.addEventListener('click', (e) => {
        const likeBtn = e.target.closest('.like-btn');
        const commentBtn = e.target.closest('.comment-trigger');
        
        if (likeBtn) {
            // Trigger the same like logic as the main feed
            const postId = document.getElementById('viewTitle').innerText;
            handleLikeAction(likeBtn, postId);
        }
        if (commentBtn) {
            postViewModal.style.display = "none"; // Close view to open comments
            const postId = document.getElementById('viewTitle').innerText;
            openCommentModal(postId);
        }
    });

    // Reusable Like Handler
    function handleLikeAction(btn, postId) {
        let userLikes = JSON.parse(localStorage.getItem(`likes_${currentUser}`)) || {};
        let globalLikes = JSON.parse(localStorage.getItem('global_likes')) || {};
        const countSpan = btn.querySelector('.like-count');

        if (!userLikes[postId]) {
            userLikes[postId] = true;
            globalLikes[postId] = (globalLikes[postId] || parseInt(countSpan.innerText)) + 1;
        } else {
            delete userLikes[postId];
            globalLikes[postId] = Math.max(0, globalLikes[postId] - 1);
        }

        localStorage.setItem(`likes_${currentUser}`, JSON.stringify(userLikes));
        localStorage.setItem('global_likes', JSON.stringify(globalLikes));
        
        // Sync the UI across all instances (Feed + Modal)
        location.reload(); // Simplest way to sync UI for this prototype
    }
});