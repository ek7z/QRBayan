const express = require("express");
const adminController = require("../controllers/adminController");
const {
  authMiddleware,
  adminMiddleware,
} = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
  reviewTaskSchema,
  grantCreditsSchema,
} = require("../validators/schemas");

const router = express.Router();

router.get("/users", authMiddleware, adminMiddleware, adminController.getUsers);
router.get(
  "/task-submissions",
  authMiddleware,
  adminMiddleware,
  adminController.getPendingTaskSubmissions,
);
router.post(
  "/task-submissions/:id/approve",
  authMiddleware,
  adminMiddleware,
  validate(reviewTaskSchema),
  adminController.approveTaskSubmission,
);
router.post(
  "/task-submissions/:id/reject",
  authMiddleware,
  adminMiddleware,
  validate(reviewTaskSchema),
  adminController.rejectTaskSubmission,
);
router.post(
  "/users/:id/credits",
  authMiddleware,
  adminMiddleware,
  validate(grantCreditsSchema),
  adminController.grantCredits,
);

module.exports = router;
