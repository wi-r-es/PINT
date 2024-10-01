const jwt = require("jsonwebtoken");
const { verifyToken } = require("../utils/tokenUtils");
const { getUserRole } = require("../database/logic_objects/usersProcedures");
const controllers = {};

controllers.validation = async (req, res, next) => {
  //console.log('req.headers:', JSON.stringify(req.headers, null, 2));
  // console.log('req.query:', JSON.stringify(req.query, null, 2));
  // console.log('req.body:', JSON.stringify(req.body, null, 2));
  try{
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  //console.log('inside token: ' + token);
 
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

  req.user = user;
  next();}
  catch (error ){
    if(error instanceof jwt.TokenExpiredError){
      console.error("validation error:", error);
      return res.status(401).json({ message: "token expired"  });
    }
    if(error instanceof jwt.JsonWebTokenError){
      console.error("token error error:", error);
    return res.status(401).json({message: "Token error"});
    }
    console.error("internal error:", error);
    return res.status(500).json({message: "Internal server error"});
  }
};


controllers.validation_admins = async (req, res, next) => {
  //console.log('req.headers:', JSON.stringify(req.headers, null, 2));
  // console.log('req.query:', JSON.stringify(req.query, null, 2));
  // console.log('req.body:', JSON.stringify(req.body, null, 2));
  try{
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  //console.log('inside token: ' + token);
 
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  console.log('Token received:', JSON.parse(token));
  const encryptedToken = JSON.parse(token); // Ensure token is parsed if sent as a stringified object
  const user = verifyToken(encryptedToken);
  console.log("TESTEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEe")
  console.log('USER: '+ JSON.stringify(user) );

  if (user == null) {
    return res.status(403).json({ message: "Invalid token" });
  }
  const user_role = await getUserRole(user.id);
  if ( user_role != 'ServerAdmin' && user_role != 'CenterAdmin' ){

    return res
      .status(403) 
      .json({ success: false});
  }
  req.user = user;
  next();}
  catch (error ){
    if(error instanceof jwt.TokenExpiredError){
      console.error("validation error:", error);
      return res.status(401).json({ message: "token expired"  });
    }
    if(error instanceof jwt.JsonWebTokenError){
      console.error("token error error:", error);
    return res.status(401).json({message: "Token error"});
    }
    console.error("internal error:", error);
    return res.status(500).json({message: "Internal server error"});
  }
};
controllers.validation_server_admin = async (req, res, next) => {
  //console.log('req.headers:', JSON.stringify(req.headers, null, 2));
  // console.log('req.query:', JSON.stringify(req.query, null, 2));
  // console.log('req.body:', JSON.stringify(req.body, null, 2));
  try{
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  //console.log('inside token: ' + token);
 
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
  const user_role = await getUserRole(user.id);
  if ( user_role != 'ServerAdmin' ){
    return res
      .status(403) 
      .json({ success: false});
  }
  req.user = user;
  next();}
  catch (error ){
    if(error instanceof jwt.TokenExpiredError){
      console.error("validation error:", error);
      return res.status(401).json({ message: "token expired"  });
    }
    if(error instanceof jwt.JsonWebTokenError){
      console.error("token error error:", error);
    return res.status(401).json({message: "Token error"});
    }
    console.error("internal error:", error);
    return res.status(500).json({message: "Internal server error"});
  }
};



controllers.validation_noenc = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if(err) return res.sendStatus(403);
      req.user = user;    
      next();
  });
};

module.exports = controllers;
