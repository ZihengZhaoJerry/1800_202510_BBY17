document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        logout();
      });
    }
  });
  
  function logout() {
    firebase.auth().signOut().then(() => {
      console.log("logging out user");
      window.location.href = "/login.html"; // Change to your actual login page
    }).catch((error) => {
      console.error("Logout error:", error);
    });
  }