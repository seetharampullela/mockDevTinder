const jwt = require("jsonwebtoken");
const User = require("../model/user");

// const adminAuth = (req, res, next) => {
//   // const token = "xyz"; //TODO: Temp token
//   const { token } = req.cookies;
//   const isAuthorized = token == "xyz";
//   if (isAuthorized) {
//     next();
//     // res.send("Sending all the data");
//   } else {
//     res.status(401).send("Unauthorized request");
//   }
// };

const userAuth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Authentication failed");
    }
    /* 
      1. decodedToken would look like { _id: '69b9836ef977dfdca2c30c0c', iat: 1773799587 }
      2. _id is the secret key that we stored while login, and iat is added as default by jwt
    */
    const { _id } = await jwt.verify(token, "DEV@TINDER142");
    // const { _id } = decodedTokenValue;
    if (!_id) {
      throw new Error("Invalid token!");
    }
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("Invalid User");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
};

module.exports = { userAuth };
