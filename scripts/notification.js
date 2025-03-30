

try {
  if (db && !db._configured) { // Check if db exists and isn't configured
    db.settings({
      experimentalForceLongPolling: true,
      merge: true
    });
  }
} catch (error) {
  console.error("Error configuring Firestore:", error);
}

// Main function to display notifications
async function displayNotifications() {
  const notificationsContainer = document.getElementById("postsContainer");
  notificationsContainer.innerHTML = "<div class='text-center'><div class='spinner-border'></div></div>";
  
  const user = firebase.auth().currentUser;
  if (!user) {
    notificationsContainer.innerHTML = "<p class='text-center'>Please log in to view notifications</p>";
    return;
  }

  try {
    // Query with composite index
    const query = db.collection("all_comments")
      .where("postOwner", "==", user.uid)
      .where("read", "==", false)
      .orderBy("timestamp", "desc");

    const unsubscribe = query.onSnapshot(async snapshot => {
      if (snapshot.empty) {
        notificationsContainer.innerHTML = "<p class='text-center'>No new notifications</p>";
        return;
      }

      const notifications = await Promise.all(snapshot.docs.map(async doc => {
        const comment = doc.data();
        const postDoc = await db.collection("posts").doc(comment.postId).get();
        return {
          id: doc.id,
          ...comment,
          postTitle: postDoc.data()?.title || "Deleted Post",
          timestamp: comment.timestamp.toDate(),
          postId: comment.postId
        };
      }));

      renderNotifications(notifications);
    }, error => {
      console.error("Notification error:", error);
      showError("Error loading notifications");
    });

    window.addEventListener("beforeunload", () => unsubscribe());

  } catch (error) {
    console.error("Notification error:", error);
    showError(error.message);
  }
}

function renderNotifications(notifications) {
  const container = document.getElementById("postsContainer");
  container.innerHTML = notifications.map(notif => `
    <div class="card mb-3 notification-card" data-comment-id="${notif.id}" data-post-id="${notif.postId}">
      <div class="card-body">
        <h5 class="card-title">New comment on: ${notif.postTitle}</h5>
        <p class="card-text">${notif.commentText}</p>
        <div class="d-flex justify-content-between align-items-center">
          <small class="text-muted">
            ${notif.user} - ${notif.timestamp.toLocaleString()}
          </small>
          <div>
            <button class="btn btn-sm btn-outline-primary mark-read-btn">
              Mark Read
            </button>
            <a href="inside_post.html?postId=${notif.postId}" 
               class="btn btn-sm btn-primary">
              View Post
            </a>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  // Add click handlers for mark read buttons
  document.querySelectorAll(".mark-read-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const card = e.target.closest(".notification-card");
      const commentId = card.dataset.commentId;
      const postId = card.dataset.postId;
      
      try {
        await markCommentRead(postId, commentId);
        card.remove();
      } catch (error) {
        console.error("Mark read error:", error);
        showError("Error marking as read");
      }
    });
  });
}

// Mark single comment as read
async function markCommentRead(postId, commentId) {
  const batch = db.batch();
  
  // Update both collections
  const globalCommentRef = db.collection("all_comments").doc(commentId);
  batch.update(globalCommentRef, { read: true });

  const postCommentRef = db.collection("posts")
    .doc(postId)
    .collection("comments")
    .doc(commentId);
  batch.update(postCommentRef, { read: true });

  await batch.commit();
}

// Mark all comments as read
async function markAllRead() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const snapshot = await db.collection("all_comments")
    .where("postOwner", "==", user.uid)
    .where("read", "==", false)
    .get();

  if (snapshot.empty) return;

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { read: true });
    const postCommentRef = db.collection("posts")
      .doc(doc.data().postId)
      .collection("comments")
      .doc(doc.id);
    batch.update(postCommentRef, { read: true });
  });

  await batch.commit();
  displayNotifications(); // Refresh the list
}

function showError(message) {
  const container = document.getElementById("postsContainer");
  container.innerHTML = `
    <div class="alert alert-danger">
      ${message}<br>
      <button class="btn btn-sm btn-secondary mt-2" onclick="displayNotifications()">
        Retry
      </button>
    </div>
  `;
}

// Initialize the page
document.addEventListener("DOMContentLoaded", () => {
  // Add mark all read button handler
  document.getElementById("markAllReadBtn")?.addEventListener("click", markAllRead);
  
  // Check auth state
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      displayNotifications();
    } else {
      window.location.href = "/login.html";
    }
  });
});