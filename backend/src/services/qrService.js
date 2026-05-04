const qrPH = require("../utils/qrPH");
const jsqr = require("jsqr");
const { Jimp } = require("jimp");
const path = require("path");

class QRService {
  /**
   * Decodes a QR code image from a file path
   */
  async decodeImage(filePath) {
    try {
      // Ensure absolute path for robustness on Windows
      const absolutePath = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);

      const image = await Jimp.read(absolutePath);
      const { data, width, height } = image.bitmap;
      const code = jsqr(new Uint8ClampedArray(data), width, height);

      if (!code) {
        throw new Error("QR_NOT_FOUND: UNABLE TO DETECT MATRIX IN IMAGE");
      }

      return this.decode(code.data);
    } catch (error) {
      console.error("Service Decode Error:", error);
      throw new Error(
        error.message || "ENGINE_FAILURE: UNABLE TO PROCESS ASSET",
      );
    }
  }

  /**
   * Decodes a QRPH payload and returns basic info
   */
  async decode(payload) {
    try {
      const tags = qrPH.parseTLV(payload);

      // Basic validation - check if it's a valid EMVCo QR
      if (!tags["00"] || !tags["59"]) {
        throw new Error("Invalid or unsupported QR payload");
      }

      return {
        merchantName: tags["59"]?.value || "Unknown",
        merchantCity: tags["60"]?.value || "",
        amount: tags["54"]?.value || null,
        currency: tags["53"]?.value === "608" ? "PHP" : tags["53"]?.value,
        raw: tags,
      };
    } catch (error) {
      throw new Error("Failed to decode QR: " + error.message);
    }
  }

  /**
   * Generates a new QR payload with a custom name
   */
  async generateCustomQR(originalPayload, newName) {
    try {
      const tags = qrPH.parseTLV(originalPayload);

      if (!tags["59"]) {
        throw new Error("Could not find merchant name tag (59) in original QR");
      }

      // Update merchant name
      // Limit to standard length (usually max 25 characters for many wallets)
      const sanitizedName = newName.substring(0, 25).toUpperCase();
      tags["59"] = {
        length: sanitizedName.length.toString().padStart(2, "0"),
        value: sanitizedName,
      };

      const newPayload = qrPH.serializeTLV(tags);
      return {
        payload: newPayload,
        customName: sanitizedName,
      };
    } catch (error) {
      throw new Error("Failed to generate custom QR: " + error.message);
    }
  }
}

module.exports = new QRService();
