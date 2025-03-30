
/*
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

*/



/**********************
 * DEBUGGING VERSION  *
 **********************/

// Firestore configuration check
try {
  if (db && !db._configured) {
    db.settings({
      experimentalForceLongPolling: true,
      merge: true
    });
    console.debug("[INIT] Firestore settings configured");
  }
} catch (error) {
  console.error("[INIT ERROR] Firestore config:", error);
}

// Main notification function
async function displayNotifications() {
  console.debug("[DISPLAY] Starting notifications load");
  const notificationsContainer = document.getElementById("postsContainer");
  notificationsContainer.innerHTML = "<div class='text-center'><div class='spinner-border'></div><p>Loading notifications...</p></div>";
  
  const user = firebase.auth().currentUser;
  console.debug("[AUTH] Current user:", user ? user.uid : "Not logged in");

  if (!user) {
    notificationsContainer.innerHTML = "<p class='text-center'>Please log in to view notifications</p>";
    return;
  }

  try {
    console.debug("[QUERY] Building query for UID:", user.uid);
    const query = db.collection("all_comments")
      .where("postOwner", "==", user.uid)
      .where("read", "==", false)
      .orderBy("timestamp", "desc");

    const unsubscribe = query.onSnapshot(async snapshot => {
      console.debug("[SNAPSHOT] Received update. Docs:", snapshot.docs.length);
      console.log("[SNAPSHOT DETAILS]", snapshot.docs.map(d => ({
        id: d.id,
        data: d.data()
      })));

      if (snapshot.empty) {
        console.warn("[SNAPSHOT] No matching documents found");
        notificationsContainer.innerHTML = `
          <div class="alert alert-info">
            No new notifications found. This could mean:
            <ul class="mt-2">
              <li>All comments have been marked as read</li>
              <li>No one has commented on your posts yet</li>
              <li>There might be a data configuration issue</li>
            </ul>
          </div>
        `;
        return;
      }

      console.debug("[PROCESSING] Starting post data fetch");
      const notifications = await Promise.all(snapshot.docs.map(async doc => {
        const comment = doc.data();
        console.debug("[COMMENT DATA]", comment);
        
        try {
          const postDoc = await db.collection("posts").doc(comment.postId).get();
          return {
            id: doc.id,
            ...comment,
            postTitle: postDoc.data()?.title || "[Deleted Post]",
            timestamp: comment.timestamp?.toDate() || new Date(),
            postId: comment.postId
          };
        } catch (postError) {
          console.error("[POST FETCH ERROR]", postError);
          return {
            ...comment,
            postTitle: "[Error Loading Post]",
            timestamp: new Date(),
            postId: comment.postId
          };
        }
      }));

      console.debug("[RENDERING] Prepared notifications:", notifications);
      renderNotifications(notifications);
    }, error => {
      console.error("[SNAPSHOT ERROR]", error);
      showError(`Failed to load notifications: ${error.message}`);
    });

    window.addEventListener("beforeunload", () => {
      console.debug("[CLEANUP] Removing listener");
      unsubscribe();
    });

  } catch (error) {
    console.error("[MAIN ERROR]", error);
    showError(`Fatal error: ${error.message}`);
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