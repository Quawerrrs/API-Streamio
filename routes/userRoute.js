// Import des dépendances
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");

// Routes existantes
router.post("/ajoutuser", userController.postUser);
router.get("/getVideastes", userController.getVideastes);
router.get("/getEntreprises", userController.getEntreprises);
router.get("/updateToAdmin", userController.updateToAdmin);
router.patch("/updateUser", userController.updateUser);
router.delete("/deleteUser", userController.deleteUser);
router.post("/resetPassword", userController.resetPassword);
// Nouvelle route pour obtenir tous les utilisateurs
router.get("/getUsers", userController.getUsers); // Ajout de cette ligne

// Nouvelle route pour supprimer un utilisateur
// userRoutes.js
router.delete("/deleteSpecificUser/:id", userController.deleteSpecificUser); // Assure-toi que cette ligne existe
// userRoutes.js
router.post("/blockUser/:id", userController.blockUser);

module.exports = router;
