/*  
  function writeSlang() {
      //define a variable for the collection you want to create in Firestore to populate data
      var SlangPost = db.collection("public_posts");

      const slangList = [
          { Slang: "Bruv", ShortDesc: "Different way of saying bro" },
          { Slang: "Homie", ShortDesc: "Another term for best friend" }
      ];
      
      slangList.forEach(async (slang) => {
          let querySnapshot = await SlangPost.where("Slang", "==", slang.Slang).get();

          if (querySnapshot.empty) {
              await SlangPost.add(slang);
              console.log(`Added: ${slang.Slang}`);
          } else {
              console.log(`Already exists: ${slang.Slang}`);
          }
      });
  }

  writeSlang();

  function readQuote(documentId) {
      db.collection("public_posts").doc(documentId)                                                         //name of the collection and documents should matach excatly with what you have in Firestore
          .onSnapshot(documentId => {                                                              //arrow notation
              console.log("current document data: " + documentId.data());                          //.data() returns data object
              document.getElementById("slang-goes-here").innerHTML = documentId.data();      //using javascript to display the data on the right place

              //Here are other ways to access key-value data fields
              //$('#quote-goes-here').text(dayDoc.data().quote);         //using jquery object dot notation
              //$("#quote-goes-here").text(dayDoc.data()["quote"]);      //using json object indexing
              //document.querySelector("slang-goes-here").innerHTML = docSnapshot.data().quote;

          }, (error) => {
              console.log ("Error calling onSnapshot", error);
          });
      }
  readQuote("Homie");        //calling the function


  function displayPostsDynamically() {
    let cardTemplate = document.getElementById("postCardTemplate"); // Reference post card template

    db.collection("posts").orderBy("date", "desc").get()  // Fetch posts ordered by date (newest first)
        .then(allPosts => {
            document.getElementById("posts-go-here").innerHTML = ""; // Clear previous content

            allPosts.forEach(doc => {
                var postTitle = doc.data().title;
                var postContent = doc.data().content;
                var postAuthor = doc.data().author;
                var postDate = doc.data().date ? doc.data().date.toDate().toLocaleString() : "No Date";
                var docID = doc.id;

                let newCard = cardTemplate.content.cloneNode(true); // Clone template

                // Update elements in the cloned template
                newCard.querySelector('.card-title').innerHTML = postTitle;
                newCard.querySelector('.card-text').innerHTML = postContent;
                newCard.querySelector('.card-author').innerHTML = `By: ${postAuthor}`;
                newCard.querySelector('.card-date').innerHTML = `Posted on: ${postDate}`;
                
                // Append the new card to the display section
                document.getElementById("posts-go-here").appendChild(newCard);
            });
        })
        .catch(error => {
            console.error("Error fetching posts: ", error);
        });
  }
*/
/*
    document.addEventListener('DOMContentLoaded', () => {
      displayPostsDynamically();
    });

    function displayPostsDynamically() {
      const urlParams = new URLSearchParams(window.location.search);
      const searchTerm = urlParams.get('search')?.toLowerCase(); // Get search term from URL

      let cardTemplate = document.getElementById("postCardTemplate");
      const postsContainer = document.getElementById("posts-go-here");

      // Clear existing content and optionally show a loading message
      postsContainer.innerHTML = "<p>Loading posts...</p>";

      db.collection("posts").orderBy("date").get()
        .then(allPosts => {
          postsContainer.innerHTML = ""; // Clear loading message
          let hasMatches = false;

          allPosts.forEach(doc => {
            const data = doc.data();
            const postTitle = data.title || '';
            const postTitleLower = postTitle.toLowerCase();
            const docID = doc.id;

            // Determine if post should be displayed based on search term
            const displayPost = !searchTerm || postTitleLower.includes(searchTerm);

            if (displayPost) {
              hasMatches = true;
              // Clone and populate card template
              let newCard = cardTemplate.content.cloneNode(true);
              newCard.querySelector('.card-title').textContent = postTitle;
              newCard.querySelector('.card-text').textContent = data.content || '';
              newCard.querySelector('.card-author').textContent = `By: ${data.author || 'Anonymous'}`;
              const postDate = data.date?.toDate().toLocaleString() || "No Date";
              newCard.querySelector('.card-date').textContent = `Posted on: ${postDate}`;
              postsContainer.appendChild(newCard);
            }
          });

          // Handle no results scenario
          if (searchTerm && !hasMatches) {
            postsContainer.innerHTML = `
              <p>No posts found matching "${searchTerm}".</p>
              <a href="nonexist_makepost.html" class="btn btn-primary">Create a New Post</a>
            `;
          }
        })
        .catch(error => {
          console.error("Error fetching posts: ", error);
          postsContainer.innerHTML = "<p>Error loading posts. Please try again later.</p>";
        });
    }
*/

// // Initialize when page loads
// document.addEventListener('DOMContentLoaded', () => {
//   const db = firebase.firestore();
//   displayFilteredPosts(db);
// });

// async function displayFilteredPosts(db) {
//   const urlParams = new URLSearchParams(window.location.search);
//   const searchTerm = urlParams.get('search')?.toLowerCase();
//   const postsContainer = document.getElementById('posts-go-here');
//   const cardTemplate = document.getElementById('postCardTemplate');

//   postsContainer.innerHTML = "<p>Loading posts...</p>";

//   try {
//       const postsSnapshot = await db.collection("posts").orderBy("timestamp", "desc").get();
//       postsContainer.innerHTML = "";
      
//       if (searchTerm) {
//           const header = document.createElement('h2');
//           header.textContent = `Results for "${decodeURIComponent(searchTerm)}"`;
//           postsContainer.appendChild(header);
//       }

//       let hasMatches = false;
      
//       // Convert to array for async operations
//       const posts = [];
//       postsSnapshot.forEach(doc => posts.push(doc));

//       for (const doc of posts) {
//           const data = doc.data();
//           const title = data.title || '';
//           const titleLower = title.toLowerCase();

//           if (searchTerm && !titleLower.includes(searchTerm)) continue;

//           hasMatches = true;
          
//           // Get user name from users collection
//           let userName = "Anonymous";
//           try {
//               const userDoc = await db.collection("users").doc(data.owner).get();
//               if (userDoc.exists) {
//                   userName = userDoc.data().name || "Anonymous";
//               }
//           } catch (userError) {
//               console.error("Error fetching user:", userError);
//           }

//           const newCard = cardTemplate.content.cloneNode(true);
//           newCard.querySelector('.card-title').textContent = title;
//           newCard.querySelector('.card-text').textContent = data.content || '';
//           newCard.querySelector('.card-author').textContent = `Posted by: ${userName}`;
          
//           const postDate = data.timestamp?.toDate().toLocaleString() || "Unknown date";
//           newCard.querySelector('.card-date').textContent = postDate;
          
//           const viewButton = newCard.querySelector('card-button');
//           if (viewButton) {
//               viewButton.href = `post.html?id=${doc.id}`; // <-- Added this line to set post link using Firestore ID
//           }

//           postsContainer.appendChild(newCard);
//       }

//       if (searchTerm && !hasMatches) {
//           window.location.href = `nonexist_makepost.html?search=${encodeURIComponent(searchTerm)}`;
//       }
//   } catch (error) {
//       console.error("Error loading posts:", error);
//       postsContainer.innerHTML = "<p>Error loading posts. Please try again.</p>";
//   }
// }




// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  const db = firebase.firestore();
  displayFilteredPosts(db);
});

/**
 * Function to fetch and display posts from Firestore,
 * filter by search term if provided, and add a "View Post" button linking to inside_post.html.
 */
async function displayFilteredPosts(db) {
  const urlParams = new URLSearchParams(window.location.search);
  const searchTerm = urlParams.get('search')?.toLowerCase();
  const postsContainer = document.getElementById('posts-go-here');
  const cardTemplate = document.getElementById('postCardTemplate');

  // Show a loading message while fetching posts
  postsContainer.innerHTML = "<p>Loading posts...</p>";

  try {
      const postsSnapshot = await db.collection("posts").orderBy("timestamp", "desc").get();
      postsContainer.innerHTML = "";
      
      // If a search term is provided, display a header with the results information
      if (searchTerm) {
          const header = document.createElement('h2');
          header.textContent = `Results for "${decodeURIComponent(searchTerm)}"`;
          postsContainer.appendChild(header);
      }

      let hasMatches = false;
      
      // Convert snapshot to an array to process posts asynchronously
      const posts = [];
      postsSnapshot.forEach(doc => posts.push(doc));

      for (const doc of posts) {
          const data = doc.data();
          const title = data.title || '';
          const titleLower = title.toLowerCase();

          // Filter posts based on the search term if present
          if (searchTerm && !titleLower.includes(searchTerm)) continue;

          hasMatches = true;
          
          // Get the user name from the "users" collection using the post's owner field
          let userName = "Anonymous";
          try {
              const userDoc = await db.collection("users").doc(data.owner).get();
              if (userDoc.exists) {
                  userName = userDoc.data().name || "Anonymous";
              }
          } catch (userError) {
              console.error("Error fetching user:", userError);
          }

          // Clone the card template and populate it with post data
          const newCard = cardTemplate.content.cloneNode(true);
          newCard.querySelector('.card-title').textContent = title;
          newCard.querySelector('.card-text').textContent = data.content || '';
          newCard.querySelector('.card-author').textContent = `Posted by: ${userName}`;
          const postDate = data.timestamp?.toDate().toLocaleString() || "Unknown date";
          newCard.querySelector('.card-date').textContent = postDate;
          
          // Set the "View Post" button link to go to inside_post.html with the Firestore post ID
          const viewButton = newCard.querySelector('.view-post-button');
          if (viewButton) {
            viewButton.href = `./inside_post.html?postId=${encodeURIComponent(doc.id)}`;
          }
          
          postsContainer.appendChild(newCard);
      }

      // If a search was performed but no posts matched, redirect to a "nonexist_makepost.html" page
      if (searchTerm && !hasMatches) {
          window.location.href = `nonexist_makepost.html?search=${encodeURIComponent(searchTerm)}`;
      }
  } catch (error) {
      console.error("Error loading posts:", error);
      postsContainer.innerHTML = "<p>Error loading posts. Please try again.</p>";
  }
}
