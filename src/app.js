const express = require("express");
const { userAuth } = require("./middlewares/auth");
const app = express();
const { connectDb } = require("./config/database");
const User = require("./model/user");
const { validateUserData } = require("./utils/userValidation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

// A middleware - To Read the request body that is in JSON format
app.use(express.json());
// A middleware - To parse the cookies else will be undefined
app.use(cookieParser());

// app.use("/admin", adminAuth);
// app.use("/admin/getUser", (req, res) => {
//   res.send("Get Admin user >>> Route");
// });

// app.use("/getUserData", (req, res) => {
//   throw new Error("No user Data");
// });

// app.use("/", (err, req, res, next) => {
//   if (err) {
//     res.status(500).send("Something went wrong");
//   }
// });

// app.use("/user", (req, res) => {
//   res.send("First Route");
// });

// app.get("/getApp", (req, res) => {
//   res.send("Get Route");
// });

// app.post("/postApp", (req, res) => {
//   res.send("Post Route");
// });

app.post("/signup", async (req, res) => {
  try {
    validateUserData(req);
    const { firstName, lastName, password, emailId, loginId } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      loginId: loginId,
    });
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

app.post("/login/:loginId", async (req, res) => {
  try {
    const { password } = req.headers;
    const loginId = req.params?.loginId;
    const user = await User.findOne({ loginId: loginId });
    if (!user) {
      throw new Error("Invalid credentials");
    } else {
      const isValidPassword = await user.validatePassword(password);
      /* 
        jwt.sign method accepts data obj and a private secret key(used for verifying later). 
        Secret key could be anything. 
      */
      const jwtToken = await user.getJWT();

      res.cookie("token", jwtToken, {
        expires: new Date(Date.now() + 60 * 60 * 1000),
      });
      if (isValidPassword) {
        res.send("Login Successful!!!");
      } else {
        throw new Error("Invalid credentials");
      }
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

app.get("/profile", userAuth, async (req, res) => {
  try {
    const { token } = req.cookies;
    /* 
      1. decodedToken would look like { _id: '69b9836ef977dfdca2c30c0c', iat: 1773799587 }
      2. _id is the secret key that we stored while login, and iat is added as default by jwt
    */
    const decodedTokenValue = await jwt.verify(token, "DEV@TINDER142");
    const { _id } = decodedTokenValue;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("Invalid User");
    }
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

app.post("/logout", async (req, res) => {
  res.clearCookie();
  res.send("Logged out");
});

app.post("/addUsers", async (req, res) => {
  try {
    await User.insertMany(req.body);
    res.send("Users added successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

app.get("/feed", userAuth, async (req, res) => {
  try {
    const user = await User.find();
    res.send(user);
  } catch (err) {
    res.status(400).send("Cannot find any data");
  }
});

app.post("/getUserByEmail", async (req, res) => {
  const emailId = req.body.emailId;
  try {
    const user = await User.find({ emailId });
    res.send(user);
  } catch (err) {
    res.status(400).send("User Not Found");
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    if (userId) {
      const user = await User.findByIdAndDelete(userId);
      if (user) {
        res.send("User Deleted Successfully.");
      } else {
        res.status(500).send(`User with ${userId} not found`);
      }
    } else {
      res.status(500).send(`Please send the valid userId`);
    }
  } catch (err) {
    res.status(404).send("User Not Found");
  }
});

/* Patch call is generally made to update a few fields of the Document */
app.patch("/user/:userId", async (req, res) => {
  const userId = req.params.userId;
  const updatePayload = req.body;

  try {
    /* we can use findOneAndUpdate method too here */
    // Third argument is the options > Read documentation https://mongoosejs.com/docs/api/model.html#Model.findByIdAndUpdate()
    const user = await User.findByIdAndUpdate(userId, updatePayload, {
      returnDocument: "after",
      runValidators: true,
    });
    const ALLOWED_UPDATES = ["firstName", "lastName", "skills", "emailId"];
    if (!Object.keys(req.body).every((i) => ALLOWED_UPDATES.includes(i))) {
      throw new Error("Update is not allowed for this payload");
    }

    if (req.body?.skills?.length > 10) {
      throw new Error("Skills shall not be greater than 10");
    }

    if (user) {
      res.send({ successMessage: "User Updated Successfully", [userId]: user });
    } else {
      res.status(500).send(`The user with ${userId} does not exist`);
    }
  } catch (err) {
    res.status(400).send("UPDATE FAILED: " + err.message);
  }
});

connectDb()
  .then(() => {
    console.log("Database connection established...");
    app.listen(7777, () => {
      console.log("Server started listening to the 7777 port");
    });
  })
  .catch((e) => {
    console.log("there is an error", e);
  });
