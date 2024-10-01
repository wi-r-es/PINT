const db = require("../models/");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const admin = require("firebase-admin");
const validator = require("validator");
const bcrypt = require("bcryptjs");
//const crypto = require("crypto");
const { verifyToken } = require("../utils/tokenUtils");
const { sendMail } = require("./emailController");
const PasswordReuseError = require('../errors/passwordReuseError');

const {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateTokenFor1stLog,
  generateTokenAccountCreation_resetpasword
} = require("../utils/tokenUtils");

const {
  validateInput_Login,
  validateInput_register,
} = require("../utils/inputValidators");

const {
  logUserAction,
  updateAccessOnLogin,
  sp_verifyUser,
  sp_updateLastAccess,
  findUserByGoogleId,
  findUserBySSOId,
  findUserByEmail,
  updateUser,
  createUser,
  isLastAccessNull,
  getUserRole,
} = require("../database/logic_objects/usersProcedures");

const {
  spRegisterNewUser,
  spCreatePassword,
  sp_findUserById,
  sp_findUserByEmail,
  spChangeUserPassword,
} = require("../database/logic_objects/securityProcedures");



const controllers = {};

function mashupAndRandomize(email, firstName, lastName) {
  const combinedString = email + firstName + lastName;
  const charArray = combinedString.split("");

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const shuffledArray = shuffleArray(charArray);
  return shuffledArray.join("");
}

controllers.register = async (req, res) => {
  const { email, firstName, lastName, centerId } = req.body;
  console.log("req.body:", req.body);

  const validationResult = validateInput_register(email, firstName, lastName);
  if (!validationResult.valid) {
    return res
      .status(400)
      .json({ success: false, message: validationResult.message });
  }

  const verifyEmail = await sp_findUserByEmail(email);
  if (verifyEmail) {
    return res.status(400).json({
      success: false,
      message: "Email already exists. Please use another email.",
    });
  }

  try {
    const user = await spRegisterNewUser(firstName, lastName, email, centerId);

    console.log("user:", user);

    // Assegure que 'user' seja um objeto simples
    if (Array.isArray(user) && user.length > 0) {
      const userPayload = {
        id: user[0].user_id, // Acesse o primeiro elemento do array
      };
      console.log("userPayload:", userPayload);

      const token = generateTokenAccountCreation_resetpasword(user[0].user_id);
      //await sp_insertUserAccDetails(user[0].user_id);
      const random_sub_url = mashupAndRandomize(email, firstName, lastName);
      const stringtoken = JSON.stringify(token);
      const url = `${process.env.CLIENT_URL}/setup-password/${random_sub_url}?token=${encodeURIComponent(stringtoken)}`;
      console.log("url:", url);
      console.log("user:", user);

      await sendMail({
        to: email,
        subject: "Set Up Your New Password",
        body: `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="text-align: center; color: #00c2ff;">Set Up Your New Password</h2>
            <p>Hello, dear ${user.name}</p>
            <p>We received a request to create an account. Please click the button below to set up your new password:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${url}" style="background-color: #00c2ff; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">Set Up New Password</a>
            </div>
            <p>If you did not request this, you can ignore this email.</p>
            <p>Thank you,<br>The Softinsa Team</p>
          </div>
        `,
      });

      res.status(201).json({
        success: true,
        message:
          "User registered successfully. Please check your email to set up your password.",
      });}
    //}
  } catch (error) {
    console.error("CONSOLE LOG REGISTER:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error: " + error });
  }
};


controllers.setupPassword = async (req, res) => {
  const {password,token} = req.body;
  try {
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  console.log('Token received:', JSON.parse(token));
  const encryptedToken = JSON.parse(token); // Ensure token is parsed if sent as a stringified object
  const user = verifyToken(encryptedToken);
  console.log('USER: '+ JSON.stringify(user) );

  if (user == null) {
    return res.status(403).json({ message: "Invalid token" });
  }

  if (!validator.isStrongPassword(password)) {
    return res
      .status(400)
      .json({ success: false, message: "Password is not strong enough" });
  }

    const userId = user.id;

    await spCreatePassword(userId, password);

    const user2 = await sp_findUserById(userId);
    console.log("user:", user2);
    console.log("user:", user2);
    await sendMail({
      to: user2.email,
      subject: "Password Setup Successful",
      body: `Dear ${user2.name},
      
              Your password has been set up successfully.

              Thank you,
                The Softinsa Team
              `,
    });

    await logUserAction(
      userId,
      "PASSWORD CREATED",
      "Created user account password"
    );

   // await sp_updateLastAccess(userId);

    res
      .status(200)
      .json({ success: true, message: "Password set up successfully." });
  } catch (error) {
    console.error("Error setting up password:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


controllers.updatePassword = async (req, res) => {
  const { password } = req.body;
  
  if (!validator.isStrongPassword(password)) {
    return res
      .status(400)
      .json({ success: false, message: "Password is not strong enough" });
  }
  try {
    console.log("req.user:", req.user.id);
    const userId = req.user.id;

    try{
      await spChangeUserPassword(userId, password);}
    catch (error) {
      if (error instanceof PasswordReuseError){
        console.error("Password reuse error:", error.message);
      
      return   res
      .status(400)
      .json({ success: false, message: "Password reuse detected." });
      }
    }

    const user = await sp_findUserById(userId);
    console.log("user:", user);
    await sendMail({
      to: user.email,
      subject: "Password Updated Successful",
      body: ` Dear ${user.name},
      
              Your password has been Updated successfully.
              
              Thank you,
                The Softinsa Team`,
    });
    await sp_updateLastAccess(userId);
    res
      .status(200)
      .json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

controllers.startRecoveryPassword = async (req, res) => {
  const { email } = req.body;
  try {
    user = await  findUserByEmail(email);
    if (user === null) {
      console.log("User not found");
      res.status(404).json({
        success: false,
        message: "Could not found corresponding account with that email.",
      });
    } else {
      console.log("User found:", user);
      const token = generateTokenAccountCreation_resetpasword(user.user_id);
      const stringtoken = JSON.stringify(token);
      //const random_sub_url = crypto.randomBytes(32).toString("hex");
      const url = `${process.env.CLIENT_URL}/change-password/?token=${encodeURIComponent(stringtoken)}`;
      console.log("url:", url);
      console.log("user:", user);

      await sendMail({
        to: email,
        subject: "SOFTINSA - Reset Your Password",
        body: `
          <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="text-align: center; color: #00c2ff;">Reset Your Password</h2>
           <p>Dear ${user.first_name} ${" "} ${user.last_name},</p>
            <p>We received a request to reset the password for your account. Please use the following link to reset your password:</p>
            <p style="text-align: center;">
              <a href="${url}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #00c2ff; text-decoration: none; border-radius: 5px;">Reset Password</a>
            </p>
            <p>If you are accessing this request via our mobile app, please copy and paste the following token when prompted:</p>
            <p style="text-align: center; font-size: 18px; font-weight: bold; color: #00c2ff;">
              ${stringtoken}
            </p>
            <p>If you did not request a password reset, please notify your administrator or supervisor immediately and forward this email to them for further investigation.</p>
            <p>Thank you,<br>The Softinsa Team</p>
          </div>
        `,
      });
      
      
      

      return res.status(201).json({
        success: true,
        message: "Password reset link sent. Please check your email.",
      });
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

controllers.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  
  if (!validator.isStrongPassword(password)) {
    return res
      .status(400)
      .json({ success: false, message: "Password is not strong enough" });
  }
  try {
    const decodedToken = decodeURIComponent(token);
    const tokenID = verifyToken(decodedToken);
    console.log('USER: '+ JSON.stringify(tokenID) );
 
    const userId = tokenID.id
    
    try{
      await spChangeUserPassword(userId, password);}
    catch (error) {
      if (error instanceof PasswordReuseError){
        return res
          .status(400)
          .json({ success: false, message: "Password reuse detected." });
    }}
    const user = await sp_findUserById(userId);
    console.log("user:", user);
    await sendMail({
      to: user.email,
      subject: "Password Reset Successful",
      body: ` Dear ${user.name},
      
              Your password has been reset .
              
              Thank you,
                The Softinsa Team`,
    });
    
    res
      .status(200)
      .json({ success: true, message: "Password reset successfull." });
  } catch (error) {
    console.error("Error trying to reset password:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


//check cookie
// app.get('/data', cookieParser(),  function(req, res) {
//   var csrf = req.get('CSRF');
//   var str = req.cookies['jwt'];
//   try {
//     let jwtPayload = jwt.verify(str, KEY);
//     let csrfPayload = jwt.verify(csrf, KEY);
//     if(jwtPayload["type"] != 'access')
//       throw "invalid jwt payload";
//     if(csrfPayload["type"] != 'csrf')
//       throw "invalid anti-CSRF token payload"
//     res.send("Very Secret Data");
//   } catch(e) {
//     console.error(e);
//     res.status(401);
//     res.send("Bad Token");
//   }

// });

const authenticateUser = async (email, password) => {
  const user = await sp_findUserByEmail(email);
  if (!user) {
    return { authenticated: false, message: "Invalid email or password" };
  }

  const validation = await sp_verifyUser(user.user_id);
  if (
    validation.account_status == false ||
    validation.account_restriction == true
  ) {
    return {
      authenticated: false,
      message: "Account is not active or restricted! Contact your admin!",
    };
  }

  const isMatch = await bcrypt.compare(password, user.hashed_password);
  if (!isMatch) {
    return { authenticated: false, message: "Invalid email or password" };
  }
  // logic to check if its an admin and if the user has never logged in once, cause if not, he must change its password
  var roleName = await getUserRole(user.user_id);
  //const role = roleName[0].role_name
  console.log(roleName);
  var neverLogged = await isLastAccessNull(user.user_id);
  console.log('user has logged?');
  console.log(neverLogged);
  if(!neverLogged && roleName=='CenterAdmin'){
    
    const token = generateTokenFor1stLog(user.user_id);
    console.log('encr ypted 1st token');
    const stringtoken = JSON.stringify(token);
    console.log(typeof stringtoken);
    const redirectUrl = `/api/auth/change-password?token=${encodeURIComponent(stringtoken)}`;
    console.log(`redirect url: ${redirectUrl}`);
    return {
      authenticated: true,
      redirect: redirectUrl, 
      user,
    };
  }
  //await updateAccessOnLogin(user.user_id);
  return { authenticated: true, user };
};

const handleResponseBasedOnRole = async (user, res) => {
  if (user.role_id != 1) {
    //const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, { expiresIn: "4h" });
    const token = generateToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);
    await sp_updateLastAccess(user.user_id);
    res.status(200).json({
      token,
      refreshToken,
      success: true,
      message: "Login successful",
    });
  } else {
    res.status(403).json({
      success: false,
      message: "Don't have permission to access! Contact your admin!",
    });
  }
};

controllers.login_web = async (req, res) => {
  const { email, password } = req.body;

  const validationResult = validateInput_Login(email, password);

  if (!validationResult.valid) {
    return res
      .status(400)
      .json({ success: false, message: validationResult.message });
  }

  try {
    const authResult = await authenticateUser(email, password);

    if (!authResult.authenticated) {
      return res
        .status(401)
        .json({ success: false, message: authResult.message });
    }
    if (authResult.redirect) {
      return res.status(302).json({ success: false, redirect: authResult.redirect });
    }

    await handleResponseBasedOnRole(authResult.user, res);
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

controllers.login_mobile = async (req, res) => {
  const { email, password } = req.body;
  const validationResult = validateInput_Login(email, password);

  if (!validationResult.valid) {
    return res
      .status(400)
      .json({ success: false, message: validationResult.message });
  }

  try {
    const authResult = await authenticateUser(email, password);

    if (!authResult.authenticated) {
      return res
        .status(401)
        .json({ success: false, message: authResult.message });
    }
    if (authResult.redirect) {
      return res.redirect(authResult.redirect);
    }

    const token = generateToken(authResult.user.user_id);
    const refreshToken = generateRefreshToken(authResult.user.user_id);
    await sp_updateLastAccess(authResult.user.user_id); //TODO check this
    res.status(200).json({
      token,
      refreshToken,
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* @DEPRECATED
controllers.login_google = async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("This is the decoded token");
    console.log(decodedToken);
    const email = decodedToken.email;
    const googleId = decodedToken.uid;

    // Check if the user exists in your database
    let user = await findUserByGoogleId(googleId);
    if (!user) {
      // If not, check by email to see if an account already exists
      user = await findUserByEmail(email);
      if (user) {
        // Merge accounts if found by email
        user.googleId = googleId;
        await updateUser(user);
      } else {
        // Otherwise, create a new user
        user = await createUser(decodedToken);
      }
    }
    console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
    console.log(user);
    const token = generateToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);
    await sp_updateLastAccess(user.user_id);
    res.status(200).json({
      token,
      refreshToken,
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
*/

controllers.login_SSO = async (req, res) => {
  const { idToken, provider } = req.body;
  console.log('inside login SSO');
  console.log(req.body);
  console.log(idToken);
  try {
    let decodedToken;
    
    // Verify the ID token based on the provider
    if (provider === "google") {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } else if (provider === "facebook") {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } else {
      return res.status(400).json({ success: false, message: "Invalid provider" });
    }
      console.log(decodedToken);
    const email = decodedToken.email;
    const ssoId = decodedToken.user_id;  // This can be googleId or facebookId based on the provider
    //exit(1);
    // Check if the user exists in your database
    let user = await findUserBySSOId(ssoId, provider);
    if (!user) {
      // If not, check by email to see if an account already exists
      user = await findUserByEmail(email);
      if (user) {
        // Merge accounts if found by email
        if (provider === "google") {
          user.googleId = ssoId;
          user.facebookId = '';
        } else if (provider === "facebook") {
          user.facebookId = ssoId;
          user.googleId = '';
        }
          await updateUser(user);
      } else {
        // Otherwise, create a new user
        user = await createUser(decodedToken, provider);
      }
    }

    const token = generateToken(user.user_id);
    const refreshToken = generateRefreshToken(user.user_id);
    await sp_updateLastAccess(user.user_id);

    res.status(200).json({
      token,
      refreshToken,
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// // Example implementation for verifying a Facebook token
// async function verifyFacebookToken(idToken) {
//   // Use Facebook's API to verify the token
//   const response = await fetch(`https://graph.facebook.com/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&grant_type=client_credentials`);
//   console.log(response);
//   const data = await response.json();

//   if (data && data.data && data.data.is_valid) {
//     console.log('INSIDE VERIFY FACEBOOK TOKEN');
//     console.log(data.data);
//     exit(-1);
//     return {
//       uid: data.data.user_id,
//       email: data.data.email, // You might need to get the email separately
//     };
//   } else {
//     throw new Error("Invalid Facebook token");
//   }
// }





controllers.getUserByToken = async (req, res) => {
  const user_id = req.user.id;

  try {
    const user = await sp_findUserById(user_id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error getting user by token:", error);
  }
};

controllers.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    //console.log("ionside refresh" + refreshToken);
    const decoded = verifyRefreshToken(JSON.parse(refreshToken));
    //console.log(decoded);
    const accessToken = generateToken(decoded.id);
    res.status(200).json({ accessToken, success: true });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("validation error:", error);
      return res.status(401).json({ message: "refresh token expired" });
    }
    console.error("Error refreshing token:", error);
  }
};

//firebase
controllers.updateFcmToken = async (req, res) => {
  const { userId, fcmToken } = req.body;
  console.log(req.body);
  try {
    const result = await db.sequelize.query(
      `UPDATE "hr"."users"
       SET "fcmToken" = :fcmToken
       WHERE "user_id" = :userId`,
      {
        replacements: { fcmToken, userId },
        type: QueryTypes.UPDATE,
      }
    );

    if (result[1] === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found or token unchanged" });
    }

    res
      .status(200)
      .json({ success: true, message: "FCM token updated successfully" });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = controllers;
