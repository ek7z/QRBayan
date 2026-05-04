import { getQrCodeStyling } from "./qrCodeStylingLoader";

const MAX_BASIC_QR_CACHE_ENTRIES = 40;
const qrObjectUrlCache = new Map();

const createBasicQrOptions = (data, size) => ({
  width: size,
  height: size,
  type: "canvas",
  data,
  margin: 1,
  qrOptions: {
    errorCorrectionLevel: "H",
  },
  dotsOptions: {
    color: "#111111",
    type: "square",
    roundSize: false,
  },
  cornersSquareOptions: {
    color: "#111111",
    type: "square",
  },
  cornersDotOptions: {
    color: "#111111",
    type: "square",
  },
  backgroundOptions: {
    color: "#ffffff",
  },
});

const getBasicQrCacheKey = (data, size) => `${size}::${data}`;

const rememberQrObjectUrl = (key, objectUrl) => {
  if (qrObjectUrlCache.has(key)) {
    qrObjectUrlCache.delete(key);
  }

  qrObjectUrlCache.set(key, objectUrl);

  if (qrObjectUrlCache.size > MAX_BASIC_QR_CACHE_ENTRIES) {
    const oldestKey = qrObjectUrlCache.keys().next().value;
    const oldestObjectUrl = qrObjectUrlCache.get(oldestKey);
    qrObjectUrlCache.delete(oldestKey);

    if (oldestObjectUrl) {
      URL.revokeObjectURL(oldestObjectUrl);
    }
  }
};

export const generateQrBlob = async (data, size = 1024) => {
  const QRCodeStyling = await getQrCodeStyling();
  const qrCode = new QRCodeStyling(createBasicQrOptions(data, size));
  const blob = await qrCode.getRawData("png");

  if (!(blob instanceof Blob)) {
    throw new Error("Unable to generate QR image.");
  }

  return blob;
};

export const getCachedQrObjectUrl = async (data, size = 1024) => {
  const cacheKey = getBasicQrCacheKey(data, size);

  if (qrObjectUrlCache.has(cacheKey)) {
    return qrObjectUrlCache.get(cacheKey);
  }

  const blob = await generateQrBlob(data, size);
  const objectUrl = URL.createObjectURL(blob);
  rememberQrObjectUrl(cacheKey, objectUrl);
  return objectUrl;
};

export const downloadQrImage = async (data, fileName, size = 1024) => {
  const objectUrl = await getCachedQrObjectUrl(data, size);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
