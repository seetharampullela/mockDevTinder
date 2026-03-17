const express = require("express");
const { adminAuth } = require("./middlewares/auth");
const app = express();
const { connectDb } = require("./config/database");
const User = require("./model/user");

// A middleware - To Read the request body that is in JSON format
app.use(express.json());

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
    // if (req.body) {
    const user = new User(req.body);
    await user.save();
    res.send("User added successfully");
    // }
  } catch (err) {
    res.status(404).send(
      JSON.stringify({
        failedMessage: `something went wrong ${err.message}`,
      }),
    );
  }
});

app.post("/addUsers", async (req, res) => {
  try {
    await User.insertMany(req.body);
    res.send("Users added successfully");
  } catch (err) {
    res.status(404).send(
      JSON.stringify({
        failedMessage: `something went wrong ${err.message}`,
      }),
    );
  }
});

app.get("/feed", async (req, res) => {
  try {
    const user = await User.find();
    res.send(user);
  } catch (err) {
    res.status(404).send("Cannot find any data");
  }
});

app.post("/getUserByEmail", async (req, res) => {
  const emailId = req.body.emailId;
  try {
    const user = await User.find({ emailId });
    res.send(user);
  } catch (err) {
    res.status(404).send("User Not Found");
  }
});

app.delete("/user", async (req, res) => {
  const userId = req.body.userId;
  try {
    if (userId) {
      const user = await User.findByIdAndDelete(userId);
      if (user) {
        console.log("🚀 ~ user:", user);
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
    });
    const ALLOWED_UPDATES = ["firstName", "lastName", "skills"];
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
    res.status(400).send(
      "Something went wrong" + err.message,
      // JSON.stringify({
      //   failedMessage: `something went wrong ${err.message}`,
      // }),
    );
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
