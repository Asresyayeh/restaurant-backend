const express = require("express");

const router = express.Router();
const ContactController = require("../controllers/ContactController");

router.post("/", ContactController.createMessage);


router.get("/", ContactController.getAllMessages);
router.delete("/:id", ContactController.deleteMessage);

module.exports = router;
