const express = require("express");
const { subscribe, listSubscribers } = require("../controllers/subscriberController");

const router = express.Router();

router.post("/", subscribe);
router.get("/", listSubscribers); 

module.exports = router;
