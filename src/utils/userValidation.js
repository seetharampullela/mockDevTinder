const validator = require("validator");

const validateUserData = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  const ALLOWED_UPDATES = [
    "firstName",
    "lastName",
    "skills",
    "emailId",
    "password",
    "age",
    "gender",
    "skills",
    "about",
    "photoUrl",
    "loginId",
  ];
  if (!firstName || !lastName) {
    throw new Error("Name is not valid");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email Address is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password");
  } else if (!Object.keys(req.body).every((i) => ALLOWED_UPDATES.includes(i))) {
    throw new Error("Request contains invalid input");
  }
};

module.exports = { validateUserData };
