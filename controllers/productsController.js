const db = require('../databases/database.js');
const fs = require("fs");
const jwt = require("jsonwebtoken");

exports.getProducts = async (req, res) => {
    let conn;
    const uti_id = req.body.uti_id;
    try {
        conn = await db.pool.getConnection();
        const query = await conn.query('SELECT * FROM produits where pro_uti_id = ?', [uti_id]);        
        res.status(200).json({ success: true, products: query });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ success: false });
    }
    finally {
        if (conn) {
            conn.release();
        }
    }
}

exports.deleteProduct = async (req, res) => {
    const pro_id = req.params;
    let conn;
    try {
        conn = await db.pool.getConnection();
        const query = await conn.query("DELETE from produits WHERE pro_id = ?", [pro_id]);
        res.status(200).json({ success: true });
    } catch (err) {
        console.log(err.message);
        res.status(500).json({ success: false });
    }
    finally {
        if (conn) {
            conn.release();
        }
    }
}

exports.addProduct = async (req, res) => {
    var token = req.cookies.token;
    if (jwt.verify(token, process.env.JWT_KEY)){

        var pro_uti_id = jwt.decode(token).id;
        const { nom, prix, file} = req.body;
        
        //   fs.writeFileSync("./public/" + Date.now() + typeImage, pro_img);
        let conn;
        // try {
            //     conn = await db.pool.getConnection();
            //     const query = await conn.query("INSERT INTO produits (pro_nom, pro_uti_id, pro_prix, pro_img) VALUES (?, ?, ?, ?)", [pro_nom, pro_uti_id, pro_prix, pro_img]);
    //     res.status(200).json({ success: true });
    // } catch (err) {
        //     console.log(err.message);
        //     res.status(500).json({ success: false });
        // }
        // finally {
            //     if (conn) {
                //         conn.release();
                //     }
                // }
            }
}