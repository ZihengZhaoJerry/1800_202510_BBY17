// Wait for page to load
document.addEventListener("DOMContentLoaded", function() {
    // Get the form element
    const form = document.querySelector(".comment-form form");
    
    // Add submit event listener
    form.addEventListener("submit", function(e) {
        // Prevent default form submission
        e.preventDefault();
        
        // Call our add_comment function
        add_comment();
    });
});

// Function to add comment to Firestore
function add_comment() {
    // Get input values
    var name = document.getElementById("name1").value;
    var comment = document.getElementById("comment").value;
    console.log(name);
    console.log(comment);

    // Create comment object
    const commentData = {
        name: name,
        comment: comment,
        timestamp: new Date()
    };
    
    // Save to Firebase
    firebase.firestore().collection("comments").add(commentData)
        .then(function() {
            // Success - clear form
            document.getElementById("name").value = "";
            document.getElementById("comment").value = "";
            alert("Comment submitted successfully!");
        })
        .catch(function(error) {
            // Error handling
            console.error("Error: ", error);
            alert("Error submitting comment. Please try again.");
        });
}

// populate the comments from fire stprage and show it in comments page after submission
function populateComments() {
    console.log("Fetching comments...");
    let commentCardTemplate = document.getElementById("commentCardTemplate");
    let commentCardGroup = document.getElementById("commentCardGroup");

    let params = new URL(window.location.href);
    let postID = params.searchParams.get("docID");

    db.collection("comments")
        .where("postId", "==", postID)
        .orderBy("timestamp", "desc") // Ensuring the latest comments appear first
        .get()
        .then((allComments) => {
            let comments = allComments.docs;
            console.log(comments);
            commentCardGroup.innerHTML = ""; // Clear existing comments before appending
            
            comments.forEach((doc) => {
                let name = doc.data().name;
                let comment = doc.data().comment;
                let time = doc.data().timestamp.toDate();

                let commentCard = commentCardTemplate.content.cloneNode(true);
                commentCard.querySelector(".username").innerHTML = name;
                commentCard.querySelector(".time").innerHTML = new Date(time).toLocaleString();
                commentCard.querySelector(".comment-text").innerHTML = comment;

                commentCardGroup.appendChild(commentCard);
            });
        })
        .catch((error) => {
            console.error("Error fetching comments: ", error);
        });
}

populateComments();




// another function for populate the comments
document.getElementById("commentForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevents actual form submission

    // Get user input
    let name = document.getElementById("name1").value;
    let comment = document.getElementById("comment").value;

    // Validate input
    if (name.trim() === "" || comment.trim() === "") return;

    // Create comment element
    let commentDiv = document.createElement("div");
    commentDiv.classList.add("comment");
    commentDiv.innerHTML = `<strong>${name}</strong>: ${comment}`;

    // Append new comment to the list
    document.getElementById("commentsList").appendChild(commentDiv);

    // Clear form fields
    document.getElementById("name").value = "";
    document.getElementById("comment").value = "";
});






