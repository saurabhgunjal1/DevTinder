const validator = require("validator");
const User = require("../models/user");

function validationSignUpData(req) {
  const { firstName, lastName, emailId, password } = req.body;
  // firstName validation

  if (
    !firstName ||
    firstName.length < 3 ||
    firstName.length > 30 ||
    !/^[A-Za-z]+$/.test(firstName)
  ) {
    throw new Error("First name must be 3–30 letters only");
  }

  // email validation
  if (!emailId || !validator.isEmail(emailId)) {
    throw new Error("Email is not valid");
  }

  // password validation
  if (!password || !validator.isStrongPassword(password)) {
    throw new Error(
      "Password must contain uppercase, lowercase, number & symbol"
    );
  }
}

function validateEditProfileData(req) {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "emailId",
    "age",
    "gender",
    "photoUrl",
    "about",
    "skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );
  return isEditAllowed;
}

async function validateEditPassword(user, password) {
  return await user.validatePassword(password);
}

module.exports = {
  validationSignUpData,
  validateEditProfileData,
  validateEditPassword,
};
