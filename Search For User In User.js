const axios = require('axios');
const readline = require('readline');
const chalk = require('chalk').default;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function userExists(username) {
  try {
    await axios.get(`https://api.github.com/users/${username}`, {
      headers: { 'User-Agent': 'GitHub-User-Search' }
    });
    return true;
  } catch (error) {
    return false;
  }
}

async function findUserInList(mainUser, targetUser, listType) {
  const baseUrl = `https://api.github.com/users/${mainUser}`;
  const listUrl = listType === '1' ? `${baseUrl}/followers` : `${baseUrl}/following`;
  let page = 1;
  let perPage = 30;
  let foundUsers = [];
  
  console.log(chalk.blue(`Searching for '${targetUser}' in ${listType === '1' ? 'followers' : 'following'} list of '${mainUser}'...`));
  
  while (true) {
    try {
      const response = await axios.get(`${listUrl}?per_page=${perPage}&page=${page}`, {
        headers: { 'User-Agent': 'GitHub-User-Search' }
      });
      const users = response.data;
      
      if (users.length === 0) break;
      
      const matches = users.filter(user => new RegExp(targetUser, 'i').test(user.login));
      
      if (matches.length > 0) {
        for (const user of matches) {
          try {
            const userDetails = await axios.get(`https://api.github.com/users/${user.login}`, {
              headers: { 'User-Agent': 'GitHub-User-Search' }
            });
            foundUsers.push({
              username: user.login,
              name: userDetails.data.name || 'No name available',
              page
            });
          } catch (error) {
            foundUsers.push({
              username: user.login,
              name: 'No name available',
              page
            });
          }
        }
      }
      
      page++;
    } catch (error) {
      console.error(chalk.red('Error fetching data:'), error.response ? error.response.data : error.message);
      break;
    }
  }
  
  if (foundUsers.length > 0) {
    console.log(chalk.green(`\nFound the following users matching '${targetUser}':`));
    foundUsers.forEach(user => {
      console.log(chalk.yellow(`- ${user.username} (${user.name}) on page ${user.page} -> `) + chalk.blue.underline(`https://github.com/${user.username}`));
    });
  } else {
    console.log(chalk.red(`User '${targetUser}' not found in the list.`));
  }
  rl.close();
}

rl.question('Enter the GitHub username to search in: ', async (mainUser) => {
  if (!(await userExists(mainUser))) {
    console.log(chalk.red(`GitHub user '${mainUser}' does not exist.`));
    rl.close();
    return;
  }
  rl.question('Enter the username to find (or part of it): ', (targetUser) => {
    rl.question('Which list to search in? (1: Followers, 2: Following): ', (listType) => {
      if (listType !== '1' && listType !== '2') {
        console.log(chalk.red('Invalid choice. Please enter 1 or 2.'));
        rl.close();
      } else {
        findUserInList(mainUser, targetUser, listType);
      }
    });
  });
});
