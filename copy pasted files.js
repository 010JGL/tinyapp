urlDatabase[id] = {                    // how to update the data base with the new infos
  longURL: req.body.longURL,
  userID: req.cookies["user_id"]
};