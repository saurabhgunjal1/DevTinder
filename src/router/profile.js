const express = require("express");
const { userAuth } = require("../middlewares/auth");
const {
  validateEditProfileData,
  validateEditPassword,
} = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");

const profileRoute = express.Router();

profileRoute.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send("ERROR:" + error.message);
  }
});

profileRoute.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request!");
    }
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName} your profile has been updated successfully!!`,
      data: loggedInUser,
    });
  } catch (error) {
    res.status(400).send("ERROR:" + error.message);
  }
});

profileRoute.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { password, newPassword } = req.body;

    const isValid = await validateEditPassword(loggedInUser, password);
    if (!isValid) {
      throw new Error("Current password is incorrect");
    }
    if (!newPassword || !validator.isStrongPassword(newPassword)) {
      throw new Error(
        "Password must contain uppercase, lowercase, number & symbol"
      );
    }

    if (newPassword === password) {
      throw new Error("Your existing password and new password are same!");
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(
      loggedInUser._id,
      { password: hashedPassword },
      { runValidators: true }
    );

    res.json({
      message: `${loggedInUser.firstName} your password has been updated successfully!!`,
    });
  } catch (error) {
    res.status(400).send("ERROR:" + error.message);
  }
});

module.exports = profileRoute;
