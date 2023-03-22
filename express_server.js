const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const cookieParser = require("cookie-parser");

app.set("view engine", "ejs"); // template ejs
app.use(cookieParser());



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {         //examples ID
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const findUserByEmail = (email) => {
  for (let userId in users) {
    if (email === users[userId].email) {
      return users[userId];
    }
  }
  return false
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {           // passing the username to index
  
  const userId = req.cookies["user_id"] || null
  const templateVars = { urls: urlDatabase, userId: users[userId]};
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {   // new route, should be ordered to most specific to least specific
  
  const userId = req.cookies['user_id']
  const templateVars = {userId: users[userId]}
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {   // :id route parameter
  const userId = req.cookies["user_id"] || null
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], userId: userId };
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  
  const id = generateRandomString()           // create a random id
  urlDatabase[id] = req.body.longURL        // push the value of req.body at the id key we just generated
  res.redirect(`/urls/${id}`);        // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id/delete", (req, res) => {
  
  const id = req.params.id;    //gets the ID from req.params
  delete urlDatabase[id];       // delete the data associated with the id
  res.redirect(`/urls`)
});

app.post("/login", (req, res) => {
  
  const username = req.body.username;
  const userId = JSON.stringify(username)
  res.cookie('user_id', userId)
  res.redirect("/urls")

})

app.post("/urls/:id", (req, res) => {
  
  const id = req.params.id                   // import id data with req
  urlDatabase[id] = req.body.urlInput        // refer to the data with the name we gave the input
  res.redirect('/urls')
});

app.get("/u/:id", (req, res) => {
  
  const id = req.params.id              // gets the 6 random string associated with that URL
  const longURL = urlDatabase[id];    // link the id with the URL
  res.redirect(longURL);
});

app.post('/logout', (req, res) => {

  res.clearCookie('user_id');
  res.redirect('/urls')

});

app.get('/register', (req, res) => {
  
  const userId = req.cookies["user_id"] || null
  const templateVars = { urls: urlDatabase, userId: userId };
  res.render('urls_register', templateVars)
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  
  if (email === "") {
    res.status(400).send('User invalid')
  }
  const userId = generateRandomString();
  
  if (findUserByEmail(email)) {
    res.status(400).send('Email already exist')
  }

  users[userId] = {
    id: userId,
    email: email,
    password, password
  };

  const user = findUserByEmail(email);    // lower so we can check the database once its updated
  
  res.cookie('user_id', user.id);
  return res.redirect('/urls')
});

app.get('/login', (req, res) => {
  
  const userId = req.cookies["user_id"] || null
  const templateVars = { urls: urlDatabase, userId: userId };
  res.render('urls_login', templateVars)
});


const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateRandomString() {
  let result = "";
  
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result;
};

