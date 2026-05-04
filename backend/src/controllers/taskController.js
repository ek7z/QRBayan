const taskService = require("../services/taskService");

class TaskController {
  async getCatalog(req, res, next) {
    try {
      res.json({ success: true, data: taskService.getCatalog() });
    } catch (error) {
      next(error);
    }
  }

  async getMySubmissions(req, res, next) {
    try {
      const submissions = await taskService.getMySubmissions(req.user.id);
      res.json({ success: true, data: submissions });
    } catch (error) {
      next(error);
    }
  }

  async submitTask(req, res, next) {
    try {
      const submission = await taskService.submitTask(req.user.id, {
        taskKey: req.body.taskKey,
        submittedValue: req.body.submittedValue,
      });

      res.status(201).json({
        success: true,
        message: "Task submission sent for admin review.",
        data: submission,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TaskController();
