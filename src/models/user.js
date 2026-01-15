const { mongoose } = require("mongoose");
const { Schema } = mongoose;
const validator = require("validator");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 30,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email not valid!");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Please add a strong password!");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,

      enum: {
        values: ["male", "female", "other"],
        message: `{VALUE} is not a valid gender type`,
      },
      // validate(value) {
      //   if (!["male", "female", "others"].includes(value)) {
      //     throw new Error("Gender data is not valid");
      //   }
      // },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
    },
    photoUrl: {
      type: String,
      default: "https://geographyandyou.com/images/user-profile.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Photo Url not valid!");
        }
      },
    },
    about: {
      type: String,
      default: "this is default about!",
    },
    skills: {
      type: [String],
    },
  },

  { timestamps: true }
);

// userSchema.index({ firstName: 1, lastName: 1 });

userSchema.methods.getJwt = async function () {
  const user = this;
  const token = await JWT.sign({ _id: user._id }, "devTinder@125", {
    expiresIn: "1d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordEnterByUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordValid = await bcrypt.compare(
    passwordEnterByUser,
    passwordHash
  );
  return isPasswordValid;
};
module.exports = mongoose.model("User", userSchema);
