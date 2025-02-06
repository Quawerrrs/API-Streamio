const { query } = require("express");
const db = require("../databases/database.js");
const jwt = require("jsonwebtoken");

/**
 * Add a new channel to the database
 * @param {Object} req.body - Body of the request, must contain utilisateur, email, name, theme1, theme2, theme3, url and subs
 * @param {Response} res - Response of the request
 * @returns {Promise<void>}
 */
exports.addChannel = async (req, res) => {
  const {
    cha_email,
    cha_name,
    cha_theme_1,
    cha_theme_2,
    cha_theme_3,
    cha_url,
    cha_subs,
  } = req.body;
  var token = req.cookies.token;
  let conn;
  if (cha_email != null && cha_name != null && cha_theme_1 != null) {
    try {
      jwt.verify(token, process.env.JWT_KEY);
      var decoded = jwt.decode(token);

      conn = await db.pool.getConnection();
      const query = await conn.query(
        "insert into chaines (cha_uti_id,cha_email, cha_name, cha_theme_1, cha_theme_2, cha_theme_3, cha_url, cha_subs) VALUES (?,?,?,?,?,?,?,?)",
        [
          decoded.id,
          cha_email,
          cha_name,
          cha_theme_1,
          cha_theme_2,
          cha_theme_3,
          cha_url,
          cha_subs,
        ]
      );
      res.status(200).json({ success: true });
    } catch (err) {
      console.log(err.message);
      res.status(500).json({ success: false });
    } finally {
      if (conn) {
        conn.release();
      }
    }
  }
};

exports.getChannels = async (req, res) => {
  const { start, length, search, sortCategory, sortOrder, subscribers } =
    req.body;
  let conn;
  if (subscribers == null || subscribers == "") {
    subscribers == 0;
  }
  console.log(start, length, search, sortCategory, sortOrder, subscribers);

  try {
    conn = await db.pool.getConnection();
    if (search != null) {
      if (sortCategory != null) {
        const query = await conn.query(
          `SELECT * from chaines WHERE cha_name LIKE '%${search}%' AND cha_subs >= ${
            subscribers * 1000
          } ORDER BY cha_theme_1 ${sortOrder} LIMIT ${start},${length}`
        );
        res.status(200).json(query);
      } else {
        const query = await conn.query(
          `SELECT * from chaines WHERE cha_name LIKE '%${search}%' AND cha_subs >= ${
            subscribers * 1000
          } LIMIT ${start},${length}`
        );
        res.status(200).json(query);
      }
    } else {
      if (sortCategory == "theme") {
        const query = await conn.query(
          `SELECT * from chaines WHERE cha_subs >= ${
            subscribers * 1000
          } ORDER BY cha_theme_1 ${sortOrder} LIMIT ${start},${length}`
        );
        res.status(200).json(query);
      } else {
        const query = await conn.query(
          `SELECT * from chaines WHERE cha_subs >= ${
            subscribers * 1000
          } LIMIT ${start},${length}`
        );
        res.status(200).json(query);
      }
    }
  } catch (err) {
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.getChannelsID = async (req, res) => {
  const { uti_id } = req.body;
  try {
    conn = await db.pool.getConnection();
    const query = await conn.query(
      "SELECT * from chaines WHERE cha_uti_id = ?",
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
exports.getChannelID = async (req, res) => {
  const { cha_id } = req.body;
  try {
    conn = await db.pool.getConnection();
    const query = await conn.query("SELECT * from chaines WHERE cha_id = ?", [
      cha_id,
    ]);
    console.log(query);

    res.status(200).json(query);
  } catch (err) {
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.deleteChannel = async (req, res) => {
  const { cha_id } = req.body;
  try {
    conn = await db.pool.getConnection();
    const query = await conn.query("DELETE from chaines WHERE cha_id = ?", [
      cha_id,
    ]);
    res.status(200).json({ success: true });
  } catch (err) {
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

exports.updateChannel = async (req, res) => {
  const {
    cha_id,
    cha_email,
    cha_name,
    cha_theme_1,
    cha_theme_2,
    cha_theme_3,
    cha_url,
    cha_subs,
  } = req.body;
  try {
    conn = await db.pool.getConnection();
    const query = await conn.query(
      "UPDATE chaines SET cha_email = ?, cha_name = ?, cha_theme_1 = ?, cha_theme_2 = ?, cha_theme_3 = ?, cha_url = ?, cha_subs = ? WHERE cha_id = ?",
      [
        cha_email,
        cha_name,
        cha_theme_1,
        cha_theme_2,
        cha_theme_3,
        cha_url,
        cha_subs,
        cha_id,
      ]
    );
    res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
  } finally {
    if (conn) {
      conn.release();
    }
  }
};
