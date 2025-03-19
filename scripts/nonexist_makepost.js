// Function to handle form submission
document.getElementById("postForm").addEventListener("submit", function (event) {
    event.preventDefault(); 

    // Get user input values
    let title = document.getElementById("title").value.trim();
    let description = document.getElementById("description").value.trim();

    // Validate input
    if (title === "" || description === "") {
        alert("Please fill in all fields!");
        return;
    }

    // Add to Firestore
    db.collection("posts").add({
        title: title,
        content: description,
        author: "User123",  
        comments: "", 
        postId: "12",      
        last_updated: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Post added successfully!");
        document.getElementById("postForm").reset(); 
    }).catch(error => {
        console.error("Error adding post: ", error);
        alert("Error adding post. Check the console.");
    });
});
