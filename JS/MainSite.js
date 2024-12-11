//for highlighting which page the user is on
const currentLocation = window.location.pathname;
const menuLinks = document.querySelectorAll('.navbar .menu li a');

menuLinks.forEach(link => {
    if (link.getAttribute('href') === currentLocation.split('/').pop()) {
        link.style.fontWeight = '700';
        link.style.textDecoration = 'underline';
    }
});

const leaderboard1Data = [
    { name: "Player1", time: "12.5s", score: 1500, packages: 25, kills: 10 },
    { name: "Player2", time: "15.3s", score: 1400, packages: 20, kills: 12 }
];

const leaderboard2Data = [
    { name: "Player3", time: "8.2s", score: 1800, packages: 30, kills: 15 },
    { name: "Player4", time: "9.7s", score: 1750, packages: 28, kills: 14 }
];

// Function to populate a leaderboard
function populateLeaderboard(data, tableBodyId) {
    const tableBody = document.getElementById(tableBodyId);
    
    // Check if the tableBody exists before proceeding
    if (!tableBody) return;

    tableBody.innerHTML = ""; // Clear existing rows

    for (let i = 0; i < 5; i++) {
        const row = document.createElement("tr");

        if (data[i]) {
            // If player data exists, populate the row
            row.innerHTML = `
                <td>${data[i].name}</td>
                <td>${data[i].time}</td>
                <td>${data[i].score}</td>
                <td>${data[i].packages}</td>
                <td>${data[i].kills}</td>
            `;
        } else {
            // Fill with N/A if no player data
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

// Populate both leaderboards if the elements exist
populateLeaderboard(leaderboard1Data, "leaderboard1-body");
populateLeaderboard(leaderboard2Data, "leaderboard2-body");

// Handle Question Submission
const submitButton = document.getElementById("submit-question");
if (submitButton) {
    submitButton.addEventListener("click", () => {
        const userQuestion = document.getElementById("user-question").value.trim();
        const successMessage = document.getElementById("success-message");

        if (userQuestion !== "") {
            successMessage.textContent = "Thank you! Your question has been submitted.";
            successMessage.style.color = "#28a745"; // Green for success
            successMessage.style.display = "block";

            // Hide success message after 3 seconds
            setTimeout(() => {
                successMessage.style.display = "none";
            }, 3000);

            // Clear the textarea
            document.getElementById("user-question").value = "";
        } else {
            successMessage.textContent = "Please enter a question before submitting.";
            successMessage.style.color = "red"; // Red for error
            successMessage.style.display = "block";

            // Hide error message after 3 seconds
            setTimeout(() => {
                successMessage.style.display = "none";
            }, 3000);
        }
    });
}