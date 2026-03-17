const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      //   enum: ["Male", "Female"],
      validate(value) {
        if (!["male", "female"].includes(value)) {
          throw new Error("The gender is not supported");
        }
      },
    },
    skills: {
      type: [String],
    },
    about: { type: String },
    photoUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

// const User = mongoose.model("User", userSchema);
// module.exports = User

module.exports = mongoose.model("User", userSchema);
