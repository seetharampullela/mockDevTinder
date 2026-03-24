const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* schema definition */
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
      minLength: 4,
      maxLength: 50,
    },
    loginId: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 12,
    },
    emailId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Address " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password  " + value);
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      //   enum: ["Male", "Female"],
      validate(value) {
        if (!["Male", "Female"].includes(value)) {
          throw new Error("The gender is not supported");
        }
      },
    },
    skills: {
      type: [String],
      maxLength: 10,
    },
    about: {
      type: String,
      default: "This is a default description of the user",
    },
    photoUrl: {
      type: String,
      default:
        "https://media.istockphoto.com/id/1327592506/vector/default-avatar-photo-placeholder-icon-grey-profile-picture-business-man.jpg?s=612x612&w=0&k=20&c=BpR0FVaEa5F24GIw7K8nMWiiGmbb8qmhfkpXcp1dhQg=",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL " + value);
        }
      },
    },
  },
  { timestamps: true },
);

/* Schema methods (these methods could be written in ) */
userSchema.methods.getJWT = async function () {
  const user = this;
  const jwtToken = await jwt.sign({ _id: user._id }, "DEV@TINDER142", {
    expiresIn: "1h",
  });

  return jwtToken;
};

userSchema.methods.validatePassword = async function (passwordInput) {
  const user = this;
  const isPasswordValid = await bcrypt.compare(passwordInput, user.password);
  return isPasswordValid;
};

/* 
    we can write in this way ⬇️ or simply line 79
    const User = mongoose.model("User", userSchema);
    module.exports = User 
*/

module.exports = mongoose.model("User", userSchema);
