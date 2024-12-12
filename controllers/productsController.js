const db = require("../databases/database.js");
const fs = require("fs");
const jwt = require("jsonwebtoken");

exports.getProducts = async (req, res) => {
  let conn;
  const uti_id = req.body.uti_id;
  try {
    conn = await db.pool.getConnection();
    const query = await conn.query(
      "SELECT * FROM produits where pro_uti_id = ?",
      [uti_id]
    );
    res.status(200).json({ success: true, products: query });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.deleteProduct = async (req, res) => {
  const pro_id = req.params.id;
  let conn;
  try {
    conn = await db.pool.getConnection();
    const imgPath = await conn.query(
      "SELECT pro_img FROM produits WHERE pro_id = ?",
      [pro_id]
    );
    fs.unlinkSync("../Front-React/front" + imgPath[0].pro_img);
    const demandes = await conn.query(
      "Select count(*) from demandes where dem_pro_id = ?",
      [pro_id]
    );
    if (demandes[0]["count(*)"] > 0) {
      res
        .status(500)
        .json({
          success: false,
          message: "Demande en cours existante avec ce produit",
        });
      return;
    }
    await conn.query("DELETE from produits WHERE pro_id = ?", [pro_id]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.addProduct = async (req, res) => {
  var token = req.cookies.token;
  if (jwt.verify(token, process.env.JWT_KEY)) {
    const fileName = req.params.file;
    var pro_uti_id = jwt.decode(token).id;
    const { nom, prix } = req.body;
    console.log(nom, prix);
    let conn;
    try {
      conn = await db.pool.getConnection();
      const query = await conn.query(
        "INSERT INTO produits (pro_nom, pro_uti_id, pro_prix, pro_img) VALUES (?, ?, ?, ?)",
        [nom, pro_uti_id, prix, fileName]
      );
      res.status(200).json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }
};
