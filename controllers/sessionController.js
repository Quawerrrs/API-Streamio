const db = require("../databases/database.js");
const pswHash = require("password-hash");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

exports.sessionStart = async (req, res) => {
  let conn;
  try {
    conn = await db.pool.getConnection();
    const { email, password } = req.body;

    // Requête pour obtenir l'utilisateur et vérifier si l'email existe
    const queryEmail = await conn.query(
      "SELECT uti_id, uti_motdepasse, is_blocked, block_reason FROM utilisateurs WHERE uti_email = ?",
      [email]
    );

    // Si l'utilisateur n'existe pas
    if (queryEmail.length === 0) {
      return res.status(404).json({ success: "noemail" });
    }

    const user = queryEmail[0];
    const uti_mdp = user.uti_motdepasse;
    const uti_id = user.uti_id;

    // Vérification si le compte est bloqué
    if (user.is_blocked) {
      return res.status(403).json({ success: "accountBlocked", message: `Votre compte la raison est ${user.block_reason}.` });
    }

    // Requête pour récupérer les informations complètes de l'utilisateur
    const query = await conn.query(
      "SELECT * FROM utilisateurs LEFT JOIN createurs ON uti_id = cre_uti_id LEFT JOIN entreprises ON uti_id = ent_uti_id LEFT JOIN administrateurs ON uti_id = adm_uti_id WHERE uti_id = ?;",
      [uti_id]
    );

    if (query.length === 0) {
      return res.status(404).json({ success: "noemail" });
    }

    // Vérification du mot de passe et création du token JWT en fonction du type d'utilisateur
    var token;
    if (query[0].cre_pseudo != null) {
      // Si c'est un créateur
      if (pswHash.verify(password, uti_mdp)) {
        token = jwt.sign(
          {
            id: uti_id,
            type: "createur",
            email: query[0].uti_email,
            prenom: query[0].cre_prenom,
            nom: query[0].cre_nom,
            pseudo: query[0].cre_pseudo,
          },
          process.env.JWT_KEY,
          { expiresIn: "4h" }
        );
        return res
          .status(200)
          .cookie("token", token, {
            expires: new Date(Date.now() + 4 * 60 * 60 * 1000),
            httpOnly: true,
            path: "/",
            secure: false,
            sameSite: "Lax",
          })
          .json({ success: "loggedin", redirect: "createur" });
      } else {
        return res.status(401).json({ success: "wrongpwd" });
      }
    } else if (query[0].ent_nom != null) {
      // Si c'est une entreprise
      if (pswHash.verify(password, uti_mdp)) {
        token = jwt.sign(
          {
            id: uti_id,
            type: "entreprise",
            email: query[0].uti_email,
            nom: query[0].ent_nom,
            siren: query[0].ent_siret,
            adresse: query[0].ent_adresse,
          },
          process.env.JWT_KEY,
          { expiresIn: "4h" }
        );
        return res
          .status(200)
          .cookie("token", token, {
            expires: new Date(Date.now() + 4 * 60 * 60 * 1000),
            httpOnly: true,
            path: "/",
            secure: false,
            sameSite: "Lax",
          })
          .json({ success: "loggedin", redirect: "entreprise" });
      } else {
        return res.status(401).json({ success: "wrongpwd" });
      }
    } else if (query[0].adm_role != null) {
      // Si c'est un admin
      if (pswHash.verify(password, uti_mdp)) {
        token = jwt.sign(
          {
            id: uti_id,
            type: "admin",
            email: query[0].uti_email,
            role: query[0].adm_role,
            code: query[0].adm_code,
          },
          process.env.JWT_KEY,
          { expiresIn: "4h" }
        );
        return res
          .status(200)
          .cookie("token", token, {
            expires: new Date(Date.now() + 4 * 60 * 60 * 1000),
            httpOnly: true,
            path: "/",
            secure: false,
            sameSite: "Lax",
          })
          .json({ success: "loggedin", redirect: "admin" });
      } else {
        return res.status(401).json({ success: "wrongpwd" });
      }
    } else {
      return res.status(404).json({ success: "noemail" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.sessionLogout = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ redirect: "/login" });
  } catch (err) {
    console.error("Erreur lors de la destruction de la session:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSession = (req, res) => {
  var token = req.cookies.token;
  try {
    jwt.verify(token, process.env.JWT_KEY);
    var decoded = jwt.decode(token);
    res
      .status(200)
      .json({
        role: decoded.role,
        type: decoded.type,
        id: decoded.id,
        nom: decoded.nom,
        pseudo: decoded.pseudo,
        siren: decoded.siren,
        adresse: decoded.adresse,
        code: decoded.code,
        email: decoded.email,
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'notoken' });
  }
};
