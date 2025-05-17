import express from "express";
import path from "path";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3000;

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../dist")));

wss.on("connection", (ws) => {
  console.log("Client connected");
  setTimeout(() => {
    if (ws.readyState === 1) ws.send("reload");
  }, 100);
});

server.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
