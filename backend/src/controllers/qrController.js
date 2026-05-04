const qrService = require("../services/qrService");
const userRepository = require("../repositories/userRepository");
const db = require("../config/db");

class QRController {
  async decode(req, res, next) {
    try {
      let payload = req.body.payload;

      // If a file is uploaded, decode the image first
      if (req.file) {
        try {
          const decodedFromImage = await qrService.decodeImage(req.file.path);
          return res.json({
            success: true,
            data: decodedFromImage,
          });
        } catch (imgError) {
          return res.status(400).json({
            success: false,
            message:
              imgError.message ||
              "Failed to decode QR image. Please make sure the image is clear.",
          });
        }
      }

      if (!payload) {
        return res
          .status(400)
          .json({ success: false, message: "QR payload or image is required" });
      }

      const decoded = await qrService.decode(payload);
      res.json({
        success: true,
        data: decoded,
      });
    } catch (error) {
      console.error("Decode Error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Invalid QR payload",
      });
    }
  }

  async generate(req, res, next) {
    const trx = await db.transaction();
    try {
      const { payload, customName } = req.body;
      const userId = req.user.id;

      if (!payload || !customName) {
        return res.status(400).json({
          success: false,
          message: "Payload and custom name are required",
        });
      }

      // 1. Check balance
      const user = await userRepository.findById(userId);
      if (user.balance < 1) {
        return res.status(403).json({
          success: false,
          message: "Insufficient credits. Please top up.",
        });
      }

      // 2. Generate new QR
      const generated = await qrService.generateCustomQR(payload, customName);

      // 3. Deduct credit
      await trx("users").where({ id: userId }).decrement("balance", 1);

      // 4. Log transaction
      await trx("credit_transactions").insert({
        user_id: userId,
        amount: 1,
        type: "spend",
        description: `Generated QR for: ${generated.customName}`,
      });

      // 5. Save generation history
      await trx("generated_qrs").insert({
        user_id: userId,
        original_payload: payload,
        modified_payload: generated.payload,
        custom_name: generated.customName,
      });

      await trx.commit();

      res.json({
        success: true,
        message: "QR generated successfully. 1 credit deducted.",
        data: {
          newPayload: generated.payload,
          customName: generated.customName,
          remainingBalance: user.balance - 1,
        },
      });
    } catch (error) {
      await trx.rollback();
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await db("generated_qrs")
        .where({ user_id: req.user.id })
        .orderBy("created_at", "desc")
        .limit(50);

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new QRController();
