function getNameFromAuth() {
  firebase.auth().onAuthStateChanged(user => {
    // Check if a user is signed in:
    if (user) {
      // Do something for the currently logged-in user here: 
      console.log(user.uid); //print the uid in the browser console
      console.log(user.displayName);  //print the user name in the browser console
      userName = user.displayName;

      //method #1:  insert with JS
      document.getElementById("name-goes-here").innerText = userName;

      //method #2:  insert using jquery
      //$("#name-goes-here").text(userName); //using jquery

      //method #3:  insert using querySelector
      //document.querySelector("#name-goes-here").innerText = userName

    } else {
      // No user is signed in.
      console.log("No user is logged in");
    }
  });
}
getNameFromAuth(); //run the function

//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
async function displayPostsDynamically() {
  let cardTemplate = document.getElementById("postCardTemplate"); // Reference post card template

  try {
    const allPostsSnapshot = await db.collection("posts").get();
    document.getElementById("posts-go-here").innerHTML = ""; // Clear previous content

    const postsArray = [];
    allPostsSnapshot.forEach(doc => postsArray.push({ id: doc.id, data: doc.data() }));

    // Shuffle array and pick the first 3
    const shuffledPosts = postsArray.sort(() => 0.5 - Math.random());
    const selectedPosts = shuffledPosts.slice(0, 3);

    for (const post of selectedPosts) {
      const data = post.data;
      const postTitle = data.title || "No Title";
      const postContent = data.content || data.comments?.content || "No Content";
      const postDate = data.timestamp?.toDate().toLocaleString() || "No Date";

      // Fetch author name from users collection
      let postAuthor = "Anonymous";
      if (data.owner) {
        try {
          const userDoc = await db.collection("users").doc(data.owner).get();
          if (userDoc.exists) {
            postAuthor = userDoc.data().name || "Unknown User";
          }
        } catch (err) {
          console.warn(`Failed to fetch user data for owner ${data.owner}: `, err);
        }
      }

      let newCard = cardTemplate.content.cloneNode(true); // Clone the card template

      // Update content in the cloned card
      newCard.querySelector('.card-title').innerText = postTitle;
      newCard.querySelector('.card-text').innerText = postContent;
      newCard.querySelector('.card-author').innerText = `By: ${postAuthor}`;
      newCard.querySelector('.card-date').innerText = `Posted on: ${postDate}`;

      // Set dynamic href for the read-more button
      const readMoreBtn = newCard.querySelector('.read-more-btn');
      readMoreBtn.setAttribute('href', `inside_post.html?postId=${post.id}`);

      // Add the card to the container
      document.getElementById("posts-go-here").appendChild(newCard);
    }

  } catch (error) {
    console.error("Error fetching posts: ", error);
  }
}


// Ensure Firebase is initialized before calling this function
displayPostsDynamically();


// Function to store search term from search bar
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('searchForm');

  searchForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchTermRaw = document.getElementById('searchInput').value.trim();

    if (!searchTermRaw) {
      alert("Please enter a search term");
      return;
    }

    // Redirect with search term
    const searchTerm = encodeURIComponent(searchTermRaw.toLowerCase());
    window.location.href = `public_postTEMPLATE.html?search=${searchTerm}`;
  });
});