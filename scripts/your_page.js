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

        const viewBtn = clone.querySelector(".view-btn");
        viewBtn.href = `inside_post.html?postId=${doc.id}`;
        
        // Edit button handler
        const editBtn = clone.querySelector(".edit-btn");
        editBtn.addEventListener("click", () => {
          const editModal = new bootstrap.Modal(document.getElementById('editPostModal'));
          const editTitle = document.getElementById('editTitle');
          const editContent = document.getElementById('editContent');
          
          // Populate current values
          editTitle.value = post.title;
          editContent.value = post.content;

          // Handle save changes
          const saveChangesBtn = document.getElementById('saveChangesBtn');
          saveChangesBtn.onclick = () => {
            const newTitle = editTitle.value.trim();
            const newContent = editContent.value.trim();

            if (newTitle && newContent) {
              db.collection("posts").doc(doc.id).update({
                title: newTitle,
                content: newContent,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
              }).then(() => {
                editModal.hide();
                loadPosts();
              }).catch(error => {
                console.error("Update error:", error);
                alert("Error updating post: " + error.message);
              });
            }
          };

          editModal.show();
        });

        // Delete button handler
        const deleteBtn = clone.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", () => {
          const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
          const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
          
          confirmDeleteBtn.onclick = () => {
            db.collection("posts").doc(doc.id).delete()
              .then(() => {
                deleteModal.hide();
                loadPosts();
              })
              .catch(error => {
                console.error("Delete error:", error);
                alert("Error deleting post: " + error.message);
              });
          };

          deleteModal.show();
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

// Rest of your code remains the same...
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
