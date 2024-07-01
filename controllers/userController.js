const db = require('../databases/database.js');
const pswHash = require('password-hash');

exports.postUser = async (req, res) => {
  let conn;
  if (req.body.userType === "videaste") {
    try {
      conn = await db.pool.getConnection();
      const {name ,email, password, firstName, lastName } = req.body
      const mailUtilise = await conn.query("SELECT COUNT(*) nb  FROM utilisateurs WHERE uti_email = ?", [email])
      var reg = new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*£§_-]).{8,}$/)
      if (reg.test(password)){
        var passwordHash = pswHash.generate(password)
      } else {
        res.status(500).json({ password : true})
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
        const insertCreateur = await conn.query("INSERT INTO createurs (cre_uti_id,cre_pseudo,cre_nom,cre_prenom) VALUES (?,?,?,?)", [lastID[0].uti_id,name,lastName,firstName])
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
      const {name ,email, password, siren, adresse } = req.body
      const mailUtilise = await conn.query("SELECT COUNT(*) nb  FROM utilisateurs WHERE uti_email = ?", [email])
      var reg = new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*£§_-]).{8,}$/)
      if (reg.test(password)){
        var passwordHash = pswHash.generate(password)
      } else {
        res.status(500).json({ password : true})
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
        const insertEntreprise = await conn.query("INSERT INTO entreprises (ent_uti_id,ent_siret,ent_adresse,ent_nom) VALUES (?,?,?,?)", [lastID[0].uti_id,siren,adresse,name])
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
    res.status(200).json({ "success": true, "videastes": getVideastes})
  }    catch (err) {
    console.log(err)
    res.status(500).json({ "success": false });
  }
  finally {
    if (conn) {
      conn.release();
    }
  }
}