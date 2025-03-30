async function displayNotifications() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  try {
    // 1. Get all unread comments for this user
    const commentsSnapshot = await db.collection('all_comments')
      .where('postOwner', '==', user.uid)
      .where('read', '==', false)
      .orderBy('timestamp', 'desc')
      .get();

    // 2. Group comments by postId
    const postsMap = new Map();
    
    commentsSnapshot.forEach(doc => {
      const comment = doc.data();
      if (!postsMap.has(comment.postId)) {
        postsMap.set(comment.postId, {
          postId: comment.postId,
          commentCount: 0,
          latestComment: comment.timestamp.toDate(),
          comments: []
        });
      }
      const postEntry = postsMap.get(comment.postId);
      postEntry.commentCount++;
      postEntry.comments.push(comment);
      if (comment.timestamp > postEntry.latestComment) {
        postEntry.latestComment = comment.timestamp;
      }
    });

    // 3. Get post details for each unique postId
    const postsWithComments = [];
    for (const [postId, data] of postsMap) {
      const postDoc = await db.collection('posts').doc(postId).get();
      if (postDoc.exists) {
        postsWithComments.push({
          ...postDoc.data(),
          id: postId,
          unreadCount: data.commentCount,
          latestComment: data.latestComment
        });
      }
    }

    // 4. Sort posts by latest comment time
    postsWithComments.sort((a, b) => b.latestComment - a.latestComment);

    // 5. Display notifications
    const container = document.getElementById('postsContainer');
    container.innerHTML = postsWithComments.map(post => `
      <div class="card mb-3">
        <div class="card-body">
          <h5>${post.title}</h5>
          <p>${post.content.substring(0, 50)}...</p>
          <div class="d-flex justify-content-between align-items-center">
            <small>
              ${post.unreadCount} unread comments<br>
              Last comment: ${post.latestComment.toLocaleString()}
            </small>
            <div>
              <button class="btn btn-sm btn-primary" 
                      onclick="viewPost('${post.id}')">
                View Post
              </button>
              <button class="btn btn-sm btn-secondary" 
                      onclick="markPostRead('${post.id}')">
                Mark Read
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error loading notifications:', error);
    document.getElementById('postsContainer').innerHTML = `
      <div class="alert alert-danger">
        Error loading notifications. Please try again later.
      </div>
    `;
  }
}

// Helper functions
async function markPostRead(postId) {
  try {
    // Get all unread comments for this post
    const commentsSnapshot = await db.collection('all_comments')
      .where('postId', '==', postId)
      .where('read', '==', false)
      .get();

    // Batch update
    const batch = db.batch();
    
    commentsSnapshot.forEach(doc => {
      // Update all_comments
      const globalRef = db.collection('all_comments').doc(doc.id);
      batch.update(globalRef, { read: true });
      
      // Update subcollection comment
      const subcollectionRef = db.collection('posts')
        .doc(postId)
        .collection('comments')
        .doc(doc.id);
      batch.update(subcollectionRef, { read: true });
    });

    await batch.commit();
    displayNotifications(); // Refresh the list
  } catch (error) {
    console.error('Error marking post read:', error);
  }
}

function viewPost(postId) {
  window.location.href = `inside_post.html?postId=${postId}`;
}

// Initialize
firebase.auth().onAuthStateChanged(user => {
  if (user) displayNotifications();
});