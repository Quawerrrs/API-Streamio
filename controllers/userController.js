const db = require('../databases/database.js');
const pswHash = require('password-hash');

exports.postUser = async (req, res) => {
  let conn;
  if (req.body.userType === "videaste") {
    try {
      conn = await db.pool.getConnection();
      const { name, email, password, firstName, lastName } = req.body
      const mailUtilise = await conn.query("SELECT COUNT(*) nb  FROM utilisateurs WHERE uti_email = ?", [email])
      var reg = new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*£§_-]).{8,}$/)
      if (reg.test(password)) {
        var passwordHash = pswHash.generate(password)
      } else {
        res.status(500).json({ password: true })
      }
      let date = new Date();
      mailUtilise.map(utilise => {
        oui = utilise.nb.toString().substring(0, 1);
      })
      if (oui > 0) {
        res.status(403).json({ "email": true });
      } else {
        const insertUtilisateur = await conn.query("INSERT INTO utilisateurs (uti_email,uti_motdepasse,uti_date_creation) VALUES (?,?,?)", [email, passwordHash, date], function (err, result) { })
        const lastID = await conn.query("SELECT uti_id from utilisateurs order by uti_id desc limit 1")
        const insertCreateur = await conn.query("INSERT INTO createurs (cre_uti_id,cre_pseudo,cre_nom,cre_prenom) VALUES (?,?,?,?)", [lastID[0].uti_id, name, lastName, firstName])
        res.status(200).json({ "success": true })
      }
    }
    catch (err) {
      console.log(err)
      res.status(500).json({ "success": false });
    }
    finally {
      if (conn) {
        conn.release();
      }
    }
  } else if (req.body.userType === "entreprise") {
    try {
      conn = await db.pool.getConnection();
      const { name, email, password, siren, adresse } = req.body
      const mailUtilise = await conn.query("SELECT COUNT(*) nb  FROM utilisateurs WHERE uti_email = ?", [email])
      var reg = new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*£§_-]).{8,}$/)
      if (reg.test(password)) {
        var passwordHash = pswHash.generate(password)
      } else {
        res.status(500).json({ password: true })
      }
      let date = new Date();
      mailUtilise.map(utilise => {
        oui = utilise.nb.toString().substring(0, 1);
      })
      if (oui > 0) {
        console.log("duplicata")
        res.status(403).json({ "email": true });
      } else {
        const insertUtilisateur = await conn.query("INSERT INTO utilisateurs (uti_email,uti_motdepasse,uti_date_creation) VALUES (?,?,?)", [email, passwordHash, date], function (err, result) { })
        const lastID = await conn.query("SELECT uti_id from utilisateurs order by uti_id desc limit 1")
        const insertEntreprise = await conn.query("INSERT INTO entreprises (ent_uti_id,ent_siret,ent_adresse,ent_nom) VALUES (?,?,?,?)", [lastID[0].uti_id, siren, adresse, name])
        res.status(200).json({ "success": true })
      }

    }
    catch (err) {
      console.log(err)
      res.status(500).json({ "success": false });
    }
    finally {
      if (conn) {
        conn.release();
      }
    }
  } else {
    res.status(500).json({ "success": false });
  }
}

exports.getVideastes = async (req, res) => {
  let conn
  try {
    conn = await db.pool.getConnection();
    const getVideastes = await conn.query("SELECT * FROM utilisateurs inner join createurs on uti_id = cre_uti_id")
    res.status(200).json({ "success": true, "videastes": getVideastes })
  } catch (err) {
    console.log(err)
    res.status(500).json({ "success": false });
  }
  finally {
    if (conn) {
      conn.release();
    }
  }
}

exports.getEntreprises = async (req, res) => {
  let conn
  try {
    conn = await db.pool.getConnection();
    const getEntreprises = await conn.query("SELECT * FROM utilisateurs inner join entreprises on uti_id = ent_uti_id")
    res.status(200).json({ "success": true, "entreprises": getEntreprises })
  } catch (err) {
    console.log(err)
    res.status(500).json({ "success": false });
  }
  finally {
    if (conn) {
      conn.release();
    }
  }
}

exports.updateToAdmin = async (req, res) => {
  let conn
  try {
    conn = await db.pool.getConnection();
    const { uti_id, adm_role, adm_code } = req.body
    const select = await conn.query(`SELECT * FROM utilisateurs LEFT JOIN createurs ON uti_id = cre_uti_id AND(SELECT COUNT(*) FROM createurs WHERE cre_uti_id = ?) > 0 
      LEFT JOIN entreprises ON uti_id = ent_uti_id AND(SELECT COUNT(*) FROM entreprises WHERE ent_uti_id = ?) > 0;`, [uti_id, uti_id]);
    if (select[0].cre_pseudo != null) {
      const delCreateur = await conn.query("DELETE FROM createurs WHERE cre_uti_id = ?", [select[0].cre_uti_id])
    } else if (select[0].ent_siret != null) {
      const delEntreprise = await conn.query("DELETEFROM entreprises WHERE ent_uti_id = ?", [select[0].ent_uti_id])
    }
    const updateToAdmin = await conn.query("INSERT INTO administrateurs (adm_uti_id, adm_role, adm_code) VALUES (?,?,?)", [uti_id,adm_role,adm_code]);
    res.status(200).json({ "success": true })
  } catch (err) {
    console.log(err)
    res.status(500).json({ "success": false });
  }
  finally {
    if (conn) {
      conn.release();
    }
  }
}