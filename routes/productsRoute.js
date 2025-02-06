const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/productsController");
const upload = require("../lib/upload");

router.post("/getProducts", sessionController.getProducts);
router.get("/getProduct/:id", sessionController.getProduct);
router.get("/deleteProduct/:id", sessionController.deleteProduct);
router.post("/addProduct", upload.single("img"), sessionController.addProduct);
router.put(
  "/updateProduct",
  upload.single("img"),
  sessionController.updateProduct
);

module.exports = router;
