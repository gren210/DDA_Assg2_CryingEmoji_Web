// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import firebaseConfig from "../config.js"; // Import Firebase configuration

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Handle sign out
const signOutButton = document.querySelector('.menu a'); // Target the "Sign Out" button
signOutButton.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent default link behavior
    try {
        await signOut(auth);
        alert("Signed out successfully.");
        window.location.href = "../HTML/AuthPageLogin.html"; // Redirect to login page
    } catch (error) {
        console.error("Error signing out:", error);
        alert("Failed to sign out. Please try again.");
    }
});

let chartInstance = null; // Store the chart instance globally

// Fetch leaderboard data and render chart
async function fetchLeaderboardData() {
    try {
        const snapshot = await get(child(ref(db), "leaderboard"));
        if (snapshot.exists()) {
            const leaderboardData = snapshot.val();

            const playerNames = [];
            const avgTimes = [];

            for (const userID in leaderboardData) {
                if (leaderboardData[userID].avgTimeCorrect) {
                    playerNames.push(leaderboardData[userID].name);
                    avgTimes.push(leaderboardData[userID].avgTimeCorrect);
                }
            }

            renderChart(playerNames, avgTimes);
        } else {
            console.log("No leaderboard data found.");
        }
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
    }
}

// Render chart
function renderChart(playerNames, avgTimes) {
    const ctx = document.getElementById('adminChart').getContext('2d');

    // Destroy the existing chart instance if it exists
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a new chart instance
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: playerNames,
            datasets: [{
                label: 'Average Time (seconds)',
                data: avgTimes,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Players'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Average Time (seconds)'
                    }
                }
            }
        }
    });
}

// Redirect admin users to AdminView.html when logging in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const snapshot = await get(child(ref(db), `users/${user.uid}/profile`));
            if (snapshot.exists()) {
                const userProfile = snapshot.val();
                if (userProfile.role === "admin" && window.location.pathname !== "/HTML/AdminView.html") {
                    window.location.href = "../HTML/AdminView.html"; // Redirect admin to AdminView.html
                }
            }
        } catch (error) {
            console.error("Error checking user role:", error);
        }
    }
});


// Fetch leaderboard data on page load
window.onload = fetchLeaderboardData;
