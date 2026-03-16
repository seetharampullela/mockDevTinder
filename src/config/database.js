const mongoose = require("mongoose");

const connectDb = async () => {
  await mongoose.connect(
    "mongodb+srv://seetharampullela_db_user:Z6lizP6zZnxd9D2I@cluster0.hphebdk.mongodb.net/mockDevTinder",
  );
};

module.exports = { connectDb };
