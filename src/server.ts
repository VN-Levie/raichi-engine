import express from "express";
import { fileURLToPath } from "url"
import path from "path"
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../dist")));

let hasReloaded = false;

wss.on("connection", (ws) => {
  console.log("Client connected!");
  if (!hasReloaded) {
    hasReloaded = true;
    setTimeout(() => {
      for (const client of wss.clients) {
        if (client.readyState === 1) client.send("reload");
      }
    }, 100);
  }
});



server.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
