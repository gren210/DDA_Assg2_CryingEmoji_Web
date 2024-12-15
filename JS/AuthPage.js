import { auth } from '../config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

// Handle sign-up, log-in, and password reset
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');  // Get the form
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    const isLoginPage = form.id === 'login-form';  // Check if it's login or sign-up page
    const isResetPasswordPage = form.id === 'reset-password-form'; // Check if it's reset password page

    // Sign-up function
    const signUp = async (email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('User signed up:', user);
            alert('Sign-up successful! Please Log In!');
            window.location.href = 'AuthPageLogin.html'; // Redirect to login after successful sign-up
        } catch (error) {
            console.error('Sign-up error:', error.message);
            alert(`Sign-up failed. ${error.message}`);
        }
    };

    // Log-in function
    const logIn = async (email, password) => {
        try {
            await setPersistence(auth, browserLocalPersistence); // Ensure persistence
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful:', userCredential.user);
    
            // Confirm authentication state
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log('Authenticated user:', user);
                    alert('Login successful!');
                    window.location.href = '../HTML/MainSite.html';
                } else {
                    console.error('User is not authenticated.');
                }
            });
        

        // Redirect to MainSite and pass user data

    } catch (error) {
        console.error('Login error:', error.message);
        alert(`Login failed. ${error.message}`);
    }
};

    // Reset password function
    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            console.log('Password reset email sent');
            alert('Password reset email sent. Please check your inbox.');
            window.location.href = 'AuthPageLogin.html'; // Redirect to login page after successful reset
        } catch (error) {
            console.error('Password reset error:', error.message);
            alert(`Password reset failed. ${error.message}`);
        }
    };

    // Handle form submission (Sign-up, Log-in, or Reset Password)
    form.addEventListener('submit', async (e) => {
        e.preventDefault();  // Prevent the default form submission

        const email = emailInput.value;

        // Check if it's the login page
        if (isLoginPage) {
            const password = passwordInput.value;
            await logIn(email, password);
        } else if (isResetPasswordPage) {
            await resetPassword(email);
        } else {
            const password = passwordInput.value;
            // If it's the sign-up form, get confirm password and check if passwords match
            const confirmPassword = document.getElementById('confirm-password').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            await signUp(email, password);
        }
    });
});

// Handle toggle password visibility
const togglePasswordIcons = document.querySelectorAll('.toggle-password');
togglePasswordIcons.forEach(icon => {
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


