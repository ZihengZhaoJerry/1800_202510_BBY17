
// Function to load a post by its document ID (postId)
function loadPost(postId) {
  db.collection("posts").doc(postId)
      .onSnapshot(postDoc => {
          if (!postDoc.exists) {
              console.error("Post not found");
              document.getElementById("postTitle").textContent = "Post Not Found";
              return;
          }

          const postData = postDoc.data();
          console.log("Current document data:", postData);

          document.getElementById("postTitle").textContent = postData.title || "Untitled Post";
          document.getElementById("postContent").textContent = postData.content || "No content available.";
          document.getElementById("postAuthor").textContent = postData.owner || "Unknown author";
          document.getElementById("postDate").textContent = postData.timestamp
              ? `Posted on: ${postData.timestamp.toDate().toLocaleString()}`
              : "Date: Unknown";

          // Optionally set a data attribute on a container element for later use
          document.querySelector(".container").setAttribute("data-post-id", postId);
      }, error => {
          console.error("Error fetching post:", error);
          document.getElementById("postTitle").textContent = "Post Not Found";
      });
}

// Function to display post info by reading the "postId" query parameter from the URL
function displayPostInfo() {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("postId"); // Using "postId" consistently
  console.log("Loading post with ID:", postId);

  if (postId) {
      loadPost(postId);
      loadComments(postId); // load comments using the same postId
  } else {
      console.error("No postId found in URL");
      document.getElementById("postTitle").textContent = "Invalid post link";
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = validatePostId(urlParams.get('postId'));

  if (!postId) {
    handleInvalidPost();
    return;
  }

  console.log('Loading post with ID:', postId);
  initializePostPage(postId);
});

// Helper functions
function validatePostId(postId) {
  if (!postId) return null;
  const decodedId = decodeURIComponent(postId).trim();
  return /^[a-zA-Z0-9_-]{20}$/.test(decodedId) ? decodedId : null;
}

function handleInvalidPost() {
  console.error('Invalid postId in URL');
  document.getElementById("postTitle").textContent = "Post Not Found";
  setTimeout(() => window.location.href = '/', 3000);
}

function initializePostPage(postId) {
  const db = firebase.firestore();
  
  // Load post content
  db.collection("posts").doc(postId).onSnapshot(postDoc => {
    if (!postDoc.exists) return handleInvalidPost();
    
    const postData = postDoc.data();
    document.getElementById("postTitle").textContent = postData.title || "Untitled Post";
    document.getElementById("postContent").textContent = postData.content || "No content available.";
    document.getElementById("postAuthor").textContent = postData.owner || "Unknown author";
    document.getElementById("postDate").textContent = postData.timestamp?.toDate().toLocaleString() || "Date: Unknown";
  }, error => {
    console.error("Error fetching post:", error);
    handleInvalidPost();
  });

  // Load comments
  loadComments(postId);
}

// Comment handling functions
function loadComments(postId) {
  const commentsContainer = document.getElementById("commentsContainer");
  commentsContainer.innerHTML = "<p>Loading comments...</p>";

  db.collection("posts").doc(postId).collection("comments")
    .orderBy("timestamp", "asc")
    .onSnapshot(snapshot => {
      commentsContainer.innerHTML = snapshot.empty 
        ? "<p>No comments yet. Be the first to comment!</p>"
        : Array.from(snapshot.docs).map(doc => createCommentElement(doc.data())).join('');
    }, error => {
      console.error("Error loading comments:", error);
      commentsContainer.innerHTML = "<p>Error loading comments</p>";
    });
}

function createCommentElement(commentData) {
  return `
    <div class="border p-2 mb-2 rounded">
      <strong>${commentData.user || "Anonymous"}:</strong>
      <p>${commentData.commentText}</p>
      <small class="text-muted">
        ${commentData.timestamp?.toDate().toLocaleString() || "Time Unknown"}
      </small>
    </div>
  `;
}

document.getElementById("commentForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const commentInput = document.getElementById("commentInput");
  const commentText = commentInput.value.trim();
  const postId = validatePostId(new URLSearchParams(window.location.search).get('postId'));

  if (!commentText || !postId) {
    alert("Please enter a valid comment");
    return;
  }

  try {
    const user = firebase.auth().currentUser;
    if (!user) throw new Error("Not authenticated");

    // 1. Get post owner information
    const postDoc = await db.collection("posts").doc(postId).get();
    const postOwner = postDoc.data()?.owner;
    
    if (!postOwner) throw new Error("Post owner not found");

    // 2. Create batch operation
    const batch = db.batch();
    
    // Create references for both collections
    const subcollectionRef = db.collection("posts")
      .doc(postId)
      .collection("comments")
      .doc(); // Auto-generated ID

    const allCommentsRef = db.collection("all_comments")
      .doc(subcollectionRef.id); // Same ID for both

    // 3. Prepare comment data
    const commentData = {
      user: user.displayName || "Anonymous",
      commentText: commentText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      read: false,
      postId: postId,
      postOwner: postOwner // Critical for notifications
    };

    // 4. Add both operations to batch
    batch.set(subcollectionRef, commentData);
    batch.set(allCommentsRef, commentData);

    // 5. Commit batch
    await batch.commit();
    commentInput.value = "";
    
    console.log("Comment added to both collections:", commentData);

  } catch (error) {
    console.error("Error submitting comment:", error);
    alert(`Error submitting comment: ${error.message}`);
  }
});