const express = require("express");
const qrController = require("../controllers/qrController");
const { authMiddleware } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { generateQRSchema } = require("../validators/schemas");
const upload = require("../config/multer");

const router = express.Router();

router.post(
  "/decode",
  authMiddleware,
  upload.single("image"),
  qrController.decode,
);
router.post(
  "/generate",
  authMiddleware,
  validate(generateQRSchema),
  qrController.generate,
);
router.get("/history", authMiddleware, qrController.getHistory);

module.exports = router;
