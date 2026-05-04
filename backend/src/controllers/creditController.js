const creditService = require("../services/creditService");
const db = require("../config/db");

class CreditController {
  // User endpoints
  async getPackages(req, res, next) {
    try {
      const packages = await db("credit_packages")
        .where("is_active", true)
        .orderBy("price", "asc");
      res.json({ success: true, data: packages });
    } catch (error) {
      next(error);
    }
  }

  async uploadProof(req, res, next) {
    try {
      const { amount, referenceNumber } = req.body;
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "Payment proof image is required" });
      }

      const proof = await creditService.submitPaymentProof(req.user.id, {
        amount: parseFloat(amount),
        referenceNumber,
        imagePath: req.file.path,
      });

      res.status(201).json({
        success: true,
        message: "Payment proof submitted successfully. Pending admin review.",
        data: proof,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyTransactions(req, res, next) {
    try {
      const transactions = await db("credit_transactions")
        .where({ user_id: req.user.id })
        .orderBy("created_at", "desc");

      res.json({ success: true, data: transactions });
    } catch (error) {
      next(error);
    }
  }

  async getMyProofs(req, res, next) {
    try {
      const proofs = await db("payment_proofs")
        .where({ user_id: req.user.id })
        .orderBy("created_at", "desc");

      res.json({ success: true, data: proofs });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoints
  async getAllPendingProofs(req, res, next) {
    try {
      const proofs = await db("payment_proofs")
        .join("users", "payment_proofs.user_id", "users.id")
        .select("payment_proofs.*", "users.email")
        .where("status", "pending")
        .orderBy("created_at", "asc");

      res.json({ success: true, data: proofs });
    } catch (error) {
      next(error);
    }
  }

  async approveProof(req, res, next) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      await creditService.approvePaymentProof(id, req.user.id, notes);
      res.json({
        success: true,
        message: "Payment proof approved and credits added.",
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectProof(req, res, next) {
    try {
      const { id } = req.params;
      const { notes } = req.body;
      await creditService.rejectPaymentProof(id, req.user.id, notes);
      res.json({ success: true, message: "Payment proof rejected." });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CreditController();
