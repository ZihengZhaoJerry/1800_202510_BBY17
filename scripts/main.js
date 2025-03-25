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
            console.log ("No user is logged in");
        }
    });
}
getNameFromAuth(); //run the function
// Function to read the quote of the day from the Firestore "quotes" collection
// Input param is the String representing the day of the week, aka, the document name
function readQuote(day) {
    db.collection("quotes").doc(day)                                                         //name of the collection and documents should matach excatly with what you have in Firestore
        .onSnapshot(dayDoc => {                                                              //arrow notation
            console.log("current document data: " + dayDoc.data());                          //.data() returns data object
            document.getElementById("quote-goes-here").innerHTML = dayDoc.data().quote;      //using javascript to display the data on the right place

            //Here are other ways to access key-value data fields
            //$('#quote-goes-here').text(dayDoc.data().quote);         //using jquery object dot notation
            //$("#quote-goes-here").text(dayDoc.data()["quote"]);      //using json object indexing
            //document.querySelector("#quote-goes-here").innerHTML = dayDoc.data().quote;

        }, (error) => {
            console.log ("Error calling onSnapshot", error);
        });
    }
 readQuote("Tuesday");        //calling the function
 
 function writePosts() {
    //define a variable for the collection you want to create in Firestore to populate data
    var postsRef = db.collection("posts");

    postsRef.add({
        title: "Post1",
        content: "Post1 content", 
        author: "Jerry",
       date: firebase.firestore.FieldValue.serverTimestamp(),
    });
    postsRef.add({
        title: "Post2",
        content: "Post2 content", 
        author: "Jerry",
       date: firebase.firestore.FieldValue.serverTimestamp(),
    });
    postsRef.add({
        title: "Post3",
        content: "Post3 content", 
        author: "Jerry",
       date: firebase.firestore.FieldValue.serverTimestamp(),
    });
}
//------------------------------------------------------------------------------
// Input parameter is a string representing the collection we are reading from
//------------------------------------------------------------------------------
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

// Ensure Firebase is initialized before calling this function
  displayPostsDynamically();

  
/*
  // Add/update these functions in your existing JS
  document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm');

    if (searchForm) {
      searchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        const searchTermRaw = searchInput.value.trim();

        if (!searchTermRaw) {
          alert("Please enter a search term");
          return;
        }

        // Convert search term to lowercase for a case-insensitive comparison
        const searchTerm = searchTermRaw.toLowerCase();
        
        // Reference to Firestore collection (ensure Firebase is already initialized)
        const db = firebase.firestore();
        
        try {
          // Get all posts; note that for large collections, consider adding a proper indexing strategy.
          const snapshot = await db.collection('posts').get();
          let foundMatch = false;
          
          snapshot.forEach(doc => {
            const data = doc.data();
            // Assuming 'title' field exists on each post
            if (data.title) {
              // Convert title to lowercase for case-insensitive matching
              const titleLower = data.title.toLowerCase();
              // Check if the search term exists within the title
              if (titleLower.includes(searchTerm)) {
                foundMatch = true;
              }
            }
          });
          
          if (foundMatch) {
            // If at least one match is found, redirect to the page that displays relevant posts.
            window.location.href = `public_postTEMPLATE.html?search=${encodeURIComponent(searchTerm)}`;
          } else {
            // If no match is found, redirect to the non-existent posts page.
            window.location.href = 'nonexist_makepost.html';
          }
        } catch (error) {
          console.error("Error retrieving posts from Firestore:", error);
          
        }
      });
    }
  });

*/

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