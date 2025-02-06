const db = require("../databases/database.js");
const jwt = require("jsonwebtoken");

exports.getDemandes = async (req, res) => {
  let conn;
  try {
    conn = await db.pool.getConnection();
    const query = await conn.query(
      "SELECT * FROM demandes WHERE dem_uti_id = ?",
      [req.body.uti_id]
    );
    res.status(200).json(query);
  } catch (err) {
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.addDemande = async (req, res) => {
  let conn;
  try {
    conn = await db.pool.getConnection();
    const query = await conn.query(
      "INSERT INTO demandes (dem_uti_id, dem_pro_id, dem_msg) VALUES (?, ?, ?)",
      [req.body.uti_id, req.body.pro_id, req.body.msg]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};
