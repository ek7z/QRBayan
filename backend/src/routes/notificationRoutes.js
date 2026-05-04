const express = require("express");
const notificationController = require("../controllers/notificationController");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/poll", authMiddleware, notificationController.poll);

module.exports = router;
