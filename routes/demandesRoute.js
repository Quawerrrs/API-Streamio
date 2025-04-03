const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/demandeController");

router.get("/getDemandesEntreprise", sessionController.getDemandesEntreprise);
router.get("/getDemandesCreateur", sessionController.getDemandesCreateur);
router.delete("/deleteDemande/:id", sessionController.deleteDemande);
router.post("/addDemande", sessionController.addDemande);
router.put("/validDemande/:id", sessionController.validDemande);
router.put("/refuserDemande/:id", sessionController.refuserDemande);

module.exports = router;
