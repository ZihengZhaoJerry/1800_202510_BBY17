function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
        console.log("logging out user");
      }).catch((error) => {
        // An error happened.
      });
}

function setupNotificationBadge() {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const query = db.collection("all_comments")
    .where("postOwner", "==", user.uid)
    .where("read", "==", false);

  return query.onSnapshot(snapshot => {
    const badge = document.getElementById('notificationBadge');
    if (badge) {
      const count = snapshot.size;
      badge.textContent = count;
      badge.classList.toggle('d-none', count === 0);
    }
  });
}

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    const unsubscribe = setupNotificationBadge();
    window.addEventListener('beforeunload', () => unsubscribe());
  } else {
    const badge = document.getElementById('notificationBadge');
    if (badge) badge.classList.add('d-none');
  }
});