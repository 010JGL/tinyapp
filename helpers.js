const findUserByEmail = (email, database) => {
  for (let userId in database) {
    if (email === database[userId].email) {
      return database[userId];
    }
  }
  return undefined;
};

module.exports = { findUserByEmail }