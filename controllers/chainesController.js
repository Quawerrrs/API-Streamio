const { query } = require('express');
const db = require('../databases/database.js');

/**
 * Add a new channel to the database
 * @param {Object} req.body - Body of the request, must contain utilisateur, email, name, theme1, theme2, theme3, url and subs
 * @param {Response} res - Response of the request
 * @returns {Promise<void>}
 */
exports.addChannel = async (req, res) => {
  const { utilisateur, email, name, theme1, theme2, theme3, url, subs } = req.body;
  if (utilisateur != null && email != null && name != null && theme1 != null) {
    try {
      conn = await db.pool.getConnection();
      const query = await conn.query('insert into chaines (cha_uti_id,cha_email, cha_name, cha_theme_1, cha_theme_2, cha_theme_3, cha_url, cha_subs) VALUES (?,?,?,?,?,?,?,?)', [utilisateur, email, name, theme1, theme2, theme3, url, subs])
      res.status(200).json({ success: true });
    } catch (err) {

    }
    finally {
      if (conn) {
        conn.release();
      }
    }
  }
}

exports.getChannels = async (req, res) => {
  const { start, length } = req.body;
  try {
    conn = await db.pool.getConnection();
    const query = await conn.query(`SELECT * from chaines LIMIT ${start},${length}`)
    // resultats = [];
    // query.map((result) => {
    //   resultats.push(result);
    // })
    // console.log(resultats);
    res.status(200).json(query);
  } catch (err) {

  }
  finally {
    if (conn) {
      conn.release();
    }
  }
}

exports.getChannelsID = async (req, res) => {
  const { uti_id } = req.body;
  try {
    conn = await db.pool.getConnection();
    const query = await conn.query("SELECT * from chaines WHERE cha_uti_id = ?", [uti_id])
    res.status(200).json(query);
  } catch (err) {

  }
  finally {
    if (conn) {
      conn.release();
    }
  }
}

exports.deleteChannel = async (req, res) => {
  const { cha_id } = req.body;
  try {
    conn = await db.pool.getConnection();
    const query = await conn.query("DELETE from chaines WHERE cha_id = ?", [cha_id])
    res.status(200).json({ success: true });
  } catch (err) {

  } finally {
    if (conn) {
      conn.release();
    }
  }
}

exports.updateChannel = async (req, res) => {
  const { cha_id, cha_email, cha_name, cha_theme_1, cha_theme_2, cha_theme_3, cha_url, cha_subs } = req.body;
  try {
    conn = await db.pool.getConnection();
    const query = await conn.query("UPDATE chaines SET cha_email, cha_name = ?, cha_theme_1 = ?, cha_theme_2 = ?, cha_theme_3 = ?, cha_url = ?, cha_subs = ? WHERE cha_id = ?", [cha_email, cha_name, cha_theme_1, cha_theme_2, cha_theme_3, cha_url, cha_subs, cha_id])
    res.status(200).json({ success: true });
  } catch (e) {
    console.log(e);
  }
  finally {
    if (conn) {
      conn.release();
    }
  }
}