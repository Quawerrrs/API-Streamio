const db = require('../databases/database.js');
const pswHash = require('password-hash');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

exports.sessionStart = async (req, res) => {
  let conn;
  try {
    conn = await db.pool.getConnection();
    const { email, password } = req.body;
    const queryEmail = await conn.query("SELECT uti_id from utilisateurs where uti_email = ?",[email]);
    const query = await conn.query("SELECT * FROM utilisateurs LEFT JOIN createurs ON uti_id = cre_uti_id AND(SELECT COUNT(*) FROM createurs WHERE cre_uti_id = ?) > 0 LEFT JOIN entreprises ON uti_id = ent_uti_id AND(SELECT COUNT(*) FROM entreprises WHERE ent_uti_id = ?) > 0 LEFT JOIN administrateurs ON uti_id = adm_uti_id WHERE uti_id = ?;", [queryEmail[0].uti_id,queryEmail[0].uti_id,queryEmail[0].uti_id])
    var uti_mdp = query[0].uti_motdepasse;
    var uti_id = query[0].uti_id;    
    // Si c'est un créateur
    if (query[0].cre_pseudo != null) {
      if (pswHash.verify(password, uti_mdp)) {
        var token = jwt.sign({ 'id': uti_id, 'type': "createur", 'email': query[0].uti_email, 'prenom': query[0].cre_prenom, 'nom': query[0].cre_nom, 'pseudo': query[0].cre_pseudo }, process.env.JWT_KEY, { expiresIn: '4h' })
        res.status(200).cookie('token', token, {
          expires: new Date(Date.now() + 4 * 60 * 60 * 1000),
          httpOnly: true,
          path: "/",
          secure: false,
          sameSite: 'Lax'
        }).json({ 'success': "loggedin", redirect: "createur" })
      } else {
        res.status(401).json({ success: 'wrongpwd' });
      }
      // Si c'est une entreprise
    } else if (query[0].ent_nom != null) {
      if (pswHash.verify(password, uti_mdp)) {
        var token = jwt.sign({ 'id': uti_id,'type': "entreprise", 'email': query[0].uti_email, 'nom': query[0].ent_nom, 'siren': query[0].ent_siret, 'adresse': query[0].ent_adresse }, process.env.JWT_KEY, { expiresIn: '4h' })
        res.status(200).cookie('token', token, {
          expires: new Date(Date.now() + 4 * 60 * 60 * 1000),
          httpOnly: true,
          path: "/",
          secure: false,
          sameSite: 'Lax'
        }).json({ 'success': "loggedin", redirect: "entreprise" })
      } else {
        res.status(401).json({ success: 'wrongpwd' });
      }

      // Si c'est un admin
    } else if (query[0].adm_role != null){
      if (pswHash.verify(password, uti_mdp)) {
        var token = jwt.sign({ 'id': uti_id, 'type': "admin", 'email': query[0].uti_email, 'role': query[0].adm_role, 'code': query[0].adm_code}, process.env.JWT_KEY, { expiresIn: '4h' })
        res.status(200).cookie('token', token, {
          expires: new Date(Date.now() + 4 * 60 * 60 * 1000),
          httpOnly: true,
          path: "/",
          secure: false,
          sameSite: 'Lax'
        }).json({ 'success': "loggedin", redirect: "admin" })
      } else {
        res.status(401).json({ success: 'wrongpwd' });
      }
    } else {
      res.status(404).json({ success: 'noemail' });
      console.log("pas d'email")
    }
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  finally {
    if (conn) {
      conn.release();
    }
  }
}

exports.sessionLogout = (req, res) => {
  try {
    res.clearCookie('token')
    res.status(200).json({ redirect: '/login' });
  }
  catch (err) {
    console.error('Erreur lors de la destruction de la session:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.getSession = (req, res) => {
  var token = req.cookies.token
  try {
    jwt.verify(token, process.env.JWT_KEY)
    var decoded = jwt.decode(token)
    res.status(200).json({role:decoded.role, type: decoded.type, id: decoded.id, nom: decoded.nom, pseudo: decoded.pseudo, siren: decoded.siren, adresse: decoded.adresse, code: decoded.code, email: decoded.email})

  } catch (err) {
    console.log(err);
    res.status(500).json({error:'no token'});
  }
  finally {
    if (conn) {
      conn.release();
    }
  }
}