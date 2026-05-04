const express = require("express");
const creditController = require("../controllers/creditController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { submitProofSchema } = require("../validators/schemas");
const upload = require("../config/multer");

const router = express.Router();

// User routes
router.get("/packages", authMiddleware, creditController.getPackages);
router.post(
  "/upload-proof",
  authMiddleware,
  upload.single("image"),
  validate(submitProofSchema),
  creditController.uploadProof,
);
router.get(
  "/my-transactions",
  authMiddleware,
  creditController.getMyTransactions,
);
router.get("/my-proofs", authMiddleware, creditController.getMyProofs);

// Admin routes
router.get(
  "/admin/pending-proofs",
  authMiddleware,
  adminMiddleware,
  creditController.getAllPendingProofs,
);
router.post(
  "/admin/approve-proof/:id",
  authMiddleware,
  adminMiddleware,
  creditController.approveProof,
);
router.post(
  "/admin/reject-proof/:id",
  authMiddleware,
  adminMiddleware,
  creditController.rejectProof,
);

module.exports = router;
