const express = require("express");
// Creating an Express app
const app = express();
const PORT = 8080; // default port 8080
// enables cookie parser
const cookieParser = require("cookie-parser");
// enables bcryptjs
const bcrypt = require("bcryptjs");

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs"); // setting template ejs
app.use(cookieParser()); //to access req.cookies object

////// Const

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
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';


/// Funcs
const findUserByEmail = (email) => {
  for (let userId in users) {
    if (email === users[userId].email) {
      return users[userId];
    }
  }
  return false;
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

function generateRandomString() {
  let result = "";
  
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
// Not in use right now
// const findUserByPass = (password) => {
//   for (let userId in users) {
//     if (password === users[userId].password) {
//       return users[userId];
//     }
//   }
//   return false;
// };

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];       // gets the userId in cookies info
   
  if (!userId) {                                // if there is no user logged in
    const msg = `<div>You have to be logged in</div>`;
    return res.status(400).send(msg);
  }
  let currentUser = findUserById(userId);    //makes an empty object if there is no current user
  if (!currentUser) {
    currentUser = {};
  }
  
  const usersUrl = urlsForUser(userId);
  const templateVars = { urls: usersUrl, userId: currentUser["id"], users: users };

  return res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  
  const userId = req.cookies["user_id"] || null;
  if (!userId) {
    const box = `<div>You have to be logged in</div>`;
    return res.status(400).send(box);
  }
  const id = generateRandomString();           // create a random id
  
  urlDatabase[id] = {                    // how to update the data base with the new infos
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  };

  res.redirect(`/urls/${id}`);        // Respond with 'Ok' (we will replace this)
});

app.get("/urls/new", (req, res) => {   // new route, should be ordered to most specific to least specific
  
  const userId = req.cookies["user_id"] || null;
  if (!userId) {                  // Cannot create a new URL if not logged in
    
    return res.redirect('/login');
  }
  const templateVars = { urls: urlDatabase[userId], userId: userId };
  res.render('urls_new', templateVars);

});


app.get("/urls/:id", (req, res) => {   // :id route parameter
  const shorty = req.params.id;        // gets the :id value from the URL
  
  const userId = req.cookies["user_id"] || null;
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

  const templateVars = { id: shorty, urls: urlDatabase, userId: userId };
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
  const userId = req.cookies["user_id"] || null;
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
  const userId = req.cookies["user_id"] || null;
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
  const id2 = req.cookies.user_id;        // the value of user_id in the object cookies
  const longURL = urlDatabase[id].longURL;    // link the id with the URL
  
  if (id2 !== urlDatabase[id].userID) {       //if the cookie user_id is not in database
    return res.status(400).send(`<div>Id does not exist</div>`);
  }
  res.redirect(longURL);   //sends back to the original URL
});
  
app.post('/logout', (req, res) => {
  const userId = req.cookies["user_id"] || null;
  res.clearCookie('user_id');
  res.redirect('/login');
});
  
app.get('/register', (req, res) => {
    
  const userId = req.cookies["user_id"] || null;
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
  
  if (findUserByEmail(email)) {
    res.status(400).send('Email already exist');
    return;
  }
  
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword
  };
  
  const user = findUserByEmail(email);    // lower so we can check the database once its updated
  
  res.cookie('user_id', user.id);
  return res.redirect('/urls');
});

app.get('/login', (req, res) => {
  
  const userId = req.cookies["user_id"] || null;
  const templateVars = { userId: userId };
  
  if (!userId) {
    res.render('urls_login', templateVars);
  } else {
    res.redirect('/urls');
  }
  
});


app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10)
  if (email === "") {
    res.status(403).send('User invalid');
    return;
  }
  
  const user = findUserByEmail(email);      // lower so we can check the database once its updated
  

  if (!user) {
    return res.status(400).send('Email cannot be found');
  }
  if (bcrypt.compareSync(user.password, hashedPassword) !== true) {     // compares the password provided with the hash version
    return res.status(403).send('Wrong password.');
  }
  
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});