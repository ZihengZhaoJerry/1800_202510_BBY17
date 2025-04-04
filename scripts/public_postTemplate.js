
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Firebase
  const db = firebase.firestore();
  
  // Display posts with proper URL encoding
  displayFilteredPosts(db);
});

async function displayFilteredPosts(db) {
    const urlParams = new URLSearchParams(window.location.search);
    const searchTerm = urlParams.get('search')?.toLowerCase();
    const postsContainer = document.getElementById('posts-go-here');
    const cardTemplate = document.getElementById('postCardTemplate');
  
    // Show loading state
    postsContainer.innerHTML = '<div class="col-12 text-center"><div class="spinner-border" role="status"></div><p>Loading posts...</p></div>';
  
    try {
      const postsSnapshot = await db.collection("posts").orderBy("timestamp", "desc").get();
      postsContainer.innerHTML = '';
  
      let hasMatches = false;
      const postCards = [];
  
      for (const doc of postsSnapshot.docs) {
        const data = doc.data();
        const title = data.title || '';
        const titleLower = title.toLowerCase();
  
        // Filter posts
        if (searchTerm && !titleLower.includes(searchTerm)) continue;
  
        hasMatches = true;
  
        // Get author name from users collection
        let authorName = "Anonymous";
        if (data.owner) {
          try {
            const userDoc = await db.collection("users").doc(data.owner).get();
            if (userDoc.exists) {
              authorName = userDoc.data().name || "Unknown User";
            }
          } catch (err) {
            console.warn(`Could not fetch author name for user ID ${data.owner}:`, err);
          }
        }
  
        // Create card element
        const newCard = cardTemplate.content.cloneNode(true);
  
        newCard.querySelector('.card-title').textContent = title;
        newCard.querySelector('.card-text').textContent = truncateText(data.content || '', 100);
        newCard.querySelector('.card-author').textContent = `Posted by: ${authorName}`;
  
        // Format date
        const postDate = data.timestamp?.toDate().toLocaleDateString('en-CA', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) || "Date unknown";
        newCard.querySelector('.card-date').textContent = postDate;
  
        // Set up view button
        const viewButton = newCard.querySelector('.view-post-button');
        if (viewButton) {
          const postId = encodeURIComponent(doc.id);
          viewButton.href = `inside_post.html?postId=${postId}`;
          viewButton.addEventListener('click', (e) => {
            console.log('Navigating to post:', doc.id);
            localStorage.setItem('lastViewedPost', doc.id);
          });
        }
  
        // Wrap in column div
        const colDiv = document.createElement('div');
        colDiv.className = 'col-12 col-md-6 col-lg-4 mb-4';
        colDiv.appendChild(newCard);
  
        postCards.push(colDiv);
      }
  
      postCards.forEach(card => postsContainer.appendChild(card));
  
      // Redirect if no results
      if (searchTerm && !hasMatches) {
        window.location.href = `nonexist_makepost.html?search=${encodeURIComponent(searchTerm)}`;
      }
  
    } catch (error) {
      console.error("Error loading posts:", error);
      postsContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-danger" role="alert">
            Error loading posts: ${error.message}
          </div>
        </div>
      `;
    }
  }
  

// Helper functions
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function decodePostId() {
  const urlParams = new URLSearchParams(window.location.search);
  const encodedId = urlParams.get('postId');
  if (!encodedId) return null;
  
  try {
      return decodeURIComponent(encodedId);
  } catch (error) {
      console.error('Invalid post ID:', error);
      return null;
  }
}