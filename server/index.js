import { Server } from "socket.io";
import Koa from "koa";
import { createServer } from "http";

import * as handlers from "./handlers.js";
let count = { user: 0, ai: 0, room: 0 };


const app = new Koa();
const httpServer = createServer(app.callback());
const io = new Server(httpServer, {
  serveClient: false,
  connectionStateRecovery: {
    maxDisconnectionDuration: 4 * 3600 * 1000
  }
});

io.on("connection", (socket) => {
  console.log("user connected->", socket.id);
  count.user++;
  io.emit("count", count);
  socket.on("disconnect", (reason) => {
    console.log("user disconnected->", socket.id, reason);
    count.user--;
    io.emit("count", count);
  });
  socket.on("room:create", (title) => {
    console.log("create->", title);
    handlers.create(title, socket, io);
    count.room++;
    io.emit("count", count);
  });
  socket.on("room:join", (id) => {
    console.log("join->", id);
    handlers.join(id, socket, io);
  });
  socket.on("room:leave", (id) => {
    console.log("leave->", id);
    if (handlers.leave(id, socket, io)) {
      count.room--;
      io.emit("count", count);
    }
  });
  socket.on("room:rejoin", (data) => {
    console.log("rejoin->", data);
    handlers.rejoin(data, socket, io);
  });
  socket.on("room:role", (data) => {
    console.log("role->", data);
    handlers.role(data, socket, io);
  });
  socket.on("room:message", (data) => {
    console.log("message->", data);
    handlers.message(data, socket, io);
  });
  socket.on("story:list", () => {
    console.log("story:list->");
    handlers.stroyList(socket);
  });
});

io.listen(3001);

console.log("server listening on port 3001");
