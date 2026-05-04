const db = require("../config/db");

class NotificationService {
  async createNotification(userId, { type = "info", title, message }, trx = db) {
    if (!userId || !title) {
      return null;
    }

    const [id] = await trx("notifications").insert({
      user_id: userId,
      type,
      title,
      message: message || null,
    });

    return trx("notifications").where({ id }).first();
  }

  async pollNotifications(userId) {
    const trx = await db.transaction();

    try {
      const notifications = await trx("notifications")
        .where({ user_id: userId })
        .whereNull("delivered_at")
        .orderBy("created_at", "asc");

      if (notifications.length > 0) {
        await trx("notifications")
          .whereIn(
            "id",
            notifications.map((notification) => notification.id),
          )
          .update({
            delivered_at: db.fn.now(),
            updated_at: db.fn.now(),
          });
      }

      const user = await trx("users")
        .select("id", "email", "role", "balance", "created_at", "updated_at")
        .where({ id: userId })
        .first();

      await trx.commit();

      return { notifications, user };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

module.exports = new NotificationService();
