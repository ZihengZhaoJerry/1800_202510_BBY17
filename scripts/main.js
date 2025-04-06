function getNameFromAuth() {
  firebase.auth().onAuthStateChanged(handleAuthStateChange);
}

function handleAuthStateChange(user) {
  if (user) {
    console.log(user.uid, user.displayName);
    updateUserNameDisplay(user.displayName);
  } else {
    console.log("No user is logged in");
  }
}

function updateUserNameDisplay(userName) {
  const nameElement = document.getElementById("name-goes-here");
  if (nameElement) nameElement.innerText = userName;
}

async function fetchPosts() {
  try {
    const snapshot = await db.collection("posts").get();
    return snapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));
  } catch (error) {
    console.error("Error fetching posts: ", error);
    return [];
  }
}

function selectRandomPosts(postsArray, count = 3) {
  return postsArray.sort(() => 0.5 - Math.random()).slice(0, count);
}

async function getPostAuthor(userId) {
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    return userDoc.exists ? userDoc.data().name || "Unknown User" : "Anonymous";
  } catch (err) {
    console.warn(`Failed to fetch user ${userId}: `, err);
    return "Anonymous";
  }
}

function createCardElement(cardTemplate, post, author, date) {
  const newCard = cardTemplate.content.cloneNode(true);
  newCard.querySelector('.card-title').innerText = post.data.title || "No Title";
  newCard.querySelector('.card-text').innerText = post.data.content || "No Content";
  newCard.querySelector('.card-author').innerText = `By: ${author}`;
  newCard.querySelector('.card-date').innerText = `Posted on: ${date}`;
  
  const readMoreBtn = newCard.querySelector('.read-more-btn');
  readMoreBtn?.setAttribute('href', `inside_post.html?postId=${post.id}`);
  return newCard;
}

async function processSinglePost(post, cardTemplate) {
  const postDate = post.data.timestamp?.toDate().toLocaleString() || "No Date";
  const author = await getPostAuthor(post.data.owner);
  return createCardElement(cardTemplate, post, author, postDate);
}

async function displayPosts() {
  const cardTemplate = document.getElementById("postCardTemplate");
  const container = document.getElementById("posts-go-here");
  if (!cardTemplate || !container) return;

  container.innerHTML = ""; 

  try {
    const postsArray = await fetchPosts();
    const selectedPosts = selectRandomPosts(postsArray);
    
    for (const post of selectedPosts) {
      const newCard = await processSinglePost(post, cardTemplate);
      container.appendChild(newCard);
    }
  } catch (error) {
    console.error("Error displaying posts: ", error);
  }
}

function setupSearchForm() {
  const searchForm = document.getElementById('searchForm');
  searchForm?.addEventListener('submit', handleSearchSubmit);
}

async function handleSearchSubmit(e) {
  e.preventDefault();
  const searchInput = document.getElementById('searchInput');
  const searchTermRaw = searchInput.value.trim();

  if (!searchTermRaw) {
    alert("Please enter a search term");
    return;
  }

  const searchTerm = encodeURIComponent(searchTermRaw.toLowerCase());
  window.location.href = `public_postTEMPLATE.html?search=${searchTerm}`;
}

// Initialize functions
document.addEventListener('DOMContentLoaded', () => {
  getNameFromAuth();
  displayPosts();
  setupSearchForm();
});