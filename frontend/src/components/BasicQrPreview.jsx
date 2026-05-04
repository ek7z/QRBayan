import { useEffect, useState } from "react";
import { getCachedQrObjectUrl } from "../utils/qrImage";

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

    const renderQr = async () => {
      const objectUrl = await getCachedQrObjectUrl(value, Math.max(size * 2, 512));

      if (cancelled) return;
      setImageUrl(objectUrl);
    };

    renderQr().catch(() => {
      if (!cancelled) {
        setImageUrl("");
      }
    });

    return () => {
      cancelled = true;
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
