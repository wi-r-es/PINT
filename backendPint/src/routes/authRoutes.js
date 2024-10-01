const express = require("express");
const {
  validation,
  validation_noenc,
} = require("../controllers/jwt_middlewareController");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/setup-password", authController.setupPassword);
router.patch(
  "/change-password",
  validation,
  authController.updatePassword
);
router.post("/login", authController.login_web);
router.post("/login_mobile", authController.login_mobile);
/* @DEPRECATED
router.post("/login_google", authController.login_google);
*/
router.post("/login_sso", authController.login_SSO);

router.get("/get-user-by-token", validation, authController.getUserByToken);
router.post("/refresh-token", authController.refreshToken);
//router.put('/update-last-access', validation, authController.updateLastAccess);
router.post("/change-password", validation, authController.updatePassword);

router.post("/request-password-reset", authController.startRecoveryPassword);
router.post("/password-reset", authController.resetPassword);


router.patch("/store-fcm-token", validation ,authController.updateFcmToken);


module.exports = router;
