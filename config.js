// Import the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

// Your Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyBPbP6ekAV0JJxqedxC-mLfdNVV9yLykbw",
    authDomain: "asg2-cryingemoji-database.firebaseapp.com",
    databaseURL: "https://asg2-cryingemoji-database-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "asg2-cryingemoji-database",
    storageBucket: "asg2-cryingemoji-database.firebasestorage.app",
    messagingSenderId: "1066311344024",
    appId: "1:1066311344024:web:8d2d45cbde152c0e1015ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the initialized app for use in other parts of your application
export default app;
