const db = require("../databases/database.js");
const pswHash = require("password-hash");
const jwt = require("jsonwebtoken");

exports.postUser = async (req, res) => {
  let conn;
  if (req.body.userType === "videaste") {
    try {
      conn = await db.pool.getConnection();
      const { name, email, password, firstName, lastName } = req.body;
      const mailUtilise = await conn.query(
        "SELECT COUNT(*) nb  FROM utilisateurs WHERE uti_email = ?",
        [email]
      );
      var reg = new RegExp(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*£§_-]).{8,}$/
      );
      if (reg.test(password)) {
        var passwordHash = pswHash.generate(password);
      } else {
        res.status(500).json({ password: true });
      }
      let date = new Date();
      if (mailUtilise[0].nb > 0) {
        res.status(403).json({ email: true });
      } else {
        const pseudoUtilise = await conn.query(
          "SELECT COUNT(*) nb  FROM createurs WHERE cre_pseudo = ?",
          [name]
        );
        if (pseudoUtilise[0].nb > 0) {
          res.status(403).json({ pseudo: true });
        } else {
          const insertUtilisateur = await conn.query(
            "INSERT INTO utilisateurs (uti_email,uti_motdepasse,uti_date_creation) VALUES (?,?,?)",
            [email, passwordHash, date],
            function (err, result) {}
          );
          const lastID = await conn.query(
            "SELECT uti_id from utilisateurs order by uti_id desc limit 1"
          );
          const insertCreateur = await conn.query(
            "INSERT INTO createurs (cre_uti_id,cre_pseudo,cre_nom,cre_prenom) VALUES (?,?,?,?)",
            [lastID[0].uti_id, name, lastName, firstName]
          );
          res.status(200).json({ success: true });
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false });
    } finally {
      if (conn) {
        conn.release();
      }
    }
  } else if (req.body.userType === "entreprise") {
    try {
      conn = await db.pool.getConnection();
      const { name, email, password, siret, adresse } = req.body;
      const mailUtilise = await conn.query(
        "SELECT COUNT(*) nb  FROM utilisateurs WHERE uti_email = ?",
        [email]
      );
      var reg = new RegExp(
        /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*£§_-]).{8,}$/
      );
      if (reg.test(password)) {
        var passwordHash = pswHash.generate(password);
      } else {
        res.status(500).json({ password: true });
      }
      let date = new Date();
      mailUtilise.map((utilise) => {
        oui = utilise.nb.toString().substring(0, 1);
      });
      if (oui > 0) {
        console.log("duplicata");
        res.status(403).json({ email: true });
      } else {
        const insertUtilisateur = await conn.query(
          "INSERT INTO utilisateurs (uti_email,uti_motdepasse,uti_date_creation) VALUES (?,?,?)",
          [email, passwordHash, date],
          function (err, result) {}
        );
        const lastID = await conn.query(
          "SELECT uti_id from utilisateurs order by uti_id desc limit 1"
        );
        const insertEntreprise = await conn.query(
          "INSERT INTO entreprises (ent_uti_id,ent_siret,ent_adresse,ent_nom) VALUES (?,?,?,?)",
          [lastID[0].uti_id, siret, adresse, name]
        );
        res.status(200).json({ success: true });
      }
    } catch (err) {
      console.log(err);
      res.status(500).json({ success: false });
    } finally {
      if (conn) {
        conn.release();
      }
    }
  } else {
    res.status(500).json({ success: false });
  }
};

exports.getVideastes = async (req, res) => {
  let conn;
  try {
    conn = await db.pool.getConnection();
    const getVideastes = await conn.query(
      "SELECT * FROM utilisateurs inner join createurs on uti_id = cre_uti_id"
    );
    res.status(200).json({ success: true, videastes: getVideastes });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.getEntreprises = async (req, res) => {
  let conn;
  try {
    conn = await db.pool.getConnection();
    const getEntreprises = await conn.query(
      "SELECT * FROM utilisateurs inner join entreprises on uti_id = ent_uti_id"
    );
    res.status(200).json({ success: true, entreprises: getEntreprises });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.updateToAdmin = async (req, res) => {
  let conn;
  try {
    conn = await db.pool.getConnection();
    const { uti_id, adm_role, adm_code } = req.body;
    const select = await conn.query(
      `SELECT * FROM utilisateurs LEFT JOIN createurs ON uti_id = cre_uti_id AND(SELECT COUNT(*) FROM createurs WHERE cre_uti_id = ?) > 0 
      LEFT JOIN entreprises ON uti_id = ent_uti_id AND(SELECT COUNT(*) FROM entreprises WHERE ent_uti_id = ?) > 0;`,
      [uti_id, uti_id]
    );
    if (select[0].cre_pseudo != null) {
      const delCreateur = await conn.query(
        "DELETE FROM createurs WHERE cre_uti_id = ?",
        [select[0].cre_uti_id]
      );
    } else if (select[0].ent_siret != null) {
      const delEntreprise = await conn.query(
        "DELETEFROM entreprises WHERE ent_uti_id = ?",
        [select[0].ent_uti_id]
      );
    }
    const updateToAdmin = await conn.query(
      "INSERT INTO administrateurs (adm_uti_id, adm_role, adm_code) VALUES (?,?,?)",
      [uti_id, adm_role, adm_code]
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.deleteUser = async (req, res) => {
  let conn;
  try {
    conn = await db.pool.getConnection();
    var token = req.cookies.token;
    token = jwt.verify(token, process.env.JWT_SECRET);
    var decoded = jwt.decode(token);
    console.log(decoded);

    if (decoded.type == "createur") {
      const delCreateur = await conn.query(
        "DELETE FROM createurs WHERE cre_uti_id = ?",
        [decoded.id]
      );
    } else if (decoded.type == "entreprise") {
      const delEntreprise = await conn.query(
        "DELETE FROM entreprises WHERE ent_uti_id = ?",
        [decoded.id]
      );
    }
    const delUtilisateur = await conn.query(
      "DELETE FROM utilisateurs WHERE uti_id = ?",
      [decoded.id]
    );
    res.clearCookie("token");
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};
// exports.getUser = async function (req, res) {
//   let conn
//   try {
//     conn = await db.pool.getConnection();
//     const { uti_id } = req.body
//     const select = await conn.query(`SELECT * FROM utilisateurs LEFT JOIN createurs ON uti_id = cre_uti_id AND(SELECT COUNT(*) FROM createurs WHERE cre_uti_id = ?) > 0)`);
//     res.status(200).json({ "success": true, "user": select[0] });
//   } catch (err) {
//     console.log(err)
//     res.status(500).json({ "success": false });
//   }
//   finally {
//     if (conn) {
//       conn.release();
//     }
//   }
// }
exports.getUsers = async (req, res) => {
  let conn;
  try {
    conn = await db.pool.getConnection(); // Récupère une connexion à la base de données

    // Requête SQL pour obtenir tous les utilisateurs avec leur rôle et leur statut de blocage
    const getUsers = await conn.query(`
      SELECT u.uti_id, u.uti_email, u.is_blocked, 
      CASE 
        WHEN c.cre_uti_id IS NOT NULL THEN 'createurs'         -- Utilisation de 'cre_uti_id' pour createurs
        WHEN e.ent_uti_id IS NOT NULL THEN 'entreprises'       -- Utilisation de 'ent_uti_id' pour entreprises
        WHEN a.adm_uti_id IS NOT NULL THEN 'administrateurs'    -- Utilisation de 'adm_uti_id' pour administrateurs
        ELSE 'non défini'
      END AS role
      FROM utilisateurs u
      LEFT JOIN createurs c ON u.uti_id = c.cre_uti_id        -- Jointure sur 'cre_uti_id'
      LEFT JOIN entreprises e ON u.uti_id = e.ent_uti_id      -- Jointure sur 'ent_uti_id'
      LEFT JOIN administrateurs a ON u.uti_id = a.adm_uti_id   -- Jointure sur 'adm_uti_id'
    `);

    // Vérifie s'il y a des résultats
    if (getUsers.length > 0) {
      res.status(200).json({
        success: true,
        users: getUsers,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Aucun utilisateur trouvé",
      });
    }
  } catch (err) {
    console.error(
      "Erreur lors de la récupération des utilisateurs:",
      err.message
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des utilisateurs",
      error: err, // Inclure l'erreur pour débogage
    });
  } finally {
    if (conn) {
      conn.release(); // Libérer la connexion
    }
  }
};

// userController.js
// userController.js
exports.deleteSpecificUser = async (req, res) => {
  const userId = req.params.id; // Récupération de l'ID de l'utilisateur à supprimer
  let conn;

  console.log(`Tentative de suppression de l'utilisateur avec ID: ${userId}`); // Log de l'ID de l'utilisateur

  try {
    conn = await db.pool.getConnection(); // Obtenir une connexion à la base de données
    console.log("Connexion à la base de données réussie."); // Log de connexion

    // Étape 1 : Récupérer le rôle de l'utilisateur
    const [user] = await conn.query(
      `
      SELECT u.uti_id, u.uti_email, u.is_blocked, 
      CASE 
        WHEN c.cre_uti_id IS NOT NULL THEN 'createurs'         -- Utilisation de 'cre_uti_id' pour createurs
        WHEN e.ent_uti_id IS NOT NULL THEN 'entreprises'       -- Utilisation de 'ent_uti_id' pour entreprises
        WHEN a.adm_uti_id IS NOT NULL THEN 'administrateurs'    -- Utilisation de 'adm_uti_id' pour administrateurs
        ELSE 'non défini'
      END AS role
      FROM utilisateurs u
      LEFT JOIN createurs c ON u.uti_id = c.cre_uti_id        -- Jointure sur 'cre_uti_id'
      LEFT JOIN entreprises e ON u.uti_id = e.ent_uti_id      -- Jointure sur 'ent_uti_id'
      LEFT JOIN administrateurs a ON u.uti_id = a.adm_uti_id   -- Jointure sur 'adm_uti_id'
      WHERE u.uti_id = ?
    `,
      [userId]
    );

    // Log de l'utilisateur récupéré
    console.log("Utilisateur récupéré:", user);

    // Vérification si l'utilisateur existe
    if (!user || user.length === 0) {
      console.log("Utilisateur non trouvé."); // Log si l'utilisateur n'est pas trouvé
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé." });
    }

    // Étape 2 : Supprimer l'utilisateur de la table correspondant à son rôle
    let deleteRoleQuery = "";
    if (user.role === "createurs") {
      // Correction ici pour utiliser le bon champ
      deleteRoleQuery = "DELETE FROM createurs WHERE cre_uti_id = ?";
    } else if (user.role === "entreprises") {
      // Correction ici pour utiliser le bon champ
      deleteRoleQuery = "DELETE FROM entreprises WHERE ent_uti_id = ?";
    } else if (user.role === "administrateurs") {
      // Correction ici pour utiliser le bon champ
      deleteRoleQuery = "DELETE FROM administrateurs WHERE adm_uti_id = ?";
    }

    // Exécuter la requête de suppression du rôle
    console.log(
      `Suppression de l'utilisateur de la table de rôle: ${deleteRoleQuery}`
    ); // Log de la requête de suppression
    await conn.query(deleteRoleQuery, [userId]);

    // Étape 3 : Supprimer l'utilisateur de la table utilisateurs
    await conn.query("DELETE FROM utilisateurs WHERE uti_id = ?", [userId]);
    console.log("Utilisateur supprimé de la table utilisateurs."); // Log de la suppression

    res
      .status(200)
      .json({ success: true, message: "Utilisateur supprimé avec succès." });
  } catch (err) {
    console.error("Erreur lors de la suppression:", err.message); // Log de l'erreur
    res
      .status(500)
      .json({ success: false, message: "Erreur lors de la suppression." });
  } finally {
    if (conn) {
      conn.release(); // Libérer la connexion
      console.log("Connexion libérée."); // Log de la libération de connexion
    }
  }
};
exports.blockUser = async (req, res) => {
  const userId = req.params.id; // ID de l'utilisateur à bloquer
  const { reason } = req.body; // Récupérer la raison de blocage
  let conn;

  try {
    conn = await db.pool.getConnection(); // Obtenir une connexion à la base de données

    // Mettre à jour l'utilisateur pour indiquer qu'il est bloqué
    await conn.query(
      "UPDATE utilisateurs SET is_blocked = 1, block_reason = ? WHERE uti_id = ?",
      [reason, userId]
    );

    res
      .status(200)
      .json({ success: true, message: "Utilisateur bloqué avec succès." });
  } catch (err) {
    console.error("Erreur lors du blocage:", err);
    res
      .status(500)
      .json({ success: false, message: "Erreur lors du blocage." });
  } finally {
    if (conn) {
      conn.release(); // Libérer la connexion
    }
  }
};

exports.updateUser = async function (req, res) {
  let conn;
  try {
    conn = await db.pool.getConnection();
    const { uti_id, email, name, firstName, pseudo, siret, adresse } = req.body;
    // Vérification email unique
    const mailUtilise = await conn.query(
      "SELECT COUNT(*) nb FROM utilisateurs WHERE uti_email = ? AND uti_id != ?",
      [email, uti_id]
    );

    if (mailUtilise[0].nb > 0) {
      return res.status(403).json({ email: true });
    }

    // Mise à jour email utilisateur
    await conn.query("UPDATE utilisateurs SET uti_email = ? WHERE uti_id = ?", [
      email,
      uti_id,
    ]);

    // Mise à jour selon le type d'utilisateur
    if (siret != null) {
      await conn.query(
        "UPDATE entreprises SET ent_nom = ?, ent_siret = ?, ent_adresse = ? WHERE ent_uti_id = ?",
        [name, siret, adresse, uti_id]
      );

      const token = jwt.sign(
        {
          id: uti_id,
          type: "entreprise",
          email,
          nom: name,
          siret,
          adresse,
        },
        process.env.JWT_KEY,
        { expiresIn: "4h" }
      );

      return res.json({ success: true });
    }

    if (pseudo != null) {
      await conn.query(
        "UPDATE createurs SET cre_pseudo = ?, cre_prenom = ?, cre_nom = ? WHERE cre_uti_id = ?",
        [pseudo, firstName, name, uti_id]
      );

      const token = jwt.sign(
        {
          id: uti_id,
          type: "createur",
          email,
          prenom: firstName,
          nom: name,
          pseudo,
        },
        process.env.JWT_KEY,
        { expiresIn: "4h" }
      );

      return res
        .cookie("token", token, {
          expires: new Date(Date.now() + 4 * 60 * 60 * 1000),
          httpOnly: true,
          path: "/",
          secure: false,
          sameSite: "Lax",
        })
        .json({ success: true });
    }

    // Cas par défaut si aucun type spécifié
    res
      .status(400)
      .json({ success: false, message: "Type de mise à jour non spécifié" });
  } catch (err) {
    console.error("Erreur de mise à jour:", err);
    res.status(500).json({ success: false, message: err.message });
  } finally {
    if (conn) conn.release();
  }
};
