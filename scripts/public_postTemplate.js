
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

      // Process each post
      postsSnapshot.forEach(doc => {
          const data = doc.data();
          const title = data.title || '';
          const titleLower = title.toLowerCase();

          // Filter posts
          if (searchTerm && !titleLower.includes(searchTerm)) return;

          hasMatches = true;

          // Create card element
          const newCard = cardTemplate.content.cloneNode(true);
          const cardBody = newCard.querySelector('.card-body');

          // Populate card content
          newCard.querySelector('.card-title').textContent = title;
          newCard.querySelector('.card-text').textContent = truncateText(data.content || '', 100);
          newCard.querySelector('.card-author').textContent = `Posted by: ${data.authorName || 'Anonymous'}`;
          
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

          // Create column wrapper
          const colDiv = document.createElement('div');
          colDiv.className = 'col-12 col-md-6 col-lg-4 mb-4';
          colDiv.appendChild(newCard);
          
          postCards.push(colDiv);
      });

      // Add cards to container
      postCards.forEach(card => postsContainer.appendChild(card));

      // Handle no results
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