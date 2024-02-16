const jwt = require("jsonwebtoken");
// génération de notre clé secrète
const JWT_SIGN_SECRET =
  "07sjkjvglkdfenvldfhKJOUH9472jhkl34kjhdfoldkjfvlfjMObniuTd94ncvjdiefndkjJHLJYjghjkhklUjh8rccsdfjklhjgkljhgldkjf";

// Exported functions
module.exports = {
  generateTokenForUser: function (userData) {
    return jwt.sign(
      {
        userId: userData.id,
        isAdmin: userData.isAdmin,
      },
      JWT_SIGN_SECRET,
      { expiresIn: "24h" }
    );
  },
};
