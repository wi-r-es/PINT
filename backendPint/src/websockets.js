const http = require("http");
const { Server } = require("socket.io");
const { verifyToken } = require("../src/utils/tokenUtils");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Update this to your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: [
      "Authorization",
      "X-API-KEY",
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Access-Control-Allow-Request-Method",
    ],
    credentials: true,
  },
});

// const userSocket = {}; //ter id e socket user

io.on("connection", (socket) => {
  console.log("New client connected");
  console.log(socket.handshake.headers);
  console.log(socket.handshake.headers.authorization);
  const authHeader = socket.handshake.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>
  console.log("inside token: " + token);

  if (!token) {
    socket.disconnect();
  }

  console.log("Token received:", JSON.parse(token));
  const encryptedToken = JSON.parse(token);
  const user = verifyToken(encryptedToken);
  console.log("USER: " + JSON.stringify(user));

  if (user == null) {
    socket.disconnect();
  }
  socket.join(`user-${user.id}`);
  socket.emit("message", { message: "Welcome to the chat" });
  // if (userSocket[user.id]===undefined){ //guardar todas as sockets que o utilizador esta a usar
  //     userSocket[user.id] = [socket];
  // }
  // else{
  //     userSocket[user.id].push(socket);//guardar todas as sockets que o utilizador esta a usar
  // }

  // userSocket[user.id] = socket;

  socket.on("SubscribePost", ({ post_id }) => {
    socket.join(`post-${post_id}`);
    console.log(`Client joined room: post-${post_id}`);
  });
  socket.on("SubscribeForum", ({ forum_id }) => {
    socket.join(`forum-${forum_id}`);
    console.log(`Client joined room: forum-${forum_id}`);
  });

  socket.on("unSubscribePost", ({ post_id }) => {
    socket.leave(`post-${post_id}`);
    console.log(`Client left room: post-${post_id}`);
  });
  socket.on("unSubscribeForum", ({ forum_id }) => {
    socket.leave(`forum-${forum_id}`);
    console.log(`Client left room: forum-${forum_id}`);
  });

  socket.on("disconnect", () => {
    //called on each socket
    // var ind = userSocket[user.id].indexOf(socket);
    // userSocket[user.id].splice(ind, 1);
    console.log("Client disconnected");
  });
});
const sendCommentforumNotif = (comment, id) => {
    console.log('sendCommentpostNotif');
    console.log(comment);
  io.to(`forum-${comment.forum_id}`).emit("newComment", comment);
};
const sendCommentpostNotif = (comment,id) => {
    console.log('sendCommentpostNotif');
  io.to(`post-${comment.post_id}`).emit("newComment", comment);
};
const sendUserNotif = (user_id, notification) => {
  io.to(`user-${user_id}`).emit("notification", notification);

  // console.log('sendUserNotif: ' + user_id);
  // var sockets = userSocket[user_id];
  // if (sockets==null){
  //     console.log('sendUserNotif: sockets == null');
  //     return;
  // }
  // for (var i = 0; i < sockets.length; i++) {
  //     sockets[i].emit('notification', notification);
  // }
};

module.exports = { server, sendUserNotif, sendCommentforumNotif, sendCommentpostNotif };
