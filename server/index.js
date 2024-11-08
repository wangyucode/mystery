import { Server } from "socket.io";
import Koa from "koa";
import { createServer } from "http";

let count = {user: 0, ai: 0, room: 0};


const app = new Koa();
const httpServer = createServer(app.callback());
const io = new Server(httpServer, {
  serveClient: false,
  connectionStateRecovery: {
    maxDisconnectionDuration:  4 * 3600 * 1000
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
});

io.listen(3001);

console.log("server listening on port 3001");