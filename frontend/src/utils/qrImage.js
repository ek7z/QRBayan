import QRCodeStyling from "qr-code-styling";

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

export const generateQrBlob = async (data, size = 1024) => {
  const qrCode = new QRCodeStyling(createBasicQrOptions(data, size));
  const blob = await qrCode.getRawData("png");

  if (!(blob instanceof Blob)) {
    throw new Error("Unable to generate QR image.");
  }

  return blob;
};

export const downloadQrImage = async (data, fileName, size = 1024) => {
  const blob = await generateQrBlob(data, size);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
};
