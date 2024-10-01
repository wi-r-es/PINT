
const validator = require("validator");

const validateInput_Login = (email, password) => {
    if (!validator.isEmail(email)) {
      return { valid: false, message: "Invalid email" };
    }
    if (validator.isEmpty(password)) {
      return { valid: false, message: "Password cannot be empty" };
    }
    return { valid: true };
  };


const validateInput_register =(email, firstName, lastName) => {
  if (!validator.isEmail(email)) {
    return {valid: false, message: "Invalid email" };
  }
  if (
    validator.isEmpty(firstName) ||
    !validator.isAlpha(firstName, "en-US", { ignore: " " })
  ) {
    return {valid: false, message: "Invalid first name" };
  }
  if (
    validator.isEmpty(lastName) ||
    !validator.isAlpha(lastName, "en-US", { ignore: " " })
  ) {
    return {valid: false, message: "Invalid last name" };
  }
  return { valid: true };
}

  module.exports = {
    validateInput_Login,
    validateInput_register,

  };
