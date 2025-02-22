const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const db = require("./databases/database.js");
const userRoute = require("./routes/userRoute");
const sessionRoute = require("./routes/sessionRoute");
const chainesRoute = require("./routes/chainesRoute");
const productsRoute = require("./routes/productsRoute");
const demandesRoute = require("./routes/demandesRoute");
const conversationRoute = require("./routes/conversationRoute");
// const messagesRoute = require("./routes/messagesRoute");
const multer = require("multer");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const socketconnexion = new Map();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
// Middleware pour les cookies
app.use(cookieParser());

// Middleware pour autoriser les requêtes CORS
app.use(
  cors({
    // origin: ["http://localhost:5173", "http://localhost:63583"],
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
app.use("/api", productsRoute);
app.use("/api", demandesRoute);
app.use("/api", conversationRoute);
// app.use("/api", messagesRoute);
// server.listen(3000, () => console.log("serveur lancé 3000"));

async function saveMessage(sender, receiver, content) {
  let conn;
  try {
    conn = await db.pool.getConnection();
    await conn.query(
      "INSERT INTO messages (mes_uti_envoyeur_id,mes_uti_receveur_id, mes_texte, mes_date ) VALUES (?, ?, ?, CURRENT_TIMESTAMP)",
      [sender, receiver, content]
    );
    const lastId = await conn.query(
      "SELECT mes_id, mes_date from messages where mes_uti_envoyeur_id = ? and mes_uti_receveur_id = ? and mes_texte = ? order by mes_date desc LIMIT 1",
      [sender, receiver, content]
    );
    console.log(lastId);
    await conn.query(
      "UPDATE conversations set con_last_mes_id = ? where (con_uti_id_1 = ? AND con_uti_id_2 = ?) OR (con_uti_id_1 = ? AND con_uti_id_2 = ?) AND con_closed = 0;",
      [lastId[0].mes_id, sender, receiver, receiver, sender]
    );
  } catch (err) {
    console.error("Erreur lors de la sauvegarde:", err);
  } finally {
    if (conn) conn.release();
  }
}

// Fonction pour récupérer les messages entre deux utilisateurs
async function getMessages(user1, user2) {
  let conn;
  try {
    conn = await db.pool.getConnection();
    return await conn.query(
      "SELECT mes_uti_envoyeur_id as senderId,mes_uti_receveur_id as receiverId, mes_texte as content, mes_date as created_at FROM messages WHERE (mes_uti_envoyeur_id = ? AND mes_uti_receveur_id = ?) OR (mes_uti_envoyeur_id = ? AND mes_uti_receveur_id = ?) ORDER BY created_at ASC",
      [user1, user2, user2, user1]
    );
  } catch (err) {
    console.error("Erreur lors de la récupération:", err);
    return [];
  } finally {
    if (conn) conn.release();
  }
}

wss.on("connection", (ws, req) => {
  console.log("oui");
  ws.on("message", async (message) => {
    const data = JSON.parse(message);
    if (data.type === "register") {
      // Associer l'utilisateur à sa connexion WebSocket
      socketconnexion.set(data.senderId, ws);
      console.log(`${data.senderId} connecté`);
    } else if (data.type === "message") {
      const { senderId, receiverId, content } = data;
      await saveMessage(senderId, receiverId, content);

      // Envoyer le message uniquement au destinataire
      if (socketconnexion.has(receiverId)) {
        socketconnexion
          .get(receiverId)
          .send(
            JSON.stringify({ type: "message", senderId, receiverId, content })
          );
        console.log("envoyé au gars");
      }
      // Envoyer une confirmation à l'expéditeur
      if (socketconnexion.has(senderId)) {
        socketconnexion
          .get(senderId)
          .send(
            JSON.stringify({ type: "sent", senderId, receiverId, content })
          );
        console.log("confirmation de l'envoie");
      }
    } else if (data.type === "history") {
      // Récupérer les messages entre les deux utilisateurs
      const messages = await getMessages(data.senderId, data.receiverId);
      ws.send(JSON.stringify({ type: "history", history: messages }));
    }
  });

  ws.on("close", () => {
    // Supprimer l'utilisateur lorsqu'il se déconnecte
    for (const [username, socket] of socketconnexion.entries()) {
      if (socket === ws) {
        socketconnexion.delete(username);
        console.log(`${username} déconnecté`);
        break;
      }
    }
  });
});

server.listen(5000, () => {
  console.log("listening on port 5000");
});

module.exports = {
  webSocketMap: socketconnexion,
  wss: wss,
};
