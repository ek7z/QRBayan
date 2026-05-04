const express = require("express");
const taskController = require("../controllers/taskController");
const { authMiddleware } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { submitTaskSchema } = require("../validators/schemas");

const router = express.Router();

router.get("/catalog", authMiddleware, taskController.getCatalog);
router.get("/my-submissions", authMiddleware, taskController.getMySubmissions);
router.post(
  "/submissions",
  authMiddleware,
  validate(submitTaskSchema),
  taskController.submitTask,
);

module.exports = router;
