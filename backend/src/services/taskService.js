const db = require("../config/db");
const notificationService = require("./notificationService");

const TASK_CATALOG = [
  {
    key: "follow_tiktok",
    title: "Follow on TikTok",
    description:
      "Follow the TikTok account, then submit your TikTok username or display name for admin review.",
    rewardCredits: 5,
    submissionLabel: "TikTok username or display name",
    linkLabel: "Open @jek.dev",
    linkUrl: "https://www.tiktok.com/@jek.dev",
  },
];

const getTaskByKey = (taskKey) =>
  TASK_CATALOG.find((task) => task.key === taskKey) || null;

class TaskService {
  getCatalog() {
    return TASK_CATALOG;
  }

  async getMySubmissions(userId) {
    return db("task_submissions")
      .where({ user_id: userId })
      .orderBy("created_at", "desc");
  }

  async submitTask(userId, { taskKey, submittedValue }) {
    const task = getTaskByKey(taskKey);
    if (!task) {
      throw new Error("Selected task is not available.");
    }

    const existing = await db("task_submissions")
      .where({ user_id: userId, task_key: taskKey })
      .whereIn("status", ["pending", "approved"])
      .orderBy("created_at", "desc")
      .first();

    if (existing?.status === "pending") {
      throw new Error("You already have a pending submission for this task.");
    }

    if (existing?.status === "approved") {
      throw new Error("This task reward has already been claimed.");
    }

    const [id] = await db("task_submissions").insert({
      user_id: userId,
      task_key: task.key,
      task_title: task.title,
      submitted_value: submittedValue.trim(),
      reward_credits: task.rewardCredits,
      status: "pending",
    });

    return db("task_submissions").where({ id }).first();
  }

  async getPendingSubmissions() {
    return db("task_submissions")
      .join("users", "task_submissions.user_id", "users.id")
      .select("task_submissions.*", "users.email")
      .where("task_submissions.status", "pending")
      .orderBy("task_submissions.created_at", "asc");
  }

  async approveSubmission(submissionId, adminId, notes) {
    const trx = await db.transaction();

    try {
      const submission = await trx("task_submissions")
        .where({ id: submissionId })
        .first();

      if (!submission) {
        throw new Error("Task submission not found.");
      }

      if (submission.status !== "pending") {
        throw new Error("Task submission is already processed.");
      }

      await trx("task_submissions").where({ id: submissionId }).update({
        status: "approved",
        admin_id: adminId,
        admin_notes: notes?.trim() || null,
        approved_at: db.fn.now(),
        updated_at: db.fn.now(),
      });

      await trx("users")
        .where({ id: submission.user_id })
        .increment("balance", submission.reward_credits);

      await trx("credit_transactions").insert({
        user_id: submission.user_id,
        amount: submission.reward_credits,
        type: "topup",
        description: `Free task reward: ${submission.task_title}`,
      });

      await notificationService.createNotification(
        submission.user_id,
        {
          type: "success",
          title: "Task reward approved",
          message: `${submission.reward_credits} free credits were added for "${submission.task_title}".`,
        },
        trx,
      );

      await trx("audit_logs").insert({
        user_id: adminId,
        action: "APPROVE_TASK_REWARD",
        details: `Approved task submission #${submissionId} for user ${submission.user_id}`,
      });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  async rejectSubmission(submissionId, adminId, notes) {
    const trx = await db.transaction();

    try {
      const submission = await trx("task_submissions")
        .where({ id: submissionId })
        .first();

      if (!submission) {
        throw new Error("Task submission not found.");
      }

      if (submission.status !== "pending") {
        throw new Error("Task submission is already processed.");
      }

      await trx("task_submissions").where({ id: submissionId }).update({
        status: "rejected",
        admin_id: adminId,
        admin_notes: notes?.trim() || null,
        updated_at: db.fn.now(),
      });

      await notificationService.createNotification(
        submission.user_id,
        {
          type: "error",
          title: "Task claim rejected",
          message: notes?.trim()
            ? `Your "${submission.task_title}" claim was rejected. Note: ${notes.trim()}`
            : `Your "${submission.task_title}" claim was rejected.`,
        },
        trx,
      );

      await trx("audit_logs").insert({
        user_id: adminId,
        action: "REJECT_TASK_REWARD",
        details: `Rejected task submission #${submissionId} for user ${submission.user_id}`,
      });

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }
}

module.exports = new TaskService();
