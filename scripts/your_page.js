function loadPosts() {
  const user = firebase.auth().currentUser;
  const postsContainer = document.getElementById("posts");
  
  if (!user) {
      postsContainer.innerHTML = `<div class="col-12"><div class="alert alert-warning">Please log in to view your posts.</div></div>`;
      return;
  }

  postsContainer.innerHTML = `<div class="col-12"><div class="alert alert-info">Loading posts...</div></div>`;

  db.collection("posts")
      .where("owner", "==", user.uid)
      .orderBy("timestamp", "desc")
      .get()
      .then((querySnapshot) => {
          postsContainer.innerHTML = ''; 

          if (querySnapshot.empty) {
              postsContainer.innerHTML = `<div class="col-12"><div class="alert alert-info">No posts found. Create your first post!</div></div>`;
              return;
          }

          querySnapshot.forEach((doc) => {
              const post = doc.data();
              const template = document.querySelector(".post-card.d-none");
              
              if (!template) {
                  console.error("Post template not found!");
                  return;
              }

              const clone = template.cloneNode(true);
              clone.classList.remove("d-none");

              // Populate data
              clone.querySelector(".post-title").textContent = post.title;
              clone.querySelector(".post-description").textContent = post.content || "";

              // Edit button handler
              const editBtn = clone.querySelector(".edit-btn");
              editBtn.addEventListener("click", () => {
                  const newTitle = prompt("Edit title:", post.title);
                  const newContent = prompt("Edit content:", post.content);
                  
                  if (newTitle && newContent) {
                      db.collection("posts").doc(doc.id).update({
                          title: newTitle.trim(),
                          content: newContent.trim(),
                          timestamp: firebase.firestore.FieldValue.serverTimestamp() // Update timestamp
                      }).then(() => loadPosts())
                      .catch(error => {
                          console.error("Update error:", error);
                          alert("Error updating post: " + error.message);
                      });
                  }
              });

              const deleteBtn = clone.querySelector(".delete-btn");
              deleteBtn.addEventListener("click", () => {
                  if (confirm("Are you sure you want to delete this post permanently?")) {
                      db.collection("posts").doc(doc.id).delete()
                        .then(() => {
                          loadPosts(); // Refresh the list after deletion
                        })
                        .catch(error => {
                          console.error("Delete error:", error);
                          alert("Error deleting post: " + error.message);
                        });
                  }
              });

              postsContainer.appendChild(clone);
          });
      })
      .catch((error) => {
          console.error("Error loading posts:", error);
          postsContainer.innerHTML = `
              <div class="col-12">
                  <div class="alert alert-danger">
                      Error loading posts: ${error.message}
                  </div>
              </div>
          `;
      });
}

// Initialize when auth state changes
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById("posts")) {
      firebase.auth().onAuthStateChanged(user => {
          if (user) {
              loadPosts();
          } else {
              document.getElementById("posts").innerHTML = `
                  <div class="col-12">
                      <div class="alert alert-warning">
                          Please log in to view your posts.
                      </div>
                  </div>
              `;
          }
      });
  }
});
