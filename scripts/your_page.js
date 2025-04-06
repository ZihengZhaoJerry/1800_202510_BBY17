function showLoginMessage(container) {
  container.innerHTML = `<div class="col-12"><div class="alert alert-warning">Please log in to view your posts.</div></div>`;
}

function showLoadingState(container) {
  container.innerHTML = `<div class="col-12"><div class="alert alert-info">Loading posts...</div></div>`;
}

function showNoPostsMessage(container) {
  container.innerHTML = `<div class="col-12"><div class="alert alert-info">No posts found. Create your first post!</div></div>`;
}

function handlePostsError(container, error) {
  console.error("Error loading posts:", error);
  container.innerHTML = `
    <div class="col-12">
      <div class="alert alert-danger">
        Error loading posts: ${error.message}
      </div>
    </div>`;
}

function populatePostData(clone, post) {
  clone.querySelector(".post-title").textContent = post.title;
  clone.querySelector(".post-description").textContent = post.content || "";
}

function setupEditButton(editBtn, doc, post, loadPosts) {
  editBtn.addEventListener("click", () => {
    const editModal = new bootstrap.Modal(document.getElementById('editPostModal'));
    const editTitle = document.getElementById('editTitle');
    const editContent = document.getElementById('editContent');
    
    editTitle.value = post.title;
    editContent.value = post.content;

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
}

function setupDeleteButton(deleteBtn, doc, loadPosts) {
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
}

function createPostElement(doc, loadPosts) {
  const post = doc.data();
  const template = document.querySelector(".post-card.d-none");
  if (!template) return console.error("Post template not found!");

  const clone = template.cloneNode(true);
  clone.classList.remove("d-none");

  populatePostData(clone, post);
  clone.querySelector(".view-btn").href = `inside_post.html?postId=${doc.id}`;
  
  setupEditButton(clone.querySelector(".edit-btn"), doc, post, loadPosts);
  setupDeleteButton(clone.querySelector(".delete-btn"), doc, loadPosts);

  return clone;
}

function processPostsSnapshot(querySnapshot, container, loadPosts) {
  container.innerHTML = '';
  if (querySnapshot.empty) return showNoPostsMessage(container);

  querySnapshot.forEach(doc => {
    const postElement = createPostElement(doc, loadPosts);
    if (postElement) container.appendChild(postElement);
  });
}

function loadPosts() {
  const user = firebase.auth().currentUser;
  const postsContainer = document.getElementById("posts");
  if (!user) return showLoginMessage(postsContainer);

  showLoadingState(postsContainer);

  db.collection("posts")
    .where("owner", "==", user.uid)
    .orderBy("timestamp", "desc")
    .get()
    .then(querySnapshot => processPostsSnapshot(querySnapshot, postsContainer, loadPosts))
    .catch(error => handlePostsError(postsContainer, error));
}

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById("posts")) return;

  firebase.auth().onAuthStateChanged(user => {
    user ? loadPosts() : showLoginMessage(document.getElementById("posts"));
  });
});