const adminAuth = (req, res, next) => {
  const token = "xyz"; //TODO: Temp token
  const isAuthorized = token == "xyz";
  if (isAuthorized) {
    next();
    // res.send("Sending all the data");
  } else {
    res.status(401).send("Unauthorized request");
  }
};
module.exports = { adminAuth };
