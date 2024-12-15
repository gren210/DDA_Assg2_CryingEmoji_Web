// Highlight the active menu item
document.addEventListener("DOMContentLoaded", () => {
    const currentLocation = window.location.pathname.split('/').pop();
    const menuLinks = document.querySelectorAll('.navbar .menu li a');

    menuLinks.forEach(link => {
        if (link.getAttribute('href') === currentLocation) {
            link.style.fontWeight = '700';
            link.style.textDecoration = 'underline';
        }
    });

    fetchLeaderboard();
    fetchUserProfile();
});

// Function to populate a leaderboard
function populateLeaderboard(data, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);

    // Check if the tableBody exists
    if (!tableBody) return;

    tableBody.innerHTML = ""; // Clear existing rows

    for (let i = 0; i < 5; i++) {
        const row = document.createElement("tr");

        if (data[i]) {
            row.innerHTML = `
                <td>${data[i].name}</td>
                <td>${data[i].time}</td>
                <td>${data[i].score}</td>
                <td>${data[i].packages}</td>
                <td>${data[i].kills}</td>
            `;
        } else {
            row.innerHTML = `
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
                <td>N/A</td>
            `;
        }

        tableBody.appendChild(row);
    }
}

// Handle question submission
const submitButton = document.getElementById("submit-question");
if (submitButton) {
    submitButton.addEventListener("click", () => {
        const userQuestion = document.getElementById("user-question").value.trim();
        const successMessage = document.getElementById("success-message");

        if (userQuestion !== "") {
            successMessage.textContent = "Thank you! Your question has been submitted.";
            successMessage.style.color = "#28a745"; // Green for success
            successMessage.style.display = "block";

            setTimeout(() => {
                successMessage.style.display = "none";
            }, 3000);

            // Clear the textarea
            document.getElementById("user-question").value = "";
        } else {
            successMessage.textContent = "Please enter a question before submitting.";
            successMessage.style.color = "red"; // Red for error
            successMessage.style.display = "block";

            setTimeout(() => {
                successMessage.style.display = "none";
            }, 3000);
        }
    });
}

// Firebase
import { auth} from "../config.js";
import { getDatabase, ref, child, get} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import {setPersistence, browserLocalPersistence, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js'
// Initialize Firebase database
const db = getDatabase();
const dbRef = ref(db);



// Monitor authentication state and fetch profile
function monitorAuthState() {
    // Set persistence to browser local storage
    setPersistence(auth, browserLocalPersistence)
        .then(() => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log('Authenticated user:', user);
                    fetchUserProfile({ userID: user.uid }); // Fetch user profile
                } else {
                    console.log('No authenticated user.');
                    window.location.href = "AuthPageLogin.html"; // Redirect to login if not authenticated
                }
            });
        })
        .catch((error) => {
            console.error("Error setting persistence:", error);
        });
}

// Fetch leaderboard data
function fetchLeaderboard() {
    get(child(dbRef, "leaderboard")).then(snapshot => {
        if (snapshot.exists()) {
            const leaderboardData = snapshot.val();
            const leaderboard1Data = [];
            const leaderboard2Data = [];

            for (const userID in leaderboardData) {
                const user = leaderboardData[userID];
                leaderboard1Data.push({
                    name: user.name,
                    time: user.avgTimeCorrect + "s",
                    score: user.score,
                    packages: user.correctPackages,
                    kills: user.kills,
                });

                leaderboard2Data.push({
                    name: user.name,
                    time: user.avgTimeCorrect + "s",
                    score: user.score,
                    packages: user.correctPackages,
                    kills: user.kills,
                });
            }

            leaderboard1Data.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
            leaderboard2Data.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));

            populateLeaderboard(leaderboard1Data, "leaderboard1-body");
            populateLeaderboard(leaderboard2Data, "leaderboard2-body");
        } else {
            console.log("No leaderboard data available.");
        }
    }).catch(error => {
        console.error("Error fetching leaderboard:", error);
    });
}


// Fetch user profile data
function fetchUserProfile(user) {
    if (!user || !user.userID) {
        console.error("Invalid user object:", user);
        return;
    }

    const userID = user.userID;
    get(child(dbRef, `users/${userID}`))
        .then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const profile = userData.profile;
                const stats = userData.stats;

                // Safely update profile UI
                const usernameElem = document.getElementById("username");
                const emailElem = document.getElementById("email");
                const descElem = document.getElementById("player-desc");

                if (usernameElem) usernameElem.textContent = profile.name || "User";
                if (emailElem) emailElem.textContent = profile.email;
                if (descElem) descElem.textContent = profile.playerDesc

                // Safely populate stats table
                const statsTable = document.querySelector(".profile-stats tbody");
                if (statsTable) {
                    statsTable.innerHTML = `
                        <tr><td>Average Time per Package</td><td>${stats.avgTimeCorrect}s</td></tr>
                        <tr><td>Average Total Time</td><td>${stats.avgTimeTotal}s</td></tr>
                        <tr><td>Correct Packages</td><td>${stats.correctPackages}</td></tr>
                        <tr><td>Failures</td><td>${stats.failures}</td></tr>
                        <tr><td>Rats Killed</td><td>${stats.kills}</td></tr>
                        <tr><td>Missed Items</td><td>${stats.missedItems}</td></tr>
                        <tr><td>Wrongly Scanned Items</td><td>${stats.wronglyScannedItems}</td></tr>
                    `;
                }
            } else {
                console.log("No user profile data available.");
            }
        })
        .catch(error => {
            console.error("Error fetching user profile:", error);
        });
}


// Call monitorAuthState when the page loads
monitorAuthState();


