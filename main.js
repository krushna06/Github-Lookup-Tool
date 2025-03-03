require('dotenv').config();
const readline = require('readline');
const fs = require('fs');

const token = process.env.GITHUB_TOKEN;

if (!token) {
    console.error("GitHub token is missing. Please set it in the .env file.");
    process.exit(1);
}

const logFile = 'logs.txt';

function logToFile(entry) {
    fs.appendFileSync(logFile, entry + '\n', 'utf8');
}

function fetchUserIdByUsername(username) {
    return fetch(`https://api.github.com/users/${username}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('User not found');
        }
    })
    .then(data => {
        const logEntry = `Username: ${username} directs to UserId: ${data.id}`;
        console.log(logEntry);
        logToFile(logEntry);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
}

function fetchUsernameByUserId(userId) {
    return fetch(`https://api.github.com/user/${userId}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('User not found');
        }
    })
    .then(data => {
        const logEntry = `UserId: ${userId} directs to Username: ${data.login}`;
        console.log(logEntry);
        logToFile(logEntry);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
}

function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Enter 1 to fetch User ID by Username or 2 to fetch Username by User ID: ", (choice) => {
        if (choice === '1') {
            rl.question("Enter the GitHub username: ", (username) => {
                fetchUserIdByUsername(username).finally(() => rl.close());
            });
        } else if (choice === '2') {
            rl.question("Enter the GitHub user ID: ", (userId) => {
                const parsedUserId = parseInt(userId, 10);
                if (!isNaN(parsedUserId)) {
                    fetchUsernameByUserId(parsedUserId).finally(() => rl.close());
                } else {
                    console.log("Invalid user ID. Please enter a number.");
                    rl.close();
                }
            });
        } else {
            console.log("Invalid choice. Please enter 1 or 2.");
            rl.close();
        }
    });
}

main();
