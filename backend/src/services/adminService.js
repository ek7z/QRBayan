const db = require("../config/db");
const userRepository = require("../repositories/userRepository");
const notificationService = require("./notificationService");

class AdminService {
  async getUsers() {
    return userRepository.findAllWithAdminStats();
  }

  async grantCreditsToUser(userId, adminId, amount, notes) {
    const trx = await db.transaction();

    try {
      const user = await trx("users").where({ id: userId }).first();

      if (!user) {
        throw new Error("User not found.");
      }

      await trx("users").where({ id: userId }).increment("balance", amount);

      await trx("credit_transactions").insert({
        user_id: userId,
        amount,
        type: "admin_adjustment",
        description: notes?.trim()
          ? `Admin credit grant: ${notes.trim()}`
          : `Admin credit grant by admin #${adminId}`,
      });

      await notificationService.createNotification(
        userId,
        {
          type: "success",
          title: "Free credits added",
          message: notes?.trim()
            ? `${amount} credits were added to your account. Note: ${notes.trim()}`
            : `${amount} credits were added to your account by admin.`,
        },
        trx,
      );

      await trx("audit_logs").insert({
        user_id: adminId,
        action: "ADMIN_CREDIT_GRANT",
        details: `Granted ${amount} credits to user ${userId}${notes?.trim() ? `: ${notes.trim()}` : ""}`,
      });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

module.exports = new AdminService();
