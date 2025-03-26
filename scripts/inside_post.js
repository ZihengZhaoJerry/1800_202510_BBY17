
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

// Function to fetch and display comments for the post
function loadComments(postId) {
  const commentsContainer = document.getElementById("commentsContainer");
  commentsContainer.innerHTML = "<p>Loading comments...</p>"; // Loading message

  db.collection("posts").doc(postId).collection("comments")
      .orderBy("timestamp", "asc")
      .onSnapshot(snapshot => {
          commentsContainer.innerHTML = ""; // Clear previous content
          if (snapshot.empty) {
              commentsContainer.innerHTML = "<p>No comments yet. Be the first to comment!</p>";
          } else {
              snapshot.forEach(doc => {
                  const commentData = doc.data();
                  const commentElement = document.createElement("div");
                  commentElement.classList.add("border", "p-2", "mb-2", "rounded");

                  commentElement.innerHTML = `
                      <strong>${commentData.user || "Anonymous"}:</strong>
                      <p>${commentData.commentText}</p>
                      <small class="text-muted">${
                        commentData.timestamp?.toDate
                          ? new Date(commentData.timestamp.toDate()).toLocaleString()
                          : "Time Unknown"
                      }</small>
                  `;
                  commentsContainer.appendChild(commentElement);
              });
          }
      }, error => {
          console.error("Error loading comments:", error);
      });
}

// Function to submit a new comment to Firestore using the comment form.
function submitComment() {
  const commentInput = document.getElementById("commentInput");
  const commentText = commentInput.value.trim();
  if (!commentText) {
      alert("Please enter a comment before submitting.");
      return;
  }

  // Get user info (assuming Firebase Auth is used)
  const user = firebase.auth().currentUser;
  const username = user ? user.displayName || "Anonymous" : "Anonymous";

  // Retrieve the post ID from the URL using "postId"
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get("postId");
  if (!postId) {
      console.error("No post ID found in URL.");
      return;
  }

  // Prepare comment data.
  const commentData = {
      user: username,
      commentText: commentText,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      read: false
  };

  // Add the comment as a subcollection document under the specific post.
  db.collection("posts").doc(postId).collection("comments").add(commentData)
      .then(() => {
          console.log("Comment added successfully!");
          commentInput.value = ""; // Clear input field
      })
      .catch(error => {
          console.error("Error adding comment:", error);
          alert("Error adding comment. Please try again.");
      });
}

// Attach an event listener to the comment form for submission.
document.getElementById("commentForm").addEventListener("submit", function (event) {
  event.preventDefault();
  submitComment();
});

// Optionally, remove any duplicate event listener on a submit button if it exists
// document.getElementById("submitCommentBtn").removeEventListener("click", submitComment);

// Load post and comments on page load using the "postId" parameter.
window.onload = displayPostInfo;
