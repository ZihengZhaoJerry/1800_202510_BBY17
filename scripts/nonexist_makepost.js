document.getElementById("postForm").addEventListener("submit", function (event) {
  event.preventDefault(); 

  // Get user input values
  let title = document.getElementById("title").value.trim();
  let description = document.getElementById("description").value.trim();

  // Validate input fields
  if (title === "" || description === "") {
      alert("Please fill in all fields!");
      return;
  }

  // Check if user is authenticated
  const user = firebase.auth().currentUser;
  if (!user) {
      alert("You must be logged in to create a post!");
      return; 
  }

  // Add to Firestore with UID as author
  db.collection("posts").add({
      title: title,
      content: description,
      owner: user.uid, 
      comments: [], 
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
      alert("Post added successfully!");
      document.getElementById("postForm").reset(); 
  }).catch(error => {
      console.error("Error adding post: ", error);
      alert("Error adding post. Check the console.");
  });
});