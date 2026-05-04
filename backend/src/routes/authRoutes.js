const express = require("express");
const authController = require("../controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { registerSchema, loginSchema } = require("../validators/schemas");

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.get("/me", authMiddleware, authController.getMe);

module.exports = router;
