// Force Firestore to use HTTP long polling
const db = firebase.firestore();
db.settings({
  experimentalForceLongPolling: true, // Bypass WebSocket CSP issues
  merge: true
});

// Display notifications
async function displayNotifications() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  try {
    // 1. Get user's posts
    const postsSnapshot = await db.collection("posts")
      .where("owner", "==", user.uid)
      .get();

    // 2. Collect unread comments
    const unreadComments = [];
    for (const postDoc of postsSnapshot.docs) {
      const commentsSnapshot = await db.collection("posts")
        .doc(postDoc.id)
        .collection("comments")
        .where("read", "==", false)
        .get();

      commentsSnapshot.forEach(commentDoc => {
        const commentData = commentDoc.data();
        unreadComments.push({
          postId: postDoc.id,
          postTitle: postDoc.data().title || "Untitled Post",
          commentText: commentData.commentText || "",
          commenterName: commentData.user || "Anonymous",
          timestamp: commentData.timestamp?.toDate() || new Date(),
          commentId: commentDoc.id
        });
      });
    }

    // 3. Sort by timestamp
    unreadComments.sort((a, b) => b.timestamp - a.timestamp);

    // 4. Render notifications
    const container = document.getElementById("postsContainer");
    container.innerHTML = unreadComments.map(comment => `
      <div class="notification-card">
        <h4>New comment on: ${comment.postTitle}</h4>
        <p>${comment.commentText}</p>
        <small>By ${comment.commenterName} at ${comment.timestamp.toLocaleString()}</small>
        <button class="mark-read" 
                data-post-id="${comment.postId}" 
                data-comment-id="${comment.commentId}">
          Mark as Read
        </button>
      </div>
    `).join("");

    // Add click listeners
    document.querySelectorAll(".mark-read").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const postId = e.target.dataset.postId;
        const commentId = e.target.dataset.commentId;
        await db.collection("posts")
          .doc(postId)
          .collection("comments")
          .doc(commentId)
          .update({ read: true });
        e.target.closest(".notification-card").remove();
      });
    });

  } catch (error) {
    console.error("Error loading notifications:", error);
  }
}

// Initialize on page load
window.onload = () => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) displayNotifications();
  });
};