/* 
 
 // Display notifications sorted by comment timestamp (newest first)
    async function displayNotifications() {
      const notificationsContainer = document.getElementById("postsContainer");
      notificationsContainer.innerHTML = "";

      const user = firebase.auth().currentUser;
      if (!user) return;

      // 1. Get user's posts
      const postsSnapshot = await db.collection("posts")
        .where("owner", "==", user.uid)
        .get();

      // 2. Collect all unread comments with timestamps
      const unreadComments = [];
      for (const postDoc of postsSnapshot.docs) {
        const postData = postDoc.data();
        if (!postData.comments) continue;

        for (const commentId of postData.comments) {
          const commentDoc = await db.collection("comments").doc(commentId).get();
          const commentData = commentDoc.data();

          if (commentData.read === false) {
            const commenterDoc = await db.collection("users").doc(commentData.owner).get();
            unreadComments.push({
              postTitle: postData.details,
              commenterName: commenterDoc.data().name,
              commentId: commentId,
              timestamp: commentData.timestamp // Ensure this field exists
            });
          }
        }
      }

      // 3. Sort by most recent comment
      unreadComments.sort((a, b) => b.timestamp - a.timestamp);

      // 4. Display sorted notifications
      unreadComments.forEach(comment => {
        const card = document.createElement("div");
        card.className = "notification-card";
        card.innerHTML = `
          <div class="notification-content">
            <h5>New comment on: ${comment.postTitle}</h5>
            <p>By: ${comment.commenterName}</p>
            <button class="mark-read-btn" data-comment-id="${comment.commentId}">
              Mark as Read
            </button>
            <button class="view-post-btn">View Post</button>
          </div>
        `;
        notificationsContainer.appendChild(card);
      });

      // 5. Add click handlers
      document.querySelectorAll(".mark-read-btn").forEach(button => {
        button.addEventListener("click", async (e) => {
          const commentId = e.target.dataset.commentId;
          await db.collection("comments").doc(commentId).update({ read: true });
          e.target.closest(".notification-card").remove();
        });
      });

      // 6. Add "Mark All as Read" button (new!)
      const markAllButton = document.createElement("button");
      markAllButton.textContent = "Mark All as Read";
      markAllButton.className = "mark-all-read-btn";
      markAllButton.addEventListener("click", async () => {
        const batch = db.batch();
        unreadComments.forEach(comment => {
          const commentRef = db.collection("comments").doc(comment.commentId);
          batch.update(commentRef, { read: true });
        });
        await batch.commit();
        notificationsContainer.innerHTML = ""; // Clear all
      });
      notificationsContainer.prepend(markAllButton);
    }
*/

// Global variable to hold unread comments
let globalUnreadComments = [];

// Display notifications sorted by comment timestamp (newest first)
async function displayNotifications() {
  const notificationsContainer = document.getElementById("postsContainer");
  notificationsContainer.innerHTML = "";

  const user = firebase.auth().currentUser;
  if (!user) return;

  // 1. Get user's posts
  const postsSnapshot = await db.collection("posts")
    .where("owner", "==", user.uid)
    .get();

  // 2. For each post, query its "comments" subcollection for unread comments
  const unreadComments = [];
  for (const postDoc of postsSnapshot.docs) {
    const postData = postDoc.data();
    // Query unread comments in the subcollection of each post
    const commentsSnapshot = await db.collection("posts")
      .doc(postDoc.id)
      .collection("comments")
      .where("read", "==", false)
      .get();
    
    commentsSnapshot.forEach(commentDoc => {
      const commentData = commentDoc.data();
      const commenterName = commentData.user || "Anonymous";
      unreadComments.push({
        postId: postDoc.id,
        postTitle: postData.title || "Untitled Post",
        commenterName: commenterName,
        commentId: commentDoc.id,
        timestamp: commentData.timestamp
      });
    });
  }

  // Store unread comments globally so markAllRead() can access them.
  globalUnreadComments = unreadComments;

  // 3. Sort unread comments by most recent timestamp (newest first)
  unreadComments.sort((a, b) => {
    if (!a.timestamp || !b.timestamp) return 0;
    return b.timestamp.toMillis() - a.timestamp.toMillis();
  });

  // 4. Display sorted notifications
  unreadComments.forEach(comment => {
    const card = document.createElement("div");
    card.className = "notification-card";
    card.innerHTML = `
      <div class="notification-content">
        <h5>New comment on: ${comment.postTitle}</h5>
        <p>By: ${comment.commenterName}</p>
        <button class="mark-read-btn" data-post-id="${comment.postId}" data-comment-id="${comment.commentId}">
          Mark as Read
        </button>
        <button class="view-post-btn" data-post-id="${comment.postId}">
          View Post
        </button>
      </div>
    `;
    notificationsContainer.appendChild(card);
  });

  // 5. Add click handlers for "Mark as Read" and "View Post" buttons
  document.querySelectorAll(".mark-read-btn").forEach(button => {
    button.addEventListener("click", async (e) => {
      const postId = e.target.dataset.postId;
      const commentId = e.target.dataset.commentId;
      await db.collection("posts").doc(postId).collection("comments").doc(commentId).update({ read: true });
      e.target.closest(".notification-card").remove();
    });
  });

  document.querySelectorAll(".view-post-btn").forEach(button => {
    button.addEventListener("click", (e) => {
      const postId = e.target.dataset.postId;
      window.location.href = `inside_post.html?postId=${postId}`;
    });
  });
}

// Global function called by the "Mark all as read" button in the HTML
async function markAllRead() {
  if (globalUnreadComments.length === 0) return;
  const batch = db.batch();
  globalUnreadComments.forEach(comment => {
    const commentRef = db.collection("posts").doc(comment.postId).collection("comments").doc(comment.commentId);
    batch.update(commentRef, { read: true });
  });
  await batch.commit();
  // Refresh notifications after marking all as read
  displayNotifications();
}

// Call displayNotifications() on page load
window.onload = displayNotifications;
