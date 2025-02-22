// const server = require("../server.js");
// const webSocketMap = server.webSocketMap;
// const wss = server.wss;

async function saveMessage(sender, receiver, content) {
  let conn;
  try {
    conn = await db.pool.getConnection();
    await conn.query(
      "INSERT INTO messages (mes_uti_envoyeur as sender,mes_uti_receveur as receiver, mes_texte as content) VALUES (?, ?, ?)",
      [sender, receiver, content]
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
      "SELECT mes_uti_envoyeur as sender,mes_uti_receveur as receiver, mes_texte as content, mes_date as created_at FROM messages WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?) ORDER BY created_at ASC",
      [user1, user2, user2, user1]
    );
  } catch (err) {
    console.error("Erreur lors de la récupération:", err);
    return [];
  } finally {
    if (conn) conn.release();
  }
}

// Gérer les connexions WebSocket
// wss.on("connection", (ws, req) => {
//   console.log("oui");

//   ws.on("message", async (message) => {
//     const data = JSON.parse(message);
//     console.log(data);

//     if (data.type === "register") {
//       // Associer l'utilisateur à sa connexion WebSocket
//       webSocketMap.set(data.username, ws);
//       console.log(`${data.username} connecté`);
//     } else if (data.type === "message") {
//       const { sender, receiver, content } = data;
//       await saveMessage(sender, receiver, content);

//       // Envoyer le message uniquement au destinataire
//       if (webSocketMap.has(receiver)) {
//         webSocketMap
//           .get(receiver)
//           .send(JSON.stringify({ type: "message", sender, content }));
//       }

//       // Envoyer une confirmation à l'expéditeur
//       if (webSocketMap.has(sender)) {
//         webSocketMap
//           .get(sender)
//           .send(JSON.stringify({ type: "sent", receiver, content }));
//       }
//     } else if (data.type === "history") {
//       // Récupérer les messages entre les deux utilisateurs
//       const messages = await getMessages(data.user1, data.user2);
//       ws.send(JSON.stringify({ type: "history", messages }));
//     }
//   });

//   ws.on("close", () => {
//     // Supprimer l'utilisateur lorsqu'il se déconnecte
//     for (const [username, socket] of webSocketMap.entries()) {
//       if (socket === ws) {
//         webSocketMap.delete(username);
//         console.log(`${username} déconnecté`);
//         break;
//       }
//     }
//   });
// });
