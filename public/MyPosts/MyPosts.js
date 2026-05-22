document.addEventListener('DOMContentLoaded', () => {
    const currentUser = document.body.getAttribute('data-current-user') || 'Guest';
    
    loadState();

    // Like Logic
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const postCard = btn.closest('.post-card');
            const postId = postCard.getAttribute('data-post-id');
            const countSpan = btn.querySelector('.like-count');
            const heartIcon = btn.querySelector('.heart-icon');
            
            let userLikes = JSON.parse(localStorage.getItem(`likes_${currentUser}`)) || {};
            let globalLikes = JSON.parse(localStorage.getItem('global_likes')) || {};

            if (!userLikes[postId]) {
                userLikes[postId] = true;
                globalLikes[postId] = (globalLikes[postId] || parseInt(countSpan.innerText)) + 1;
                updateLikeUI(btn, true, globalLikes[postId]);
            } else {
                delete userLikes[postId];
                globalLikes[postId] = (globalLikes[postId] || 1) - 1;
                updateLikeUI(btn, false, globalLikes[postId]);
            }

            localStorage.setItem(`likes_${currentUser}`, JSON.stringify(userLikes));
            localStorage.setItem('global_likes', JSON.stringify(globalLikes));
        });
    });

    // Modal Variables
    const modal = document.getElementById("commentModal");
    const closeBtn = document.querySelector(".close-modal");
    const submitBtn = document.getElementById('submitComment');
    const commentInput = document.getElementById('newCommentInput');

    // Open Comments
    document.querySelectorAll('.comment-trigger').forEach(btn => {
        btn.addEventListener('click', () => {
            const postCard = btn.closest('.post-card');
            const postId = postCard.getAttribute('data-post-id');
            modal.setAttribute('data-active-post', postId);
            document.getElementById('modalTitle').innerText = `Comments on "${postId}"`;
            renderComments(postId);
            modal.style.display = "block";
        });
    });

    // Submit Comment
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

    function updateLikeUI(btn, isLiked, count) {
        const countSpan = btn.querySelector('.like-count');
        const heartIcon = btn.querySelector('.heart-icon');
        countSpan.innerText = count;
        heartIcon.style.fill = isLiked ? "red" : "none";
        heartIcon.style.stroke = isLiked ? "red" : "currentColor";
        btn.style.color = isLiked ? "red" : "inherit";
    }

    function renderComments(postId) {
        const container = document.getElementById('commentsList');
        const allComments = JSON.parse(localStorage.getItem('global_comments')) || {};
        const comments = allComments[postId] || [];

        container.innerHTML = comments.map(c => {
            const hasLiked = c.likedBy.includes(currentUser);
            return `
                <div class="comment-item" style="padding:10px 0; border-bottom:1px solid #eee;">
                    <div style="font-size:0.85rem; color:#FF5722;"><strong>${c.username}</strong></div>
                    <div style="margin:5px 0;">${c.text}</div>
                    <button class="c-like-btn" style="border:none; background:none; cursor:pointer; color:${hasLiked ? 'red':'#666'}" 
                            onclick="toggleCommentLike('${postId}', ${c.id})">
                        ${hasLiked ? '❤️' : '🤍'} ${c.likes}
                    </button>
                </div>
            `;
        }).join('');
    }

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
            const likeBtn = card.querySelector('.like-btn');
            
            if (globalLikes[postId] !== undefined) {
                likeBtn.querySelector('.like-count').innerText = globalLikes[postId];
            }
            if (userLikes[postId]) {
                updateLikeUI(likeBtn, true, globalLikes[postId]);
            }
            if (globalComments[postId]) {
                card.querySelector('.comment-count').innerText = globalComments[postId].length;
            }
        });
    }
});