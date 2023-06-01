const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

const rooms = [];

app.get("/rooms", (req, res) => {
  res.json(rooms);
});

// app.post("/rooms", (req, res) => {
//   const { name } = req.body;
//   const roomId = generateRoomId();
//   const newRoom = {
//     roomId,
//     name,
//     users: [],
//   };
//   rooms.push(newRoom);
//   res.json(newRoom);
// });

io.on("connection", (socket) => {
  socket.on("createRoom", (data) => {
    console.log("Hello");
    const roomId = generateRoomId();
    const { userName, roomName } = data;
    let user = [];
    user.push(userName);
    let newRoom = {
      roomID: roomId,
      roomName: roomName,
      users: user,
    };
    rooms.push(newRoom);
    socket.join(roomName);
    console.log(rooms);
  });

  socket.on("joinRoom", (data) => {
    const { roomId, username } = data;
    console.log(roomId, username);
    console.log(rooms);
    const room = rooms.find((room) => room.roomID === roomId);
    console.log(room);
    if (room) {
      room.users.push(username);
      socket.join(roomId);
      // io.to(roomId).emit("activeUsers", getActiveUsers(roomId));
      socket.emit("roomJoined", room);
    }
    console.log(room);
  });

  socket.on("sendMessage", (data) => {
    socket.emit("recievedMessage", data);
    // const { roomId, username, message } = data;
    // const room = rooms.find((room) => room.roomId === roomId);
    // if (room) {
    //   const newMessage = {
    //     username,
    //     message,
    //   };
    //   io.to(roomId).emit("message", newMessage);
    // }
  });

  socket.on("disconnect", () => {
    console.log("User Discoonected");
  });
});

function generateRoomId() {
  let roomId = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    roomId += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return roomId;
}

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
