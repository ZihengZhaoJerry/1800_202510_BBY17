//----------------------------------------
//  Your web app's Firebase configuration
//----------------------------------------
var firebaseConfig = {
    apiKey: "AIzaSyDBaQ-HNLjTLMuAKMovHwVcFI4k8a2_tCU",
    authDomain: "bby17-b67aa.firebaseapp.com",
    projectId: "bby17-b67aa",
    storageBucket: "bby17-b67aa.firebasestorage.app",
    messagingSenderId: "256571420887",
    appId: "1:256571420887:web:8e7372a6f35983422bc092"
};

//--------------------------------------------
// initialize the Firebase app
// initialize Firestore database if using it
//--------------------------------------------
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
