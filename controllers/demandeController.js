const db = require("../databases/database.js");
const jwt = require("jsonwebtoken");

exports.getDemandesEntreprise = async (req, res) => {
  let conn;
  var uti_id = 0;
  if (
    req.cookies.token != null &&
    req.cookies.token != undefined &&
    jwt.verify(req.cookies.token, process.env.JWT_KEY)
  ) {
    uti_id = jwt.decode(req.cookies.token).id;
  } else {
    res.status(500).json({ success: false, message: "token Invalide" });
  }
  try {
    conn = await db.pool.getConnection();
    const query = await conn.query(
      "SELECT dem_id, dem_refus, dem_description, dem_prix, cha_name, pro_nom FROM demandes inner join produits on dem_pro_id = pro_id inner join chaines on dem_chaine_id = cha_id WHERE dem_ent_uti_id = ? AND dem_valide = 0",
      [uti_id]
    );
    res.status(200).json(query);
  } catch (err) {
  } finally {
    if (conn) {
      conn.release();
    }
  }
};
exports.getDemandesCreateur = async (req, res) => {
  let conn;
  var uti_id = 0;
  if (
    req.cookies.token != null &&
    req.cookies.token != undefined &&
    jwt.verify(req.cookies.token, process.env.JWT_KEY)
  ) {
    uti_id = jwt.decode(req.cookies.token).id;
  } else {
    res.status(500).json({ success: false, message: "token Invalide" });
  }
  try {
    conn = await db.pool.getConnection();
    const chaines = await conn.query(
      "SELECT cha_id FROM chaines WHERE cha_uti_id = ?",
      [uti_id]
    );
    var demandes = [];
    for (let i = 0; i < chaines.length; i++) {
      var query = await conn.query(
        "SELECT dem_id, dem_date_limite, dem_description, dem_prix, cha_name, ent_nom, pro_nom FROM demandes inner join produits on dem_pro_id = pro_id inner join chaines on dem_chaine_id = cha_id inner join entreprises on dem_ent_uti_id = ent_uti_id WHERE dem_chaine_id = ? AND dem_valide = 0 AND dem_refus = 0 order by dem_date_limite",
        [chaines[i].cha_id]
      );
      demandes.push(query);
    }
    res.status(200).json(demandes);
  } catch (err) {
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.addDemande = async (req, res) => {
  let conn;
  const { pro_id, msg, prix, cha_id, nbJours } = req.body;
  var uti_id = 0;
  var dateButoire = new Date();
  dateButoire.setDate(dateButoire.getDate() + nbJours);
  console.log(dateButoire);
  res.status(200);
  if (
    req.cookies.token != null &&
    req.cookies.token != undefined &&
    jwt.verify(req.cookies.token, process.env.JWT_KEY)
  ) {
    uti_id = jwt.decode(req.cookies.token).id;
  } else {
    res.status(500).json({ success: false, message: "token Invalide" });
  }
  console.log(uti_id, pro_id, msg, prix, cha_id);

  try {
    conn = await db.pool.getConnection();
    await conn.query(
      "INSERT INTO demandes (dem_ent_uti_id, dem_pro_id, dem_description, dem_prix, dem_chaine_id, dem_valide,dem_date_limite) VALUES (?, ?, ?, ?, ?, ?,?)",
      [uti_id, pro_id, msg, prix, cha_id, 0, dateButoire]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.deleteDemande = async (req, res) => {
  const dem_id = req.params.id;
  let conn;
  try {
    conn = await db.pool.getConnection();
    await conn.query("DELETE from demandes WHERE dem_id = ?", [dem_id]);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};
exports.validDemande = async (req, res) => {
  const dem_id = req.params.id;
  let conn;
  try {
    conn = await db.pool.getConnection();
    await conn.query("UPDATE demandes SET dem_valide = 1 WHERE dem_id = ?", [
      dem_id,
    ]);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.getValidDemandesCreateur = async (req, res) => {
  let conn;
  var uti_id = 0;
  if (
    req.cookies.token != null &&
    req.cookies.token != undefined &&
    jwt.verify(req.cookies.token, process.env.JWT_KEY)
  ) {
    uti_id = jwt.decode(req.cookies.token).id;
  } else {
    res.status(500).json({ success: false, message: "token Invalide" });
  }
  try {
    conn = await db.pool.getConnection();
    const chaines = await conn.query(
      "SELECT cha_id FROM chaines WHERE cha_uti_id = ?",
      [uti_id]
    );
    var demandes = [];
    for (let i = 0; i < chaines.length; i++) {
      var query = await conn.query(
        "SELECT dem_id, dem_description, dem_prix, cha_name, ent_nom, pro_nom FROM demandes inner join produits on dem_pro_id = pro_id inner join chaines on dem_chaine_id = cha_id inner join entreprises on dem_ent_uti_id = ent_uti_id WHERE dem_chaine_id = ? AND dem_valide = 1 AND dem_refus =0",
        [chaines[i].cha_id]
      );
      demandes.push(query);
    }
    res.status(200).json(demandes);
  } catch (err) {
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.getValidDemandesEntreprise = async (req, res) => {
  let conn;
  var uti_id = 0;
  if (
    req.cookies.token != null &&
    req.cookies.token != undefined &&
    jwt.verify(req.cookies.token, process.env.JWT_KEY)
  ) {
    uti_id = jwt.decode(req.cookies.token).id;
  } else {
    res.status(500).json({ success: false, message: "token Invalide" });
  }
  try {
    conn = await db.pool.getConnection();
    const query = await conn.query(
      "SELECT dem_id, dem_refus, dem_description, dem_prix, cha_name, pro_nom FROM demandes inner join produits on dem_pro_id = pro_id inner join chaines on dem_chaine_id = cha_id WHERE dem_ent_uti_id = ? AND dem_valide = 1",
      [uti_id]
    );
    res.status(200).json(query);
  } catch (err) {
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.refuserDemande = async (req, res) => {
  const dem_id = req.params.id;
  let conn;
  try {
    conn = await db.pool.getConnection();
    await conn.query("UPDATE demandes SET dem_refus = 1 WHERE dem_id = ?", [
      dem_id,
    ]);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};
