const adminService = require("../services/adminService");
const taskService = require("../services/taskService");

class AdminController {
  async getUsers(req, res, next) {
    try {
      const users = await adminService.getUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async getPendingTaskSubmissions(req, res, next) {
    try {
      const submissions = await taskService.getPendingSubmissions();
      res.json({ success: true, data: submissions });
    } catch (error) {
      next(error);
    }
  }

  async approveTaskSubmission(req, res, next) {
    try {
      await taskService.approveSubmission(
        req.params.id,
        req.user.id,
        req.body.notes,
      );
      res.json({
        success: true,
        message: "Task submission approved and credits added.",
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectTaskSubmission(req, res, next) {
    try {
      await taskService.rejectSubmission(
        req.params.id,
        req.user.id,
        req.body.notes,
      );
      res.json({ success: true, message: "Task submission rejected." });
    } catch (error) {
      next(error);
    }
  }

  async grantCredits(req, res, next) {
    try {
      await adminService.grantCreditsToUser(
        req.params.id,
        req.user.id,
        Number(req.body.amount),
        req.body.notes,
      );
      res.json({
        success: true,
        message: "Credits added to user balance.",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
