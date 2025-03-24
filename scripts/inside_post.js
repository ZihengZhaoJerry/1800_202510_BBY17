
/**
 * Function to fetch and display post details from Firestore
 */
function loadPost(postId) {
    db.collection("posts").doc(postId)
        .onSnapshot(postDoc => {
            
            let postData = postDoc.data(); // Corrected reference to document data
            
            console.log("Current document data:", postData);

            document.getElementById("postTitle").textContent = postData.title || "Untitled Post";
            document.getElementById("postContent").textContent = postData.content || "No content available.";
            document.getElementById("postDate").textContent = postData.date
                ? `Date: ${new Date(postData.date.toDate()).toLocaleString()}`
                : "Date: Unknown";

            document.querySelector(".container").setAttribute("data-post-id", postId);
        }, error => {
            console.error("Error fetching post:", error);
            document.getElementById("postTitle").textContent = "Post Not Found";
        });
}

// Call the function with a valid post ID
loadPost("foetlUIpJx4OdBsAajiD");

/**
 * Function to fetch and display comments for the post
 */
function loadComments() {
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
                        <small class="text-muted">${commentData.timestamp?.toDate()
                            ? new Date(commentData.timestamp.toDate()).toLocaleString()
                            : "Time Unknown"}</small>
                    `;
                    commentsContainer.appendChild(commentElement);
                });
            }
        }, error => {
            console.error("Error loading comments:", error);
        });
}

/**
 * Function to submit a new comment to Firestore
 */
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

    // Prepare comment data
    const commentData = {
        user: username,
        commentText: commentText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        read: false
    };

    // Store the comment in Firestore
    db.collection("posts").doc(postId).collection("comments").add(commentData)
        .then(() => {
            console.log("Comment added successfully!");
            commentInput.value = ""; // Clear input field
        })
        .catch(error => console.error("Error adding comment:", error));
}

// Attach event listener for comment submission
document.getElementById("submitCommentBtn").addEventListener("click", submitComment);

// Load post and comments when the page is ready
window.onload = function () {
    loadPost();
    loadComments();
};
