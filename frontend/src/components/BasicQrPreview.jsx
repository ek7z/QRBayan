import { useEffect, useState } from "react";
import { generateQrBlob } from "../utils/qrImage";

const BasicQrPreview = ({
  value,
  size = 260,
  alt = "QR code",
  className = "",
}) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!value) {
      setImageUrl("");
      return undefined;
    }

    let cancelled = false;
    let objectUrl = "";

    const renderQr = async () => {
      const blob = await generateQrBlob(value, Math.max(size * 2, 512));

      if (cancelled) {
        return;
      }

      objectUrl = URL.createObjectURL(blob);
      setImageUrl(objectUrl);
    };

    renderQr().catch(() => {
      if (!cancelled) {
        setImageUrl("");
      }
    });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [size, value]);

  if (!value || !imageUrl) {
    return null;
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      style={{
        width: size,
        height: size,
        display: "block",
        imageRendering: "pixelated",
      }}
    />
  );
};

export default BasicQrPreview;
