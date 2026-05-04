import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/useAuthStore";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  QrCode,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Info,
  AlertCircle,
  ShieldCheck,
  Loader2,
  ArrowRight,
  Wallet,
  Sparkles,
  SlidersHorizontal,
  Type,
  Move,
  Palette,
  RotateCcw,
  History,
  CreditCard,
  Gift,
  Lock,
  UserPlus,
  LogIn,
} from "lucide-react";
import QRCodeStyling from "qr-code-styling";

const defaultFrameSettings = {
  qrX: 19,
  qrY: 14,
  qrSize: 60,
  qrForeground: "#111111",
  qrBackground: "#ffffff",
  qrDotStyle: "square",
  qrCornerSquareStyle: "square",
  qrCornerDotStyle: "square",
  qrShape: "square",
  nameX: 50,
  nameY: 86,
  nameSize: 3.2,
  nameColor: "#d977a8",
  nameWidth: 42,
  fontFamily: "Trebuchet MS",
  fontWeight: 700,
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const fontOptions = [
  "Trebuchet MS",
  "Arial",
  "Verdana",
  "Georgia",
  "Courier New",
];

const qrStylePresets = [
  {
    id: "classic",
    label: "Classic",
    description: "Standard square QR pattern for maximum compatibility.",
    dots: "square",
    cornersSquare: "square",
    cornersDot: "square",
    shape: "square",
  },
  {
    id: "rounded",
    label: "Rounded",
    description: "Soft rounded modules with cleaner corners.",
    dots: "rounded",
    cornersSquare: "extra-rounded",
    cornersDot: "dot",
    shape: "square",
  },
  {
    id: "dots",
    label: "Dots",
    description: "Circle-like modules with rounded finder details.",
    dots: "dots",
    cornersSquare: "dot",
    cornersDot: "dot",
    shape: "square",
  },
  {
    id: "classy",
    label: "Classy",
    description: "More stylized pattern while staying scan-safe.",
    dots: "classy-rounded",
    cornersSquare: "extra-rounded",
    cornersDot: "dot",
    shape: "square",
  },
];

const getQrStylePreset = (settings) =>
  qrStylePresets.find(
    (preset) =>
      preset.dots === settings.qrDotStyle &&
      preset.cornersSquare === settings.qrCornerSquareStyle &&
      preset.cornersDot === settings.qrCornerDotStyle &&
      preset.shape === settings.qrShape,
  ) || qrStylePresets[0];

const createQrCodeOptions = ({ payload, size, settings }) => ({
  width: size,
  height: size,
  type: "canvas",
  shape: settings.qrShape || "square",
  data: payload,
  margin: 0,
  qrOptions: {
    errorCorrectionLevel: "Q",
  },
  dotsOptions: {
    color: settings.qrForeground,
    type: settings.qrDotStyle || "square",
    roundSize: false,
  },
  cornersSquareOptions: {
    color: settings.qrForeground,
    type: settings.qrCornerSquareStyle || "square",
  },
  cornersDotOptions: {
    color: settings.qrForeground,
    type: settings.qrCornerDotStyle || "square",
  },
  backgroundOptions: {
    color: settings.qrBackground,
  },
});

const blobToImage = (blob) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(blob);
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to load generated QR image."));
    };
    image.src = objectUrl;
  });

const frameSettingsMap = {
  "1.png": {
    qrX: 15.8,
    qrY: 12.2,
    qrSize: 64.2,
    nameY: 88.1,
    nameSize: 3.05,
    nameColor: "#e48ab2",
    nameWidth: 44,
  },
  "2.png": {
    qrX: 17.6,
    qrY: 12.6,
    qrSize: 63,
    nameY: 87.5,
    nameSize: 3.05,
    nameColor: "#dc78ae",
    nameWidth: 43,
  },
  "3.png": {
    qrX: 16.7,
    qrY: 12.1,
    qrSize: 63.8,
    nameY: 87.4,
    nameSize: 3,
    nameColor: "#f0a4cf",
    nameWidth: 45,
  },
  "4.png": {
    qrX: 16.9,
    qrY: 14.2,
    qrSize: 60.5,
    nameY: 87.9,
    nameSize: 2.9,
    nameColor: "#ba895f",
    nameWidth: 44,
  },
  "5.png": {
    qrX: 16.8,
    qrY: 11.7,
    qrSize: 63.5,
    nameY: 87.8,
    nameSize: 3,
    nameColor: "#caa5f5",
    nameWidth: 44,
  },
  "6.png": {
    qrX: 18.4,
    qrY: 15.2,
    qrSize: 59.2,
    nameY: 82.9,
    nameSize: 2.85,
    nameColor: "#db7eb6",
    nameWidth: 42,
  },
  "7.png": {
    qrX: 16.8,
    qrY: 12.8,
    qrSize: 62,
    nameY: 86.8,
    nameSize: 2.95,
    nameColor: "#d884b5",
    nameWidth: 42,
  },
  "8.png": {
    qrX: 16.8,
    qrY: 12.9,
    qrSize: 62.3,
    nameY: 87.4,
    nameSize: 3,
    nameColor: "#e6739b",
    nameWidth: 43,
  },
  "9.png": {
    qrX: 16.8,
    qrY: 13.7,
    qrSize: 61.4,
    nameY: 87.7,
    nameSize: 2.95,
    nameColor: "#da77a8",
    nameWidth: 43,
  },
  "11.png": {
    qrX: 19.1,
    qrY: 12.8,
    qrSize: 59.5,
    nameY: 88.2,
    nameSize: 2.95,
    nameColor: "#d977a8",
    nameWidth: 47,
  },
  "14.png": {
    qrX: 18.7,
    qrY: 12.8,
    qrSize: 60.1,
    nameY: 87.8,
    nameSize: 3,
    nameColor: "#e697c3",
    nameWidth: 47,
  },
  "15.png": {
    qrX: 18.1,
    qrY: 13.2,
    qrSize: 61.2,
    nameY: 88.1,
    nameSize: 2.95,
    nameColor: "#d37b44",
    nameWidth: 44,
  },
  "16.png": {
    qrX: 16.5,
    qrY: 12.7,
    qrSize: 63.1,
    nameY: 87.9,
    nameSize: 2.95,
    nameColor: "#df7fae",
    nameWidth: 43,
  },
  "17.png": {
    qrX: 16.6,
    qrY: 13.1,
    qrSize: 62.1,
    nameY: 88.4,
    nameSize: 2.9,
    nameColor: "#ffffff",
    nameWidth: 41,
  },
  "18.png": {
    qrX: 16.7,
    qrY: 13.2,
    qrSize: 62,
    nameY: 88.3,
    nameSize: 2.9,
    nameColor: "#ffffff",
    nameWidth: 41,
  },
  "19.png": {
    qrX: 18.4,
    qrY: 13,
    qrSize: 60.2,
    nameY: 88.2,
    nameSize: 2.9,
    nameColor: "#ffffff",
    nameWidth: 40,
  },
  "20.png": {
    qrX: 16.4,
    qrY: 13.7,
    qrSize: 62.4,
    nameY: 88.8,
    nameSize: 2.8,
    nameColor: "#ffffff",
    nameWidth: 41,
  },
};

const frameImageFiles = [
  "1.png",
  "2.png",
  "3.png",
  "4.png",
  "5.png",
  "6.png",
  "7.png",
  "8.png",
  "9.png",
  "11.png",
  "14.png",
  "15.png",
  "16.png",
  "17.png",
  "18.png",
  "19.png",
  "20.png",
];

const getFrameLabel = (fileName) => {
  const frameNumber = fileName.replace(".png", "");

  if (frameNumber === "2") {
    return {
      name: "Bunny Cute",
      description: "Pastel bunny frame with a name label below the QR.",
    };
  }

  return {
    name: `Frame ${frameNumber}`,
    description: "Decorative QR frame for branded QR downloads.",
  };
};

const framePresets = [
  {
    id: "none",
    name: "Standard QR",
    description: "Download the updated QR without a design frame.",
    src: "",
    settings: null,
  },
  ...frameImageFiles.map((fileName) => {
    const label = getFrameLabel(fileName);

    return {
      id: `frame-${fileName.replace(".png", "")}`,
      name: label.name,
      description: label.description,
      src: `/frames/${fileName}`,
      settings: frameSettingsMap[fileName] || defaultFrameSettings,
    };
  }),
];

const guestLockedFeatures = [
  {
    title: "History",
    description: "Saved QR generations and quick re-downloads.",
    icon: History,
    accent: "from-blue-500/20 to-cyan-500/5",
    preview: "history",
  },
  {
    title: "Buy Credits",
    description: "Submit payment proofs and keep your balance topped up.",
    icon: CreditCard,
    accent: "from-emerald-500/20 to-teal-500/5",
    preview: "credits",
  },
  {
    title: "Free Tasks",
    description: "Claim free credits after approved task submissions.",
    icon: Gift,
    accent: "from-fuchsia-500/20 to-pink-500/5",
    preview: "tasks",
  },
];

const LockedFeaturePreview = ({ type }) => {
  if (type === "history") {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/10 bg-slate-900/70 p-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-24 rounded-full bg-white/15" />
              <div className="h-2.5 w-12 rounded-full bg-blue-400/25" />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-white/10" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-4/5 rounded-full bg-white/10" />
                <div className="h-3 w-2/3 rounded-full bg-white/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "credits") {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-3 w-20 rounded-full bg-white/15" />
              <div className="mt-2 h-7 w-16 rounded-xl bg-emerald-400/20" />
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/10" />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="h-3 w-24 rounded-full bg-white/15" />
          <div className="mt-3 grid gap-2">
            <div className="h-11 rounded-xl border border-white/10 bg-slate-950/70" />
            <div className="h-11 rounded-xl border border-white/10 bg-slate-950/70" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-20 rounded-full bg-white/15" />
          <div className="h-6 w-16 rounded-full bg-fuchsia-400/20" />
        </div>
        <div className="mt-3 space-y-2">
          <div className="h-10 rounded-xl border border-white/10 bg-slate-950/70" />
          <div className="h-10 rounded-xl border border-white/10 bg-slate-950/70" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="h-3 w-14 rounded-full bg-white/15" />
          <div className="mt-3 h-8 rounded-xl bg-white/10" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3">
          <div className="h-3 w-14 rounded-full bg-white/15" />
          <div className="mt-3 h-8 rounded-xl bg-white/10" />
        </div>
      </div>
    </div>
  );
};

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("Unable to load the selected frame design."));
    image.src = src;
  });

const getFittedFrameFontSize = ({
  text,
  frameWidth,
  nameSize,
  maxTextWidth,
  minFontSize,
  fontFamily,
  fontWeight,
}) => {
  const baseFontSize = Math.max(minFontSize, (nameSize / 50) * frameWidth);

  if (
    !text ||
    typeof document === "undefined" ||
    !frameWidth ||
    !maxTextWidth
  ) {
    return baseFontSize;
  }

  const measureCanvas = document.createElement("canvas");
  const measureContext = measureCanvas.getContext("2d");

  if (!measureContext) {
    return baseFontSize;
  }

  let fontSize = baseFontSize;

  do {
    measureContext.font = `${fontWeight || 700} ${fontSize}px ${fontFamily || "Arial"}`;
    fontSize -= 1;
  } while (
    measureContext.measureText(text).width > maxTextWidth &&
    fontSize > minFontSize
  );

  return Math.max(fontSize, minFontSize);
};

const StyledQrCode = ({
  payload,
  size,
  settings,
  className = "",
  wrapperClassName = "",
  displayWidth = size,
  displayHeight = size,
}) => {
  const [qrImageUrl, setQrImageUrl] = useState("");
  const qrOptions = useMemo(
    () => createQrCodeOptions({ payload, size, settings }),
    [payload, settings, size],
  );

  useEffect(() => {
    if (!payload) {
      setQrImageUrl("");
      return undefined;
    }

    let cancelled = false;
    let objectUrl = "";

    const renderQrImage = async () => {
      const qrCode = new QRCodeStyling(qrOptions);
      const qrBlob = await qrCode.getRawData("png");

      if (!(qrBlob instanceof Blob) || cancelled) {
        return;
      }

      objectUrl = URL.createObjectURL(qrBlob);
      setQrImageUrl(objectUrl);
    };

    renderQrImage().catch(() => {
      if (!cancelled) {
        setQrImageUrl("");
      }
    });

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [payload, qrOptions]);

  if (!payload) {
    return (
      <div className={`flex items-center justify-center ${wrapperClassName}`}>
        <div className="text-sm text-slate-500">QR preview unavailable</div>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${wrapperClassName}`}
      style={{
        backgroundColor: settings.qrBackground,
        width: displayWidth,
        height: displayHeight,
      }}
    >
      {qrImageUrl ? (
        <img
          src={qrImageUrl}
          alt="Styled QR"
          className={className}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            objectFit: "contain",
            imageRendering: "pixelated",
          }}
        />
      ) : (
        <div
          className={`flex items-center justify-center text-xs text-slate-500 ${className}`}
          style={{ width: "100%", height: "100%" }}
        >
          Rendering QR...
        </div>
      )}
    </div>
  );
};

const FramePreview = ({
  frame,
  payload,
  name,
  settingsOverride,
  className = "",
  qrCanvasSize = 720,
  plainQrSize = 240,
  framedTextScale = 0.58,
  editable = false,
  activeLayer = "qr",
  onLayerChange,
  onSettingsChange,
}) => {
  const settings = {
    ...defaultFrameSettings,
    ...(frame.settings || {}),
    ...(settingsOverride || {}),
  };
  const previewRef = useRef(null);
  const [previewWidth, setPreviewWidth] = useState(0);
  const dragStateRef = useRef(null);

  useEffect(() => {
    if (!frame.src || !previewRef.current) {
      return undefined;
    }

    const previewNode = previewRef.current;
    const updateWidth = () => {
      setPreviewWidth(previewNode.getBoundingClientRect().width);
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      updateWidth();
    });

    observer.observe(previewNode);

    return () => {
      observer.disconnect();
    };
  }, [frame.src]);

  const previewNameWidth =
    previewWidth *
    ((settings.nameWidth || defaultFrameSettings.nameWidth) / 100);
  const fittedPreviewFontSize = getFittedFrameFontSize({
    text: name,
    frameWidth: previewWidth,
    nameSize: settings.nameSize,
    maxTextWidth: previewNameWidth,
    minFontSize: 10,
    fontFamily: settings.fontFamily,
    fontWeight: settings.fontWeight,
  });

  const stopDragging = () => {
    dragStateRef.current = null;
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", stopDragging);
  };

  function handlePointerMove(event) {
    if (!dragStateRef.current || !previewRef.current || !onSettingsChange) return;

    const { layer, startX, startY, origin } = dragStateRef.current;
    const rect = previewRef.current.getBoundingClientRect();
    const deltaX = ((event.clientX - startX) / rect.width) * 100;
    const deltaY = ((event.clientY - startY) / rect.height) * 100;

    if (layer === "qr") {
      const nextQrX = clamp(origin.qrX + deltaX, 0, 100 - origin.qrSize);
      const nextQrY = clamp(origin.qrY + deltaY, 0, 100 - origin.qrSize);
      onSettingsChange({ qrX: nextQrX, qrY: nextQrY });
      return;
    }

    const halfWidth = origin.nameWidth / 2;
    const nextNameX = clamp(origin.nameX + deltaX, halfWidth, 100 - halfWidth);
    const nextNameY = clamp(origin.nameY + deltaY, 5, 95);
    onSettingsChange({ nameX: nextNameX, nameY: nextNameY });
  }

  const startDragging = (layer, event) => {
    if (!editable || !frame.src || !previewRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    onLayerChange?.(layer);
    dragStateRef.current = {
      layer,
      startX: event.clientX,
      startY: event.clientY,
      origin: {
        qrX: settings.qrX,
        qrY: settings.qrY,
        qrSize: settings.qrSize,
        nameX: settings.nameX,
        nameY: settings.nameY,
        nameWidth: settings.nameWidth,
      },
    };
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
  };

  useEffect(() => stopDragging, []);

  if (!frame.src) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center ${className}`}
      >
        {payload ? (
          <div className="inline-flex rounded-3xl bg-white p-4 shadow-lg shadow-black/10">
            <StyledQrCode
              payload={payload}
              size={plainQrSize}
              settings={settings}
              className="overflow-hidden"
              displayWidth={plainQrSize}
              displayHeight={plainQrSize}
            />
          </div>
        ) : (
          <div className="text-sm text-slate-500">Plain QR only</div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={previewRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
    >
      <img
        src={frame.src}
        alt={frame.name}
        className="absolute inset-0 h-full w-full object-contain"
      />

      {payload && (
        <>
          <div
            className="absolute overflow-hidden"
            style={{
              left: `${settings.qrX}%`,
              top: `${settings.qrY}%`,
              width: `${settings.qrSize}%`,
              height: `${settings.qrSize}%`,
            }}
            onPointerDown={(event) => startDragging("qr", event)}
          >
            <div
              className={`h-full w-full overflow-hidden bg-white ${
                editable
                  ? activeLayer === "qr"
                    ? "cursor-move ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900"
                    : "cursor-move ring-1 ring-white/35"
                  : ""
              }`}
              style={{ backgroundColor: settings.qrBackground }}
            >
              <StyledQrCode
                payload={payload}
                size={qrCanvasSize}
                settings={settings}
                className="overflow-hidden"
                wrapperClassName="h-full w-full"
                displayWidth="100%"
                displayHeight="100%"
              />
            </div>
          </div>

          <div
            className={`absolute overflow-hidden whitespace-nowrap text-center ${
              editable
                ? activeLayer === "text"
                  ? "cursor-move rounded-full ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-900"
                  : "cursor-move rounded-full ring-1 ring-white/35"
                : ""
            }`}
            style={{
              top: `${settings.nameY}%`,
              width: `${settings.nameWidth || 42}%`,
              left: `${settings.nameX || 50}%`,
              transform: "translate(-50%, -50%)",
              color: settings.nameColor,
              fontSize: previewWidth
                ? `${fittedPreviewFontSize}px`
                : `${settings.nameSize * framedTextScale}rem`,
              lineHeight: 1,
              fontFamily: settings.fontFamily,
              fontWeight: settings.fontWeight,
            }}
            onPointerDown={(event) => startDragging("text", event)}
          >
            {name}
          </div>
        </>
      )}
    </div>
  );
};

const DashboardPage = () => {
  const { user, updateUser } = useAuthStore();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [authPrompt, setAuthPrompt] = useState(null);

  // States for the QR process
  const [decodedInfo, setDecodedInfo] = useState(null);
  const [originalPayload, setOriginalPayload] = useState("");
  const [customName, setCustomName] = useState("");
  const [generatedPayload, setGeneratedPayload] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [selectedFrameId, setSelectedFrameId] = useState("none");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [activeEditorLayer, setActiveEditorLayer] = useState("qr");
  const [frameEditorSettings, setFrameEditorSettings] = useState(() =>
    Object.fromEntries(
      framePresets
        .filter((frame) => frame.src)
        .map((frame) => [
          frame.id,
          {
            ...defaultFrameSettings,
            ...(frame.settings || {}),
          },
        ]),
    ),
  );

  const fileInputRef = useRef(null);
  const frameRailRef = useRef(null);
  const selectedFrame =
    framePresets.find((frame) => frame.id === selectedFrameId) ||
    framePresets[0];
  const selectedFrameSettings = selectedFrame.src
    ? frameEditorSettings[selectedFrame.id] || {
        ...defaultFrameSettings,
        ...(selectedFrame.settings || {}),
      }
    : defaultFrameSettings;

  const updateSelectedFrameSettings = (updates) => {
    if (!selectedFrame.src) return;

    setFrameEditorSettings((current) => ({
      ...current,
      [selectedFrame.id]: {
        ...(current[selectedFrame.id] || defaultFrameSettings),
        ...updates,
      },
    }));
  };

  const resetSelectedFrameSettings = () => {
    if (!selectedFrame.src) return;

    setFrameEditorSettings((current) => ({
      ...current,
      [selectedFrame.id]: {
        ...defaultFrameSettings,
        ...(selectedFrame.settings || {}),
      },
    }));
    setActiveEditorLayer("qr");
  };

  const scrollFrameRail = (direction) => {
    if (!frameRailRef.current) return;

    frameRailRef.current.scrollBy({
      left: direction * 320,
      behavior: "smooth",
    });
  };

  const handleFrameSelect = (frameId) => {
    setSelectedFrameId(frameId);
    setActiveEditorLayer("qr");

    const frameElement = document.getElementById(`frame-card-${frameId}`);
    frameElement?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const requireLogin = (title, description) => {
    setAuthPrompt({ title, description });
  };

  const handleFileUpload = async (e) => {
    if (!isAuthenticated) {
      e.target.value = "";
      requireLogin(
        "Login first to access this page",
        "Create an account or sign in to upload a QR, customize the display name, and generate downloadable QRPH outputs.",
      );
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setDecodedInfo(null);
    setGeneratedPayload("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await api.post("/qr/decode", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const data = response.data.data;
      setDecodedInfo(data);

      if (data.raw) {
        let p = "";
        Object.keys(data.raw).forEach((tag) => {
          p += `${tag}${data.raw[tag].length}${data.raw[tag].value}`;
        });
        setOriginalPayload(p);
      }

      setCustomName(data.merchantName || "");
      setSuccess(
        "QR code uploaded successfully. You can now update the display name.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to read this QR code. Please upload a clear QRPH image.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!isAuthenticated) {
      requireLogin(
        "Login first to access this page",
        "Sign in to generate updated QRPH outputs, use credits, and save your history.",
      );
      return;
    }

    if (!agreed) {
      setError(
        "Please confirm the Important Display Notice before generating a new QR.",
      );
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/qr/generate", {
        payload: originalPayload,
        customName: customName,
      });

      const { newPayload, remainingBalance } = response.data.data;
      setGeneratedPayload(newPayload);
      updateUser({ balance: remainingBalance });
      setSuccess("Your updated QR is ready to download.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to generate a new QR right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = async () => {
    if (!isAuthenticated) {
      requireLogin(
        "Login first to access this page",
        "Sign in to download generated QR files, unlock framed exports, and keep your QR history.",
      );
      return;
    }

    try {
      setDownloadLoading(true);
      setError("");

      const qrCode = new QRCodeStyling(
        createQrCodeOptions({
          payload: generatedPayload,
          size: 1024,
          settings: selectedFrameSettings,
        }),
      );
      const qrBlob = await qrCode.getRawData("png");

      if (!(qrBlob instanceof Blob)) {
        throw new Error("Unable to prepare the QR image for download.");
      }

      if (!selectedFrame.src) {
        const url = URL.createObjectURL(qrBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `QRPH_${customName.replace(/\s+/g, "_")}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      const frame = await loadImage(selectedFrame.src);
      const qrImage = await blobToImage(qrBlob);
      const exportCanvas = document.createElement("canvas");
      const context = exportCanvas.getContext("2d");

      if (!context) {
        throw new Error("Unable to prepare the final QR design.");
      }

      exportCanvas.width = frame.naturalWidth || 1024;
      exportCanvas.height = frame.naturalHeight || 1024;

      context.drawImage(frame, 0, 0, exportCanvas.width, exportCanvas.height);

      const qrSize = (selectedFrameSettings.qrSize / 100) * exportCanvas.width;
      const qrX = (selectedFrameSettings.qrX / 100) * exportCanvas.width;
      const qrY = (selectedFrameSettings.qrY / 100) * exportCanvas.height;
      const nameY = (selectedFrameSettings.nameY / 100) * exportCanvas.height;
      const maxTextWidth =
        exportCanvas.width * ((selectedFrameSettings.nameWidth || 42) / 100);

      const qrBackgroundSize = qrSize * 1.02;
      const qrBackgroundOffset = (qrBackgroundSize - qrSize) / 2;
      context.fillStyle = selectedFrameSettings.qrBackground;
      context.fillRect(
        qrX - qrBackgroundOffset,
        qrY - qrBackgroundOffset,
        qrBackgroundSize,
        qrBackgroundSize,
      );
      context.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      const fontSize = getFittedFrameFontSize({
        text: customName,
        frameWidth: exportCanvas.width,
        nameSize: selectedFrameSettings.nameSize,
        maxTextWidth,
        minFontSize: 22,
        fontFamily: selectedFrameSettings.fontFamily,
        fontWeight: selectedFrameSettings.fontWeight,
      });

      context.textAlign = "center";
      context.textBaseline = "middle";

      context.font = `${selectedFrameSettings.fontWeight || 700} ${fontSize}px ${selectedFrameSettings.fontFamily || "Arial"}`;

      context.fillStyle = selectedFrameSettings.nameColor;
      context.fillText(
        customName,
        exportCanvas.width * ((selectedFrameSettings.nameX || 50) / 100),
        nameY,
        maxTextWidth,
      );

      const url = exportCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `QRPH_${customName.replace(/\s+/g, "_")}_framed.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(err.message || "Unable to export the framed QR right now.");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      {!isAuthenticated && (
        <div className="rounded-3xl border border-blue-500/20 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(15,23,42,0.92))] px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                <Sparkles className="h-3.5 w-3.5" />
                3 free credits on signup
              </div>
              <p className="text-sm font-semibold text-white">
                You are viewing the dashboard in guest mode
              </p>
              <p className="mt-1 text-sm leading-6 text-blue-100/85">
                Explore the real QRPH customizer first. Create an account to upload,
                generate, download, save history, buy credits, and access free
                tasks.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-2xl border border-blue-200/20 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100"
              >
                Create account
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            <Sparkles className="h-3.5 w-3.5" />
            QRPH Customizer
          </div>
          <h1 className="text-2xl font-bold text-white">
            Customize your QRPH display name
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-2.5">
            <Wallet className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-slate-400">Credits:</span>
            <span className="text-lg font-semibold text-white">
              {isAuthenticated ? user?.balance || 0 : "Login required"}
            </span>
          </div>
          {isAuthenticated ? (
            <Link
              to="/buy-credits"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Buy credits
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() =>
                requireLogin(
                  "Login first to access this page",
                  "Sign in to buy credits, submit payment proofs, and unlock QR generation.",
                )
              }
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              Buy credits
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-300">
          <CheckCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-400">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                1. Upload your QR code
              </h2>
              <p className="text-xs text-slate-400">
                Clear QRPH image for best detection
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!isAuthenticated) {
                requireLogin(
                  "Login first to access this page",
                  "Sign in to upload your QRPH image and start the customization flow.",
                );
                return;
              }

              fileInputRef.current?.click();
            }}
            className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/60 px-6 py-10 text-center transition-colors hover:border-blue-500/40 hover:bg-slate-950"
          >
            <div className="mb-3 rounded-xl bg-slate-800 p-3 text-slate-300">
              {loading ? (
                <Loader2 className="h-7 w-7 animate-spin" />
              ) : (
                <QrCode className="h-7 w-7" />
              )}
            </div>
            <p className="text-sm font-medium text-white">
              {loading ? "Reading QR code..." : "Click to upload a QR image"}
            </p>
            <p className="mt-1 text-xs text-slate-500">PNG or JPG format</p>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*"
          />
        </section>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                2. Update the display name
              </h2>
              <p className="text-xs text-slate-400">
                Customize the visible merchant name
              </p>
            </div>
          </div>

          {decodedInfo ? (
            <div className="space-y-4">
              <div className="grid gap-3 grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-500">Detected name</p>
                  <p className="mt-1 text-sm font-semibold text-white break-words">
                    {decodedInfo.merchantName || "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-500">Characters</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {customName.length}/25
                  </p>
                </div>
              </div>

              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                maxLength={25}
                className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500"
                placeholder="ENTER DISPLAY NAME"
              />

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-100">
                <p className="font-medium text-amber-300">
                  Important Display Notice
                </p>
                <p className="mt-1 text-amber-100/90">
                  Display may vary depending on wallet, bank, or QR source.
                  Legitimate customization only.
                </p>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-600"
                />
                <span className="text-xs leading-5 text-slate-300">
                  I understand that display results may vary across supported
                  apps and banks.
                </span>
              </label>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || (isAuthenticated && (!agreed || !customName.trim()))}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Generate updated QR
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-10 text-center">
              <p className="text-sm font-medium text-white">
                No QR uploaded yet
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Upload a QRPH image first to review and update the display name.
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-xl bg-pink-500/10 p-2.5 text-pink-300">
            <SlidersHorizontal className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-white">
              3. Choose a design
            </h2>
            <p className="text-xs text-slate-400">
              Pick a frame template before adjusting the final layout.
            </p>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollFrameRail(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
              aria-label="Previous frames"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollFrameRail(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/60 text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
              aria-label="Next frames"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between gap-3 text-xs text-slate-500 md:hidden">
          <span>Swipe horizontally to browse all frame designs.</span>
          <span>{framePresets.length - 1} frames</span>
        </div>

        <div
          ref={frameRailRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3"
        >
          {framePresets.map((frame) => {
            const isActive = selectedFrameId === frame.id;

            return (
              <button
                id={`frame-card-${frame.id}`}
                key={frame.id}
                type="button"
                onClick={() => handleFrameSelect(frame.id)}
                className={`w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl border text-left transition-colors sm:w-[320px] ${
                  isActive
                    ? "border-pink-400 bg-pink-500/10"
                    : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                }`}
              >
                <div className="aspect-square w-full border-b border-slate-800 bg-slate-900/80 p-3">
                  <FramePreview
                    frame={frame}
                    payload={frame.src ? "" : generatedPayload}
                    name={customName || "NAME"}
                    settingsOverride={
                      frame.src
                        ? frameEditorSettings[frame.id] || frame.settings
                        : null
                    }
                    className="rounded-2xl"
                    qrCanvasSize={256}
                    plainQrSize={150}
                    framedTextScale={0.36}
                  />
                </div>

                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">
                      {frame.name}
                    </p>
                    {isActive && (
                      <span className="rounded-full bg-pink-500/15 px-2 py-0.5 text-xs font-medium text-pink-300">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {frame.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {generatedPayload && !selectedFrame.src && (
          <button
            type="button"
            onClick={downloadQR}
            disabled={downloadLoading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloadLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {selectedFrame.src ? "Download framed QR" : "Download QR image"}
          </button>
        )}
      </section>

      {generatedPayload && selectedFrame.src && (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-300">
              <Move className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                4. Adjust your template
              </h2>
              <p className="text-xs text-slate-400">
                Drag the QR or text directly on the frame, then fine-tune the controls.
              </p>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_360px]">
            <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveEditorLayer("qr")}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                    activeEditorLayer === "qr"
                      ? "bg-cyan-500/15 text-cyan-200"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <Move className="h-4 w-4" />
                  Move QR
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEditorLayer("text")}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                    activeEditorLayer === "text"
                      ? "bg-amber-500/15 text-amber-200"
                      : "bg-slate-900 text-slate-400 hover:text-white"
                  }`}
                >
                  <Type className="h-4 w-4" />
                  Move text
                </button>
                <button
                  type="button"
                  onClick={resetSelectedFrameSettings}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset frame
                </button>
              </div>

              <div className="mx-auto aspect-square max-w-[640px]">
                <FramePreview
                  frame={selectedFrame}
                  payload={generatedPayload}
                  name={customName || "NAME"}
                  settingsOverride={selectedFrameSettings}
                  className="rounded-3xl"
                  qrCanvasSize={512}
                  plainQrSize={240}
                  editable={true}
                  activeLayer={activeEditorLayer}
                  onLayerChange={setActiveEditorLayer}
                  onSettingsChange={updateSelectedFrameSettings}
                />
              </div>
            </div>

            <div className="space-y-5 rounded-3xl border border-slate-800 bg-slate-950/50 p-5">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Move className="h-4 w-4 text-cyan-300" />
                  <h3 className="text-sm font-semibold text-white">QR placement</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="mb-2 block text-xs text-slate-400">QR pattern</span>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {qrStylePresets.map((preset) => {
                        const isActive =
                          getQrStylePreset(selectedFrameSettings).id === preset.id;

                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() =>
                              updateSelectedFrameSettings({
                                qrDotStyle: preset.dots,
                                qrCornerSquareStyle: preset.cornersSquare,
                                qrCornerDotStyle: preset.cornersDot,
                                qrShape: preset.shape,
                              })
                            }
                            className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                              isActive
                                ? "border-cyan-400 bg-cyan-500/10"
                                : "border-slate-700 bg-slate-900 hover:border-slate-600"
                            }`}
                          >
                            <p className="text-sm font-medium text-white">{preset.label}</p>
                            <p className="mt-1 text-[11px] leading-5 text-slate-400">
                              {preset.description}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs text-slate-400">QR color</span>
                      <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
                        <Palette className="h-4 w-4 text-slate-400" />
                        <input
                          type="color"
                          value={selectedFrameSettings.qrForeground}
                          onChange={(event) =>
                            updateSelectedFrameSettings({
                              qrForeground: event.target.value,
                            })
                          }
                          className="h-8 w-12 cursor-pointer border-0 bg-transparent p-0"
                        />
                        <span className="text-xs text-slate-400">
                          {selectedFrameSettings.qrForeground}
                        </span>
                      </div>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-slate-400">QR background</span>
                      <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
                        <Palette className="h-4 w-4 text-slate-400" />
                        <input
                          type="color"
                          value={selectedFrameSettings.qrBackground}
                          onChange={(event) =>
                            updateSelectedFrameSettings({
                              qrBackground: event.target.value,
                            })
                          }
                          className="h-8 w-12 cursor-pointer border-0 bg-transparent p-0"
                        />
                        <span className="text-xs text-slate-400">
                          {selectedFrameSettings.qrBackground}
                        </span>
                      </div>
                    </label>
                  </div>

                  <label className="block">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                      <span>QR size</span>
                      <span>{selectedFrameSettings.qrSize.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="35"
                      max="72"
                      step="0.5"
                      value={selectedFrameSettings.qrSize}
                      onChange={(event) =>
                        updateSelectedFrameSettings({
                          qrSize: Number(event.target.value),
                          qrX: clamp(
                            selectedFrameSettings.qrX,
                            0,
                            100 - Number(event.target.value),
                          ),
                          qrY: clamp(
                            selectedFrameSettings.qrY,
                            0,
                            100 - Number(event.target.value),
                          ),
                        })
                      }
                      className="w-full"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                        <span>QR horizontal</span>
                        <span>{selectedFrameSettings.qrX.toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.max(0, 100 - selectedFrameSettings.qrSize)}
                        step="0.5"
                        value={selectedFrameSettings.qrX}
                        onChange={(event) =>
                          updateSelectedFrameSettings({
                            qrX: Number(event.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </label>
                    <label className="block">
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                        <span>QR vertical</span>
                        <span>{selectedFrameSettings.qrY.toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={Math.max(0, 100 - selectedFrameSettings.qrSize)}
                        step="0.5"
                        value={selectedFrameSettings.qrY}
                        onChange={(event) =>
                          updateSelectedFrameSettings({
                            qrY: Number(event.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Type className="h-4 w-4 text-amber-300" />
                  <h3 className="text-sm font-semibold text-white">Text styling</h3>
                </div>
                <div className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-xs text-slate-400">Display text</span>
                    <input
                      type="text"
                      value={customName}
                      onChange={(event) =>
                        setCustomName(event.target.value.toUpperCase())
                      }
                      maxLength={25}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1 block text-xs text-slate-400">Font</span>
                    <select
                      value={selectedFrameSettings.fontFamily}
                      onChange={(event) =>
                        updateSelectedFrameSettings({
                          fontFamily: event.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                    >
                      {fontOptions.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-xs text-slate-400">Weight</span>
                      <select
                        value={selectedFrameSettings.fontWeight}
                        onChange={(event) =>
                          updateSelectedFrameSettings({
                            fontWeight: Number(event.target.value),
                          })
                        }
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500"
                      >
                        <option value={600}>Semi Bold</option>
                        <option value={700}>Bold</option>
                        <option value={800}>Extra Bold</option>
                      </select>
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-slate-400">Text color</span>
                      <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2">
                        <Palette className="h-4 w-4 text-slate-400" />
                        <input
                          type="color"
                          value={selectedFrameSettings.nameColor}
                          onChange={(event) =>
                            updateSelectedFrameSettings({
                              nameColor: event.target.value,
                            })
                          }
                          className="h-8 w-12 cursor-pointer border-0 bg-transparent p-0"
                        />
                        <span className="text-xs text-slate-400">
                          {selectedFrameSettings.nameColor}
                        </span>
                      </div>
                    </label>
                  </div>

                  <label className="block">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                      <span>Text size</span>
                      <span>{selectedFrameSettings.nameSize.toFixed(2)}rem</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="4.6"
                      step="0.05"
                      value={selectedFrameSettings.nameSize}
                      onChange={(event) =>
                        updateSelectedFrameSettings({
                          nameSize: Number(event.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                        <span>Text horizontal</span>
                        <span>{selectedFrameSettings.nameX.toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min={selectedFrameSettings.nameWidth / 2}
                        max={100 - selectedFrameSettings.nameWidth / 2}
                        step="0.5"
                        value={selectedFrameSettings.nameX}
                        onChange={(event) =>
                          updateSelectedFrameSettings({
                            nameX: Number(event.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </label>
                    <label className="block">
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                        <span>Text vertical</span>
                        <span>{selectedFrameSettings.nameY.toFixed(1)}%</span>
                      </div>
                      <input
                        type="range"
                        min="72"
                        max="94"
                        step="0.5"
                        value={selectedFrameSettings.nameY}
                        onChange={(event) =>
                          updateSelectedFrameSettings({
                            nameY: Number(event.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </label>
                  </div>

                  <label className="block">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                      <span>Text width</span>
                      <span>{selectedFrameSettings.nameWidth.toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="28"
                      max="58"
                      step="0.5"
                      value={selectedFrameSettings.nameWidth}
                      onChange={(event) => {
                        const nextWidth = Number(event.target.value);
                        updateSelectedFrameSettings({
                          nameWidth: nextWidth,
                          nameX: clamp(
                            selectedFrameSettings.nameX,
                            nextWidth / 2,
                            100 - nextWidth / 2,
                          ),
                        });
                      }}
                      className="w-full"
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={downloadQR}
                disabled={downloadLoading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloadLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download framed QR
              </button>
            </div>
          </div>
        </section>
      )}

      {!isAuthenticated && (
        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
                <Lock className="h-3.5 w-3.5" />
                Login required
              </div>
              <h2 className="text-lg font-semibold text-white">
                Locked previews from your private workspace
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                These pages stay visible in the dashboard, but account access is
                required before you can use them.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 self-start rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
            >
              <UserPlus className="h-4 w-4" />
              Create account
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {guestLockedFeatures.map((feature) => (
              <div
                key={feature.title}
                className={`relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br ${feature.accent} p-4`}
              >
                <div className="pointer-events-none absolute inset-0 bg-slate-950/45 backdrop-blur-md" />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="rounded-2xl bg-slate-900/90 p-3 text-slate-200">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-amber-200">
                      <Lock className="h-3 w-3" />
                      Locked
                    </div>
                  </div>

                  <LockedFeaturePreview type={feature.preview} />

                  <div className="mt-6 rounded-2xl border border-slate-700/80 bg-slate-950/85 p-4">
                    <p className="text-sm font-semibold text-white">{feature.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {feature.description}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        requireLogin(
                          "Login first to access this page",
                          `Sign in to open ${feature.title.toLowerCase()} and use this part of the dashboard.`,
                        )
                      }
                      className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-500/20"
                    >
                      Unlock this page
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-3 text-xs text-slate-400">
        <Info className="h-4 w-4 text-blue-400 shrink-0" />
        <span>1 credit per generation</span>
        <span className="text-slate-700">•</span>
        <span>Display may vary by wallet/bank</span>
        <span className="text-slate-700">•</span>
        <span>Test with small payment first</span>
      </div>

      {!isAuthenticated && (
        <div className="sticky bottom-4 z-30 pt-2">
          <div className="rounded-3xl border border-blue-500/25 bg-slate-950/95 px-4 py-4 shadow-2xl shadow-slate-950/60 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  3 free credits on signup
                </div>
                <p className="text-sm font-semibold text-white">
                  Create an account to unlock generation, history, credits, and free tasks.
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  The public dashboard is for preview. The actual QR workflow starts after sign in.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:border-slate-600 hover:text-white"
                >
                  <LogIn className="h-4 w-4" />
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500"
                >
                  <UserPlus className="h-4 w-4" />
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!authPrompt}
        title={authPrompt?.title || "Login required"}
        description={authPrompt?.description}
        confirmLabel="Go to login"
        cancelLabel="Maybe later"
        loading={false}
        onConfirm={() => navigate("/login", { state: { from: "/dashboard" } })}
        onCancel={() => setAuthPrompt(null)}
      />
    </div>
  );
};

export default DashboardPage;
