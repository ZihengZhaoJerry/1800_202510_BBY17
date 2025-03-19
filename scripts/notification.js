function displayPosts() {
  const postsContainer = document.getElementById("postsContainer");
  
  // Get all posts from Firestore
  db.collection("posts").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
          // Get post data from document
          const postData = doc.data();
          const postTitle = postData.title;

          // Currently this is the author of the post but it needs to be the author 
          // of the comment on the post. Still working on this.
          const postComment = postData.author;

          // Create HTML elements
          const card = document.createElement("div");
          card.className = "card w-85 mb-2";
          card.innerHTML = `
              <div class="card-body">
                  <h5 class="card-title">${postTitle}</h5>
                  <p>${postComment} has commmented on your post</p>
                  <button type="button">View Comment</button>
              </div>
          `;
          
          postsContainer.appendChild(card);
      });
  }).catch((error) => {
      console.error("Error getting posts: ", error);
      alert("Error loading posts. Check console.");
  });
}

// Call this when page loads
document.addEventListener("DOMContentLoaded", function() {
  displayPosts();
});


