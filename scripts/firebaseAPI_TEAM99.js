//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
    apiKey: "AIzaSyAmfWwJO1c8QQ-iUTaxC71779d9yjvk3M8",
    authDomain: "fir-2025-51360.firebaseapp.com",
    projectId: "fir-2025-51360",
    storageBucket: "fir-2025-51360.firebasestorage.app",
    messagingSenderId: "40748470578",
    appId: "1:40748470578:web:883158736515163d9f872b"
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
