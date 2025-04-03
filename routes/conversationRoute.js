const express = require("express");
const router = express.Router();
const conversationController = require("../controllers/conversationController.js");

router.get("/getconversations/:id", conversationController.getConversations);
router.get(
  "/getconversationsadmin/:isadmin",
  conversationController.getConversationsAdmin
);
// router.post("/addconversation", conversationController.addConversation);
// router.get("/getconversation/:id", conversationController.getConversationID);
// router.delete(
//   "/deleteconversation/:id",
//   conversationController.deleteConversation
// );
// router.put(
//   "/updateconversation/:id",
//   conversationController.updateConversation
// );

module.exports = router;
