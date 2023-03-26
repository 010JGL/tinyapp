
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {         //examples ID
  aJ48lW: {
    id: "aJ48lW",
    email: "a@a.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "123",
  },
};

function generateRandomString() {
  let result = "";
  
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const findUserByEmail = (email, database) => {
  for (let userId in database) {
    if (email === database[userId].email) {
      return database[userId];
    }
  }
  return undefined;
};

const findUserById = (userId) => {
  for (let id in users) {
    if (userId === id) {
      return users[id];
    }
  }
  return null;
};

const urlsForUser = (userId) => {
  const results = {};
  for (let shortUrl in urlDatabase) {                //looking for the shortUrl in the database

    if (userId === urlDatabase[shortUrl].userID) {    // check if the userid is in the database
      results[shortUrl] = urlDatabase[shortUrl];       // makes the links in the database in the empty object
    }
  }
  return results;
};

module.exports = { findUserByEmail, generateRandomString, findUserById, urlsForUser }