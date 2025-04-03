const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http"); // Import HTTP pour le WebSocket
const { Server } = require("socket.io");

const userRoute = require("./routes/userRoute");
const sessionRoute = require("./routes/sessionRoute");
const chainesRoute = require("./routes/chainesRoute");

const app = express();
const server = http.createServer(app); // Création du serveur HTTP

// Configuration de Socket.io
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:58055"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

// Middleware pour les cookies
app.use(cookieParser());

// Middleware pour autoriser les requêtes CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://172.17.21.2:42774", "http://localhost:61589"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api", userRoute);
app.use("/api", sessionRoute);
app.use("/api", chainesRoute);

// Gestion des connexions WebSocket
io.on("connection", (socket) => {
  console.log("✅ Un utilisateur s'est connecté au chat");

  socket.on("message", (data) => {
    console.log("📩 Message reçu :", data);
    io.emit("message", data); // Diffusion à tous les utilisateurs connectés
  });

  socket.on("disconnect", () => {
    console.log("❌ Un utilisateur s'est déconnecté");
  });
});

// Lancement du serveur
server.listen(5000, () => {
  console.log("🚀 Serveur en écoute sur le port 5000");
});
