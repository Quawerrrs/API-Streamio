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
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Allow localhost in different forms
      if (
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1") ||
        /^http:\/\/192\.168\./.test(origin) ||
        /^http:\/\/10\./.test(origin) ||
        /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\./.test(origin)
      ) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
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
    // console.log(lastId);
    await conn.query(
      "UPDATE conversations set con_last_mes_id = ? where (con_uti_id_1 = ? AND con_uti_id_2 = ?) OR (con_uti_id_1 = ? AND con_uti_id_2 = ?) AND con_closed = 0;",
      [lastId[0].mes_id, sender, receiver, receiver, sender]
    );
    return lastId[0].mes_id;
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
      "SELECT mes_id as messageId, mes_uti_envoyeur_id as senderId,mes_uti_receveur_id as receiverId, mes_texte as content, mes_date as created_at, mes_deleted as deleted FROM messages WHERE (mes_uti_envoyeur_id = ? AND mes_uti_receveur_id = ?) OR (mes_uti_envoyeur_id = ? AND mes_uti_receveur_id = ?) ORDER BY created_at ASC",
      [user1, user2, user2, user1]
    );
  } catch (err) {
    console.error("Erreur lors de la récupération:", err);
    return [];
  } finally {
    if (conn) conn.release();
  }
}
async function modifMessage(messageId, content, deleteMessage = false) {
  let conn;
  console.log(messageId, content);

  try {
    conn = await db.pool.getConnection();
    if (!deleteMessage) {
      await conn.query("UPDATE messages SET mes_texte = ? WHERE mes_id = ?", [
        content,
        messageId,
      ]);
    } else {
      await conn.query("UPDATE messages SET mes_deleted = 1 where mes_id = ?", [
        messageId,
      ]);
    }
  } catch (err) {
    console.error("Erreur lors de la mise à jour:", err);
  } finally {
    if (conn) conn.release();
  }
}

async function deleteConv(receiverId, senderId) {
  let conn;
  try {
    conn = await db.pool.getConnection();
    await conn.query(
      "UPDATE conversations set con_closed = 1 where (con_uti_id_1 = ? and con_uti_id_2 = ?) or (con_uti_id_1 = ? and con_uti_id_2 = ?)",
      [receiverId, senderId, senderId, receiverId]
    );
  } catch (err) {
    console.error(err);
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
      // console.log(`${data.senderId} connecté`);
    } else if (data.type === "message") {
      const { senderId, receiverId, content } = data;
      const lastId = await saveMessage(senderId, receiverId, content);

      // Envoyer le message uniquement au destinataire
      if (socketconnexion.has(receiverId)) {
        socketconnexion.get(receiverId).send(
          JSON.stringify({
            type: "message",
            senderId,
            receiverId,
            content,
            deleted: false,
            messageId: lastId,
          })
        );
        console.log("envoyé au gars");
      }
      // Envoyer une confirmation à l'expéditeur
      if (socketconnexion.has(senderId)) {
        socketconnexion.get(senderId).send(
          JSON.stringify({
            type: "sent",
            senderId,
            receiverId,
            content,
            deleted: false,
            messageId: lastId,
          })
        );
        console.log("confirmation de l'envoie");
      }
    } else if (data.type === "history") {
      // Récupérer les messages entre les deux utilisateurs
      const messages = await getMessages(data.senderId, data.receiverId);
      // messages.forEach((unmessage) => {
      //   if (unmessage["deleted"] == 0) {
      //     unmessage["deleted"] == false;
      //   } else {
      //     unmessage["deleted"] = true;
      //   }
      // });
      ws.send(JSON.stringify({ type: "history", history: messages }));
    } else if (data.type === "typing_start" || data.type === "typing_end") {
      const { senderId, receiverId, content } = data;
      if (socketconnexion.has(receiverId)) {
        socketconnexion
          .get(receiverId)
          .send(
            JSON.stringify({ type: data.type, senderId, receiverId, content })
          );
      }
    } else if (data.type === "modifMessage" || data.type === "deleteMessage") {
      console.log(data);

      const { senderId, receiverId, content, messageId } = data;
      let deleted = false;
      if (data.type === "deleteMessage") deleted = true;
      await modifMessage(messageId, content, deleted);

      // Envoyer le message uniquement au destinataire
      if (socketconnexion.has(receiverId)) {
        socketconnexion.get(receiverId).send(
          JSON.stringify({
            type: data.type,
            senderId,
            receiverId,
            content,
            deleted,
            messageId: messageId,
          })
        );
        console.log("envoyé au gars");
      }
      // Envoyer une confirmation à l'expéditeur
      if (socketconnexion.has(senderId)) {
        socketconnexion.get(senderId).send(
          JSON.stringify({
            type: data.type,
            senderId,
            receiverId,
            content,
            deleted,
            messageId: messageId,
          })
        );
        console.log("confirmation de l'envoie");
      }
    } else if (data.type === "deleteConversation") {
      console.log(data);

      const { senderId, receiverId, content } = data;
      // await deleteConv(receiverId, senderId);

      if (socketconnexion.has(receiverId)) {
        socketconnexion.get(receiverId).send(
          JSON.stringify({
            type: data.type,
            senderId,
            receiverId,
            content,
          })
        );
        console.log("envoyé au gars");
      }
      // Envoyer une confirmation à l'expéditeur
      if (socketconnexion.has(senderId)) {
        socketconnexion.get(senderId).send(
          JSON.stringify({
            type: data.type,
            senderId,
            receiverId,
            content,
          })
        );
        console.log("confirmation de l'envoie");
      }
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
