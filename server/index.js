require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

app.use(cors());

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Serve React build in production
const clientBuild = path.join(__dirname, "..", "client", "build");
app.use(express.static(clientBuild));
app.get("*", (req, res, next) => {
  if (req.url.startsWith("/socket.io")) return next();
  res.sendFile(path.join(clientBuild, "index.html"));
});

// In-memory store: socketId -> { lat, lng } | null
const users = new Map();

function broadcastUsers() {
  const payload = {};
  for (const [id, coords] of users) {
    payload[id] = coords;
  }
  io.emit("users-updated", payload);
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  users.set(socket.id, null);
  broadcastUsers();

  socket.on("update-location", ({ lat, lng }) => {
    if (typeof lat === "number" && typeof lng === "number") {
      users.set(socket.id, { lat, lng });
      broadcastUsers();
    }
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    users.delete(socket.id);
    broadcastUsers();
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
