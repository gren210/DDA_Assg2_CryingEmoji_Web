import { auth } from '../config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence, updateProfile } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import { getDatabase, ref, get, set } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js';

const db = getDatabase(); // Initialize Firebase Database

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const messageDiv = document.getElementById('message'); // Div for displaying messages

    const isLoginPage = form.id === 'login-form';
    const isResetPasswordPage = form.id === 'reset-password-form';

    // Function to display messages on the screen
    const displayMessage = (message, type = 'success') => {
        messageDiv.textContent = message;
        messageDiv.className = type; // Use 'success' or 'error' classes for styling
        messageDiv.style.display = 'block';
    };

    async function signUp(email, password, name, playerDesc) {
        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
    
            // Update the user's profile with name
            await updateProfile(user, {
                displayName: name
            });
    
            // Create a new profile in the Realtime Database
            const userRef = ref(db, 'users/' + user.uid + '/profile');
            await set(userRef, {
                email: email,
                name: name,
                playerDesc: playerDesc,
                role: "user"  // Default role (can be customized)
            });
    
            // Initialize the user's stats in the Realtime Database
            const statsRef = ref(db, 'users/' + user.uid + '/stats');
            await set(statsRef, {
                avgTimeCorrect: 0,
                avgTimeTotal: 0,
                correctPackages: 0,
                failures: 0,
                kills: 0,
                missedItems: 0,
                missedItemsInBox: 0,
                wrongItemsInBox: 0,
                wrongPackages: 0,
                wrongQuantity: 0,
                wrongQuantityInBox: 0,
                wronglyScannedItems: 0,
                totalPackages: 0,
                totalTime: 0,
                recentStats: {
                    recentCorrectPackages: 0,
                    recentKills: 0,
                    recentTotalTime: 0
                },
                score: 0,
                totalPackages: 0,
                totalTime: 0,
                wrongItemsInBox: 0,
                wrongPackages: 0,
                wrongQuantityInBox: 0,
                wrongQuantity: 0
            });
    
            // Add user data to leaderboard
            const leaderboardRef = ref(db, 'leaderboard/' + user.uid);
            await set(leaderboardRef, {
                avgTimeCorrect: 0,
                correctPackages: 0,
                kills: 0,
                name: name,
                score: 0
            });
    
            console.log("User signed up and data saved to database.");
            
            // Show success alert
            alert("Sign-up successful! Welcome, " + name + "!");
    
            // Redirect or update UI as needed
        } catch (error) {
            console.error("Error signing up user:", error);
            // Optionally show error alert
            alert("Error signing up user: " + error.message);
        }
    }
    

    // Log-in function
    const logIn = async (email, password) => {
        try {
            await setPersistence(auth, browserLocalPersistence);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Check if the user is an admin
            const user = userCredential.user;
            const userRef = ref(db, `users/${user.uid}/profile`);
            const snapshot = await get(userRef);

            if (snapshot.exists()) {
                const userProfile = snapshot.val();
                if (userProfile.role === 'admin') {
                    displayMessage('Welcome, Admin!', 'success');
                    setTimeout(() => (window.location.href = '../HTML/AdminView.html'), 2000);
                } else {
                    displayMessage('Login successful! Redirecting...', 'success');
                    setTimeout(() => (window.location.href = '../HTML/MainSite.html'), 2000);
                }
            } else {
                displayMessage('User profile not found.', 'error');
            }
        } catch (error) {
            displayMessage(`Login failed. ${error.message}`, 'error');
        }
    };

    // Reset password function
    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            displayMessage('Password reset email sent. Please check your inbox.', 'success');
            setTimeout(() => (window.location.href = 'AuthPageLogin.html'), 2000);
        } catch (error) {
            displayMessage(`Password reset failed. ${error.message}`, 'error');
        }
    };

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value;

        if (isLoginPage) {
            const password = passwordInput.value;
            await logIn(email, password);
        } else if (isResetPasswordPage) {
            await resetPassword(email);
        } else {
            const password = passwordInput.value;
            const name = document.getElementById('username').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                displayMessage('Passwords do not match!', 'error');
                return;
            }
            await signUp(email, password, name, "N/A");
        }
    });

    // Toggle password visibility
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');
    togglePasswordIcons.forEach((icon) => {
        icon.addEventListener('click', function () {
            const passwordInput = this.previousElementSibling;

            if (passwordInput && passwordInput.type === 'password') {
                passwordInput.type = 'text';
                this.classList.add('bx-hide');
                this.classList.remove('bx-show');
            } else if (passwordInput) {
                passwordInput.type = 'password';
                this.classList.add('bx-show');
                this.classList.remove('bx-hide');
            }
        });
    });
});


