const multer = require("multer");
const path = require("path");

const nom = Date.now();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../Front-React/front/public/"); // Dossier de destination des fichiers
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique

    cb(null, nom + path.extname(file.originalname));
  },
}); // Configuration des filtres
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limite à 10MB
  fileFilter: (req, file, cb) => {
    // Vérifier le type de fichier
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      req.params.file =
        "/public/" + nom + path.extname(file.originalname).toLowerCase();
      return cb(null, true);
    } else {
      cb("Erreur : Images uniquement !");
    }
  },
});

module.exports = upload;
