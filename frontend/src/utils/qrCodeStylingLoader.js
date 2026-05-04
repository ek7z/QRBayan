let qrCodeStylingPromise;

export const getQrCodeStyling = async () => {
  if (!qrCodeStylingPromise) {
    qrCodeStylingPromise = import("qr-code-styling").then(
      (module) => module.default,
    );
  }

  return qrCodeStylingPromise;
};
