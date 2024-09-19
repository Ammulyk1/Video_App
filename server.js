const express = require("express");
const app = express();
const server = require("http").Server(app);
// Importing uuidv4 to generate  uuids.
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});
//middleware for integrating Peer with an Express server
const { ExpressPeerServer } = require("peer");
const opinions = {
  debug: true,
};

app.use("/peerjs", ExpressPeerServer(server, opinions));
app.use(express.static("public"));
//creating room id
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});
//estabishing a new connection b/w server and cient(persistent)
io.on("connection", (socket) => {
  //creates individual ids automatically by the server
  socket.on("join-room", (roomId, userId, userName) => {
    console.log("User joined room:", roomId);
 // user joins the room
    socket.join(roomId);
   // notify others in the room that a new user has connected
    setTimeout(() => {
      socket.broadcast.to(roomId).emit("user-connected", userId);
    }, 1000);
  });
});

server.listen(process.env.PORT || 3030, () => {
  console.log("Server running on port 3030");
});
