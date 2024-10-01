class PasswordReuseError extends Error {
    constructor(message) {
      super(message);
      this.name = "PasswordReuseError";
    }
  }
  
  module.exports = PasswordReuseError;