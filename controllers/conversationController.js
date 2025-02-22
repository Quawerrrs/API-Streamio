const db = require("../databases/database.js");
const jwt = require("jsonwebtoken");

exports.getConversations = async (req, res) => {
  let conn;
  const uti_id = req.params.id;

  try {
    conn = await db.pool.getConnection();
    const convsNotStarted = await conn.query(
      "SELECT * from conversations where (con_uti_id_1 = ? or con_uti_id_2 = ?) AND con_closed = 0 AND con_last_mes_id = 0 ;",
      [uti_id, uti_id]
    );
    var result = [];
    convsNotStarted.forEach((conv) => {
      if (conv.con_uti_id_1 == uti_id) {
        result.push({
          con_id: conv.con_id,
          receiverId: conv.con_uti_id_2,
          receiverName: conv.con_uti_nom_2,
          senderId: conv.con_uti_id_1,
          senderName: conv.con_uti_nom_1,
        });
      } else {
        result.push({
          con_id: conv.con_id,
          receiverId: conv.con_uti_id_1,
          receiverName: conv.con_uti_nom_1,
          senderId: conv.con_uti_id_2,
          senderName: conv.con_uti_nom_2,
        });
      }
    });

    const convStarted = await conn.query(
      "SELECT con_id,con_uti_id_1,con_uti_id_2,con_uti_nom_1,con_uti_nom_2,mes_texte as lastMessage,mes_date as lastMessageTime from conversations inner join messages on con_last_mes_id = mes_id where (con_uti_id_1 = ? or con_uti_id_2 = ?) AND con_closed = 0 AND con_last_mes_id > 0 ;",
      [uti_id, uti_id]
    );
    convStarted.forEach((conv) => {
      if (conv.con_uti_id_1 == uti_id) {
        result.push({
          con_id: conv.con_id,
          receiverId: conv.con_uti_id_2,
          receiverName: conv.con_uti_nom_2,
          senderId: conv.con_uti_id_1,
          senderName: conv.con_uti_nom_1,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
        });
      } else {
        result.push({
          con_id: conv.con_id,
          receiverId: conv.con_uti_id_1,
          receiverName: conv.con_uti_nom_1,
          senderId: conv.con_uti_id_2,
          senderName: conv.con_uti_nom_2,
          lastMessage: conv.lastMessage,
          lastMessageTime: conv.lastMessageTime,
        });
      }
    });
    res.status(200).json(result);
  } catch (ex) {
    console.log(ex);
    res.status(500).json({ error: "server Error" });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};
