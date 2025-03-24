
const posts = [
    { id: 1, title: "First Post", content: "This is the first post." },
    { id: 2, title: "Second Post", content: "This is the second post." }
];

function displayPosts() {
    const postsContainer = document.getElementById('posts');
    postsContainer.innerHTML = '';
    
    posts.forEach((post, index) => {
        const postElement = document.createElement('div');
        postElement.className = 'col-md-4';
        postElement.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title"><a href="post.html?id=${post.id}" class="text-decoration-none">${post.title}</a></h5>
                    <p class="card-text">${post.content}</p>
                    <button class="btn btn-warning btn-sm" onclick="editPost(${index})">Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="deletePost(${index})">Delete</button>
                </div>
            </div>
        `;
        postsContainer.appendChild(postElement);
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

function deletePost(index) {
    if (confirm("Are you sure you want to delete this post?")) {
        posts.splice(index, 1);
        displayPosts();
    }
}

displayPosts();