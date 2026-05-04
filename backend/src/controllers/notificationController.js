const notificationService = require("../services/notificationService");

class NotificationController {
  async poll(req, res, next) {
    try {
      const result = await notificationService.pollNotifications(req.user.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
