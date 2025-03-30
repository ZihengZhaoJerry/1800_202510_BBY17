const posts = [
    { id: 1, title: "First Post", content: "This is the first post." },
    { id: 2, title: "Second Post", content: "This is the second post." }
];

function displayPosts() {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';

    posts.forEach((post, index) => {
        const template = document.querySelector(".post-card.d-none");
        const clone = template.cloneNode(true);
        clone.classList.remove("d-none");

        clone.querySelector(".post-title").textContent = post.title;
        clone.querySelector(".post-description").textContent = post.content;

        const editBtn = clone.querySelector(".edit-btn");
        editBtn.addEventListener("click", () => editPost(index));

        // Hide or remove the delete button
        const deleteBtn = clone.querySelector(".delete-btn");
        if (deleteBtn) deleteBtn.remove();

        postsContainer.appendChild(clone);
    });
}

function editPost(index) {
    const newTitle = prompt("Edit title:", posts[index].title);
    const newContent = prompt("Edit content:", posts[index].content);
    if (newTitle && newContent) {
        posts[index].title = newTitle;
        posts[index].content = newContent;
        displayPosts();
    }
}

displayPosts();

function loadPosts() {
    const postsContainer = document.getElementById("posts");
    postsContainer.innerHTML = "";

    db.collection("posts")
        .orderBy("timestamp", "desc")
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const post = doc.data();
                const template = document.querySelector(".post-card.d-none");
                const clone = template.cloneNode(true);
                clone.classList.remove("d-none");

                clone.querySelector(".post-title").textContent = post.title;
                clone.querySelector(".post-description").textContent = post.description || post.content || "";

                const editBtn = clone.querySelector(".edit-btn");
                editBtn.addEventListener("click", function () {
                    const newTitle = prompt("Edit title:", post.title);
                    const newDesc = prompt("Edit description:", post.description || post.content || "");
                    if (newTitle && newDesc) {
                        db.collection("posts").doc(doc.id).update({
                            title: newTitle.trim(),
                            description: newDesc.trim()
                        }).then(() => {
                            alert("Post updated.");
                            loadPosts();
                        }).catch(error => {
                            console.error("Error updating post:", error);
                        });
                    }
                });

                // Hide or remove the delete button
                const deleteBtn = clone.querySelector(".delete-btn");
                if (deleteBtn) deleteBtn.remove();

                postsContainer.appendChild(clone);
            });
        })
        .catch((error) => {
            console.error("Error getting documents: ", error);
        });
}

if (document.getElementById("posts")) {
    loadPosts();
}
