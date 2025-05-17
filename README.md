# 🕹️ raichi-engine

**raichi-engine** is a lightweight 2D game engine written in TypeScript, built from scratch for educational and experimental purposes.  
Inspired by classic game engines like Cocos and Love2D, with a strong focus on clarity, modularity, and full control.

---

## 🚀 Features

- Custom game loop with `deltaTime` handling
- Component-based architecture
- Scene management system
- Keyboard input handler
- Simple animator/tweening system
- WebSocket-based live reload (no Vite/Webpack)
- Express dev server + TypeScript build system
- Clean structure for separation of engine and game

---

## 📁 Project Structure

```bash

dev-engine/
├── src/             # TypeScript source
│   └── main.ts      # Game entry point
├── dist/            # Compiled JS
├── public/          # index.html + assets
├── server.ts        # Express + WebSocket dev server
├── package.json
├── tsconfig.json
└── .gitignore

````

---

## 🧑‍💻 Development Setup

```bash
# Install dependencies
npm install

# Start dev mode (auto build + auto restart + live reload)
npm run dev
````

Visit [http://localhost:3000](http://localhost:3000) to view the game.

---

## 📦 Scripts

| Command         | Description                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Dev mode: build + nodemon + reload |
| `npm run watch` | Only watch TypeScript              |
| `npm start`     | Run server only (no auto build)    |

---

## 📜 License

MIT – for learning, experimenting, and having fun.
