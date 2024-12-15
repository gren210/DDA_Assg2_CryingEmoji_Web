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
    fetchLeaderboardHome();
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


// Firebase
import { auth} from "../config.js";
import { getDatabase, ref, child, get, push, set, update} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";
import {setPersistence, browserLocalPersistence, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js'
// Initialize Firebase database
const db = getDatabase();
const dbRef = ref(db);




// Handle profile update
function updateProfile() {
    const usernameInput = document.getElementById("edit-username").value.trim();
    const playerDescInput = document.getElementById("edit-player-desc").value.trim();
    const successMessage = document.getElementById("success-message");
    const errorMessage = document.getElementById("error-message");

    // Validate input fields
    if (!usernameInput || !playerDescInput) {
        displayMessage(errorMessage, "Both fields are required.", 3000);
        return;
    }

    // Ensure current user is authenticated
    const currentUser = auth.currentUser;
    if (!currentUser) {
        displayMessage(errorMessage, "No authenticated user.", 3000);
        return;
    }

    // Check for duplicate usernames in the database
    get(child(dbRef, "users"))
        .then((snapshot) => {
            if (snapshot.exists()) {
                const users = snapshot.val();
                let isDuplicate = false;

                // Check if the username already exists in the database
                for (const userID in users) {
                    if (
                        users[userID].profile.name.toLowerCase() === usernameInput.toLowerCase() &&
                        userID !== currentUser.uid
                    ) {
                        isDuplicate = true;
                        break;
                    }
                }

                if (isDuplicate) {
                    displayMessage(errorMessage, "This username is already taken.", 3000);
                } else {
                    // Update the user's profile in the "users" node
                    const userRef = ref(db, `users/${currentUser.uid}/profile`);
                    set(userRef, {
                        name: usernameInput,
                        playerDesc: playerDescInput,
                        email: currentUser.email, // Retain the existing email
                    })
                        .then(() => {
                            // Update the name in the leaderboard node
                            const leaderboardRef = ref(db, `leaderboard/${currentUser.uid}`);
                            update(leaderboardRef, { name: usernameInput })
                                .then(() => {
                                    displayMessage(successMessage, "Profile and leaderboard updated successfully!", 3000, true);
                                })
                                .catch((error) => {
                                    console.error("Error updating leaderboard:", error);
                                    displayMessage(errorMessage, "Profile updated, but failed to update leaderboard.", 3000);
                                });
                        })
                        .catch((error) => {
                            console.error("Error updating profile:", error);
                            displayMessage(errorMessage, "An error occurred. Please try again.", 3000);
                        });
                }
            } else {
                console.error("No users found in the database.");
                displayMessage(errorMessage, "An error occurred. Please try again.", 3000);
            }
        })
        .catch((error) => {
            console.error("Error checking duplicate usernames:", error);
            displayMessage(errorMessage, "An error occurred. Please try again.", 3000);
        });
}

// Utility function to display messages
function displayMessage(element, message, timeout, reload = false) {
    element.textContent = message;
    element.style.display = "block";
    setTimeout(() => {
        element.style.display = "none";
        if (reload) {
            window.location.reload(); // Reload the page if specified
        }
    }, timeout);
}


// Attach event listener to the save button
const saveButton = document.getElementById("save-profile");
if (saveButton) {
    saveButton.addEventListener("click", updateProfile);
}



// Monitor authentication state and fetch profile
function monitorAuthState() {
    // Set persistence to browser local storage
    setPersistence(auth, browserLocalPersistence)
        .then(() => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    console.log('Authenticated user:', user);
                    fetchUserProfile({ userID: user.uid }); // Fetch user profile
                    if (document.querySelector(".top-trainee")) {
                        fetchLeaderboardHome(); // Fetch leaderboard data only if on the leaderboard page
                    }
                    if (document.querySelector(".recent-game")) {
                        fetchRecentGame(); // Fetch recent game data only if on the recent game page
                    }
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

async function fetchLeaderboardHome() {
    try {
        const snapshot = await get(child(dbRef, "leaderboard"));
        if (snapshot.exists()) {
            const leaderboardData = snapshot.val();
            const topPlayers = Object.values(leaderboardData)
                .sort((a, b) => b.score - a.score) // Sort by score descending
                .slice(0, 3); // Get top 3 players

            const leaderboardContainer = document.querySelector(".top-trainee");
            if (leaderboardContainer) { // Check if the container exists
                leaderboardContainer.innerHTML = `
                    <h2>Top Trainees</h2>
                    ${topPlayers
                        .map(player => `
                            <div class="trainee-box">
                                <p>Top Player: ${player.name}</p>
                                <p>Score: ${player.score}</p>
                            </div>
                        `)
                        .join("")}
                    <button class="btn">
                        <a href="MainSiteLeaderboard.html">See Leaderboards</a>
                    </button>
                `;
            }
        } else {
            console.log("No leaderboard data found.");
        }
    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
    }
}

async function fetchRecentGame() {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error("No authenticated user.");
            return;
        }

        const snapshot = await get(child(dbRef, `users/${user.uid}/stats/recentStats`));
        if (snapshot.exists()) {
            const recentStats = snapshot.val();
            const recentGameContainer = document.querySelector(".recent-game");
            if (recentGameContainer) { // Check if the container exists
                recentGameContainer.innerHTML = `
                    <h2>Your Recent Game</h2>
                    <div class="recent-box">
                        <p>Correct Packages: ${recentStats.recentCorrectPackages || 0}</p>
                        <p>Rat Kills: ${recentStats.recentKills || 0}</p>
                        <p>Total Time: ${recentStats.recentTotalTime || 0}s</p>
                    </div>
                `;
            }
        } else {
            console.log("No recent game data found.");
        }
    } catch (error) {
        console.error("Error fetching recent game data:", error);
    }
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


