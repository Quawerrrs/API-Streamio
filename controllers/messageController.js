// const db = require("../databases/database.js");
// const jwt = require("jsonwebtoken");
// const server = require("../server.js");
// const { WebSocket } = require("ws");
// const webSocketMap = server.webSocketMap;
// const wss = server.wss;
// // Fonction pour sauvegarder un message
// exports.getMessages = async (req, res) => {
//   let conn;
//   const { user1, user2, con_id } = req.body;
//   try {
//     conn = await db.pool.getConnection();
//     const query = await conn.query(
//       "SELECT mes_uti_envoyeur as sender,mes_uti_receveur as receiver, mes_texte as content, mes_date as created_at FROM messages WHERE (mes_uti_envoyeur = ? AND mes_uti_receveur = ?) OR (mes_uti_envoyeur = ? AND mes_uti_receveur = ?) ORDER BY created_at ASC",
//       [user1, user2, user2, user1]
//     );
//     if (webSocketMap.has(con_id)) {
//       var ws = webSocketMap.get(con_id);
//       ws.send(JSON.stringify(query));
//     } else {
//       var ws = new WebSocket("ws://10.0.0.183:3000");
//       webSocketMap.set(con_id, ws);
//     }
//     res.status(200).json(query);
//   } catch (err) {
//     console.error("Erreur lors de la récupération:", err);
//   } finally {
//     if (conn) conn.release();
//   }
// };
// // exports.sendMessage = async (req, res) => {};
