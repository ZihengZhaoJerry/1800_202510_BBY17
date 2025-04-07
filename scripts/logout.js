document.addEventListener('DOMContentLoaded', () => {
    const logoutLink = document.getElementById('logoutLink');
    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault(); 
        logout();
      });
    }
  });
  
  function logout() {
    firebase.auth().signOut().then(() => {
      console.log("logging out user");
      window.location.href = "/login.html"; 
    }).catch((error) => {
      console.error("Logout error:", error);
    });
  }