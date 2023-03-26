const express = require("express");
// Creating an Express app
const app = express();
const PORT = 8080; // default port 8080
// enables cookie parser
//const cookieParser = require("cookie-parser"); Removed this for cookie session
// enables bcryptjs
const bcrypt = require("bcryptjs");
// enables cookie session
const cookieSession = require('cookie-session');

const { findUserByEmail, generateRandomString, findUserById, urlsForUser } = require('./helpers.js');


app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs"); // setting template ejs
//app.use(cookieParser()); //to access req.cookies object
app.use(cookieSession({
  name: 'session',
  keys: ["the secret value"],
}));



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

const users = {         //examples ID added the database with functions so they work properly
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


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  //const userId = req.cookies["user_id"];       // gets the userId in cookies info
  const userId = req.session.user_id;             // get userId in the new way, with session
 
  if (!userId) {                                // if there is no user logged in
    const msg = `<div>You have to be logged in</div>`;
    return res.status(400).send(msg);
  }
  let currentUser = findUserById(userId);    //makes an empty object if there is no current user
  if (!currentUser) {
    currentUser = {};
  }
  
  const usersUrl = urlsForUser(userId);
  console.log(usersUrl);
  const templateVars = { urls: usersUrl, userId: userId, users: users };

  return res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  
  const userId = req.session.user_id;
  if (!userId) {
    const box = `<div>You have to be logged in</div>`;
    return res.status(400).send(box);
  }
  const shortUrl = generateRandomString();           // create a random id
  
  urlDatabase[shortUrl] = {                    // how to update the data base with the new infos
    longURL: req.body.longURL,
    userID: req.session.user_id
  };

  res.redirect(`/urls/${shortUrl}`);        // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {   // new route, should be ordered to most specific to least specific
  const usersDatabase = users;
  const userId = req.session.user_id;
  if (!userId) {                  // Cannot create a new URL if not logged in
    
    return res.redirect('/login');
  }
  const templateVars = { urls: urlDatabase[userId], userId: userId , users: usersDatabase };
  res.render('urls_new', templateVars);

});


app.get("/urls/:id", (req, res) => {   // :id route parameter
  const shorty = req.params.id;        // gets the :id value from the URL
  const usersDatabase = users;
  const userId = req.session.user_id || null;
  if (!userId) {
    const box = `<div>You have to be logged in</div>`;
    return res.status(400).send(box);
  }
  if (!urlDatabase[shorty]) {
    const box = `<div>This url doesnt exist</div>`;
    return res.status(400).send(box);
  }
  if (userId !== urlDatabase[shorty].userID) {
    const box = `<div>This url doesnt belong to you</div>`;
    return res.status(400).send(box);
  }

  const templateVars = { id: shorty, urls: urlDatabase, userId: userId, users: usersDatabase};
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});
 
app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

 
app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const id = req.params.id;    //gets the ID from req.params
  if (!userId) {
    const box = `<div>You have to be logged in</div>`;
    return res.status(400).send(box);
  }
  if (!urlDatabase[id]) {
    const box = `<div>This ID doesnt exist</div>`;
    return res.status(400).send(box);
  }
  if (userId !== urlDatabase[id].userID) {
    const box = `<div>This url doesnt belong to you</div>`;
    return res.status(400).send(box);
  }
  delete urlDatabase[id];       // delete the data associated with the id
  res.redirect(`/urls`);
});
  
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;                   // import id data with req
  const userId = req.session.user_id || null;
  if (!userId) {
    const box = `<div>You have to be logged in</div>`;
    return res.status(400).send(box);
  }
  if (!urlDatabase[id]) {
    const box = `<div>This ID doesnt exist</div>`;
    return res.status(400).send(box);
  }
  if (userId !== urlDatabase[id].userID) {
    const box = `<div>This url doesnt belong to you</div>`;
    return res.status(400).send(box);
  }
  urlDatabase[id] = req.body.urlInput;        // refer to the data with the name we gave the input
  res.redirect('/urls');
});
  
app.get("/u/:id", (req, res) => {
  const id = req.params.id;              // gets the 6 random string associated with that URL
  if (!urlDatabase[id]) {
    const box = `<div>The URL for this ID doesnt exist</div>`;
    return res.status(400).send(box);
  }
  
  const longURL = urlDatabase[id].longURL;    // link the id with the URL
  
  res.redirect(longURL);   //sends back to the original URL
});
  
app.post('/logout', (req, res) => {
  //res.clearCookie('user_id');
  req.session = null;       // clear cookies equivalent, also destroy the signature
  res.redirect('/login');
});
  
app.get('/register', (req, res) => {
    
  const userId = req.session.user_id || null;
  const templateVars = { userId: userId };
  
  if (!userId) {
    res.render('urls_register', templateVars);   //if new user(no cookie), send to register form
  } else {
    res.redirect('/urls');
  }
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);  // hashes the password with bcrypt

  if (email === "") {
    res.status(400).send('User invalid');
    return;
  }
  const userId = generateRandomString();
  
  if (findUserByEmail(email, users)) {
    res.status(400).send('Email already exist');
    return;
  }
  
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword
  };
  
  const user = findUserByEmail(email, users);    // lower so we can check the database once its updated
  //res.cookie('user_id', user.id);
  req.session.user_id = user.id;             // creation of the cookie
  return res.redirect('/urls');
});

app.get('/login', (req, res) => {
  
  const userId = req.session.user_id;
  const templateVars = { userId: userId };
  
  if (!userId) {
    res.render('urls_login', templateVars);
  } else {
    res.redirect('/urls');
  }
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === "") {
    res.status(403).send('User invalid');
    return;
  }
  
  const user = findUserByEmail(email, users);      // lower so we can check the database once its updated

  if (!user) {
    return res.status(400).send('Email cannot be found');
  }
  if (bcrypt.compareSync(user.password, bcrypt.hashSync(user.password, 10)) !== true) {     // compares the password provided with the hash version, you have to hash them at the same time... cannot use hashed password like in register
    return res.status(403).send('Wrong password.');
  }
  //res.cookie('user_id', user.id);  // old way of creating cookie
  req.session.user_id = user.id;     // creation of the cookie
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

