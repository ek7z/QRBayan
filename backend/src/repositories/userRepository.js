const db = require('../config/db');

class UserRepository {
  async findByEmail(email) {
    return db('users').where({ email }).first();
  }

  async findById(id) {
    return db('users').where({ id }).first();
  }

  async create(userData) {
    const [id] = await db('users').insert(userData);
    return this.findById(id);
  }

  async updateBalance(id, newBalance) {
    return db('users').where({ id }).update({ balance: newBalance, updated_at: db.fn.now() });
  }

  async findAllWithAdminStats() {
    const proofStats = db("payment_proofs")
      .select("user_id")
      .count({ proof_count: "id" })
      .sum({
        approved_credit_total: db.raw(
          "CASE WHEN status = ? THEN amount ELSE 0 END",
          ["approved"],
        ),
      })
      .max({ latest_proof_at: "created_at" })
      .groupBy("user_id")
      .as("proof_stats");

    const taskStats = db("task_submissions")
      .select("user_id")
      .count({ task_claim_count: "id" })
      .sum({
        task_credit_total: db.raw(
          "CASE WHEN status = ? THEN reward_credits ELSE 0 END",
          ["approved"],
        ),
      })
      .groupBy("user_id")
      .as("task_stats");

    const adjustmentStats = db("credit_transactions")
      .select("user_id")
      .sum({
        manual_credit_total: db.raw(
          "CASE WHEN type = ? THEN amount ELSE 0 END",
          ["admin_adjustment"],
        ),
      })
      .groupBy("user_id")
      .as("adjustment_stats");

    const qrStats = db("generated_qrs")
      .select("user_id")
      .count({ generated_count: "id" })
      .groupBy("user_id")
      .as("qr_stats");

    return db("users")
      .leftJoin(proofStats, "users.id", "proof_stats.user_id")
      .leftJoin(taskStats, "users.id", "task_stats.user_id")
      .leftJoin(adjustmentStats, "users.id", "adjustment_stats.user_id")
      .leftJoin(qrStats, "users.id", "qr_stats.user_id")
      .select(
        "users.id",
        "users.email",
        "users.role",
        "users.balance",
        "users.created_at",
        "users.updated_at",
        db.raw("COALESCE(qr_stats.generated_count, 0) as generated_count"),
        db.raw("COALESCE(proof_stats.proof_count, 0) as proof_count"),
        db.raw(
          "COALESCE(proof_stats.approved_credit_total, 0) as approved_credit_total",
        ),
        db.raw("COALESCE(task_stats.task_claim_count, 0) as task_claim_count"),
        db.raw("COALESCE(task_stats.task_credit_total, 0) as task_credit_total"),
        db.raw(
          "COALESCE(adjustment_stats.manual_credit_total, 0) as manual_credit_total",
        ),
        "proof_stats.latest_proof_at",
      )
      .orderBy("users.created_at", "desc");
  }
}

module.exports = new UserRepository();
