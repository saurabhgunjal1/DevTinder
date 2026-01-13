const express = require("express");
const { validationSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  // const user = new User(req.body);
  try {
    validationSignUpData(req);
    const { firstName, lastName, emailId, password, gender } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: hashPassword,
    });
    const userData = await user.save();
    const token = await userData.getJwt();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    res.json({ message: "User added successfully!", data: userData });
  } catch (error) {
    res.status(400).send("Error saving the user:" + error.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordValid = await user.validatePassword(password);
    if (isPasswordValid) {
      const token = await user.getJwt();
      res.cookie("token", token);
      // res.send("Login Successfull!");
      res.send(user);
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (error) {
    res.status(400).send(`Error:  ${error.message}`);
  }
});

authRouter.post("/logout", (req, res) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logout Successfull!!");
});

module.exports = authRouter;
