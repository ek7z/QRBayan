import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Download,
  Globe,
  Link2,
  QrCode,
  Share2,
  UserRound,
  Wifi,
} from "lucide-react";
import { useToast } from "../components/ToastProvider";
import BasicQrPreview from "../components/BasicQrPreview";
import { downloadQrImage } from "../utils/qrImage";

const qrTypes = [
  {
    id: "url",
    label: "Link",
    description: "Website, landing page, form, or payment link.",
    icon: Link2,
  },
  {
    id: "wifi",
    label: "Wi-Fi",
    description: "Share SSID and password with one scan.",
    icon: Wifi,
  },
  {
    id: "contact",
    label: "Contact",
    description: "vCard QR for name, phone, email, and company.",
    icon: UserRound,
  },
  {
    id: "social",
    label: "Social",
    description: "Point users to your social media profile.",
    icon: Share2,
  },
];

const socialPlatforms = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "x", label: "X / Twitter" },
  { value: "youtube", label: "YouTube" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "whatsapp", label: "WhatsApp" },
];

const utilityQrSchema = z
  .object({
    qrType: z.enum(["url", "wifi", "contact", "social"]),
    url: z.string().optional(),
    wifiSsid: z.string().optional(),
    wifiPassword: z.string().optional(),
    wifiSecurity: z.enum(["WPA", "WEP", "nopass"]).default("WPA"),
    wifiHidden: z.boolean().default(false),
    contactName: z.string().optional(),
    contactPhone: z.string().optional(),
    contactEmail: z.string().optional(),
    contactOrg: z.string().optional(),
    contactWebsite: z.string().optional(),
    socialPlatform: z.string().optional(),
    socialValue: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.qrType === "url" && !data.url?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "Link is required",
      });
    }

    if (data.qrType === "wifi" && !data.wifiSsid?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["wifiSsid"],
        message: "Wi-Fi name is required",
      });
    }

    if (
      data.qrType === "wifi" &&
      data.wifiSecurity !== "nopass" &&
      !data.wifiPassword?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["wifiPassword"],
        message: "Password is required for secured Wi-Fi",
      });
    }

    if (data.qrType === "contact" && !data.contactName?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["contactName"],
        message: "Contact name is required",
      });
    }

    if (
      data.qrType === "contact" &&
      !data.contactPhone?.trim() &&
      !data.contactEmail?.trim()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["contactPhone"],
        message: "Add at least a phone number or email",
      });
    }

    if (data.qrType === "social" && !data.socialPlatform) {
      ctx.addIssue({
        code: "custom",
        path: ["socialPlatform"],
        message: "Choose a platform",
      });
    }

    if (data.qrType === "social" && !data.socialValue?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["socialValue"],
        message: "Username or profile link is required",
      });
    }
  });

const normalizeUrl = (value) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
};

const escapeWifiValue = (value = "") =>
  value.replace(/([\\;,":])/g, "\\$1");

const buildSocialUrl = (platform, value) => {
  const cleanedValue = value.trim();

  if (/^https?:\/\//i.test(cleanedValue)) {
    return cleanedValue;
  }

  switch (platform) {
    case "facebook":
      return `https://facebook.com/${cleanedValue.replace(/^@/, "")}`;
    case "instagram":
      return `https://instagram.com/${cleanedValue.replace(/^@/, "")}`;
    case "tiktok":
      return `https://www.tiktok.com/@${cleanedValue.replace(/^@/, "")}`;
    case "x":
      return `https://x.com/${cleanedValue.replace(/^@/, "")}`;
    case "youtube":
      return `https://youtube.com/${cleanedValue.replace(/^@/, "")}`;
    case "linkedin":
      return `https://linkedin.com/in/${cleanedValue.replace(/^@/, "")}`;
    case "whatsapp":
      return `https://wa.me/${cleanedValue.replace(/\D/g, "")}`;
    default:
      return cleanedValue;
  }
};

const buildUtilityPayload = (values) => {
  switch (values.qrType) {
    case "url":
      return normalizeUrl(values.url?.trim());
    case "wifi":
      return `WIFI:T:${values.wifiSecurity};S:${escapeWifiValue(
        values.wifiSsid?.trim(),
      )};P:${escapeWifiValue(values.wifiPassword?.trim())};H:${
        values.wifiHidden ? "true" : "false"
      };;`;
    case "contact":
      return [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `FN:${values.contactName?.trim() || ""}`,
        values.contactOrg?.trim() ? `ORG:${values.contactOrg.trim()}` : "",
        values.contactPhone?.trim() ? `TEL:${values.contactPhone.trim()}` : "",
        values.contactEmail?.trim() ? `EMAIL:${values.contactEmail.trim()}` : "",
        values.contactWebsite?.trim()
          ? `URL:${normalizeUrl(values.contactWebsite.trim())}`
          : "",
        "END:VCARD",
      ]
        .filter(Boolean)
        .join("\n");
    case "social":
      return buildSocialUrl(values.socialPlatform, values.socialValue || "");
    default:
      return "";
  }
};

const UtilityQrPage = () => {
  const { showToast } = useToast();
  const [generatedPayload, setGeneratedPayload] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(utilityQrSchema),
    defaultValues: {
      qrType: "url",
      url: "",
      wifiSsid: "",
      wifiPassword: "",
      wifiSecurity: "WPA",
      wifiHidden: false,
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      contactOrg: "",
      contactWebsite: "",
      socialPlatform: "facebook",
      socialValue: "",
    },
  });

  const selectedType = watch("qrType");
  const socialPlatform = watch("socialPlatform");

  const selectedTypeMeta = useMemo(
    () => qrTypes.find((item) => item.id === selectedType) || qrTypes[0],
    [selectedType],
  );

  const onSubmit = (values) => {
    const payload = buildUtilityPayload(values);
    setGeneratedPayload(payload);
    showToast({
      type: "success",
      title: "QR ready",
      message: "Your utility QR code is ready to preview and download.",
    });
  };

  const downloadQr = async () => {
    try {
      await downloadQrImage(
        generatedPayload,
        `UTILITY_QR_${selectedType.toUpperCase()}.png`,
        1024,
      );
    } catch (error) {
      showToast({
        type: "error",
        title: "Download failed",
        message: "Could not export this QR code. Please try again.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <Globe className="h-3.5 w-3.5" />
            Utility QR generator
          </div>
          <h1 className="text-3xl font-bold text-white">Create QR codes for everyday use</h1>
          <p className="mt-2 text-sm text-slate-400">
            Generate QR codes for links, Wi-Fi access, contact cards, and social profiles.
            Everything on this page is free to use. The paid credit-based flow only applies to the main dashboard QR customizer.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6"
        >
          <div>
            <h2 className="text-lg font-semibold text-white">1. Choose QR type</h2>
            <p className="mt-1 text-sm text-slate-400">
              Pick what kind of QR content you want to generate.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {qrTypes.map((type) => {
                const isActive = selectedType === type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setValue("qrType", type.id, { shouldValidate: true })}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      isActive
                        ? "border-emerald-400 bg-emerald-500/10"
                        : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                    }`}
                  >
                    <div className="mb-3 inline-flex rounded-xl bg-slate-800 p-2.5 text-emerald-300">
                      <type.icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-white">{type.label}</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">2. Fill in the details</h2>
            <p className="mt-1 text-sm text-slate-400">
              Enter the content to encode into the QR code.
            </p>

            <div className="mt-4 space-y-4">
              {selectedType === "url" && (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">Link</span>
                  <input
                    type="text"
                    {...register("url")}
                    placeholder="example.com or https://example.com"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-500"
                  />
                  {errors.url && (
                    <p className="mt-2 text-xs text-red-400">{errors.url.message}</p>
                  )}
                </label>
              )}

              {selectedType === "wifi" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Wi-Fi name</span>
                    <input
                      type="text"
                      {...register("wifiSsid")}
                      placeholder="My Home Wi-Fi"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-500"
                    />
                    {errors.wifiSsid && (
                      <p className="mt-2 text-xs text-red-400">{errors.wifiSsid.message}</p>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Security</span>
                    <select
                      {...register("wifiSecurity")}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-emerald-500"
                    >
                      <option value="WPA">WPA / WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">No password</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Password</span>
                    <input
                      type="text"
                      {...register("wifiPassword")}
                      placeholder="Wi-Fi password"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-500"
                    />
                    {errors.wifiPassword && (
                      <p className="mt-2 text-xs text-red-400">{errors.wifiPassword.message}</p>
                    )}
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3">
                    <input type="checkbox" {...register("wifiHidden")} className="h-4 w-4" />
                    <span className="text-sm text-slate-300">Hidden network</span>
                  </label>
                </div>
              )}

              {selectedType === "contact" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block md:col-span-2">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Full name</span>
                    <input
                      type="text"
                      {...register("contactName")}
                      placeholder="Juan Dela Cruz"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-500"
                    />
                    {errors.contactName && (
                      <p className="mt-2 text-xs text-red-400">{errors.contactName.message}</p>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Phone</span>
                    <input
                      type="text"
                      {...register("contactPhone")}
                      placeholder="+63 912 345 6789"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Email</span>
                    <input
                      type="text"
                      {...register("contactEmail")}
                      placeholder="name@example.com"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Company</span>
                    <input
                      type="text"
                      {...register("contactOrg")}
                      placeholder="Your business name"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-500"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Website</span>
                    <input
                      type="text"
                      {...register("contactWebsite")}
                      placeholder="yourwebsite.com"
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-500"
                    />
                  </label>

                  {(errors.contactPhone || errors.contactEmail) && (
                    <p className="text-xs text-red-400 md:col-span-2">
                      {errors.contactPhone?.message || errors.contactEmail?.message}
                    </p>
                  )}
                </div>
              )}

              {selectedType === "social" && (
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">Platform</span>
                    <select
                      {...register("socialPlatform")}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none focus:border-emerald-500"
                    >
                      {socialPlatforms.map((platform) => (
                        <option key={platform.value} value={platform.value}>
                          {platform.label}
                        </option>
                      ))}
                    </select>
                    {errors.socialPlatform && (
                      <p className="mt-2 text-xs text-red-400">
                        {errors.socialPlatform.message}
                      </p>
                    )}
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-300">
                      Username or profile link
                    </span>
                    <input
                      type="text"
                      {...register("socialValue")}
                      placeholder={
                        socialPlatform === "whatsapp"
                          ? "639123456789"
                          : "@yourhandle or full link"
                      }
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-emerald-500"
                    />
                    {errors.socialValue && (
                      <p className="mt-2 text-xs text-red-400">{errors.socialValue.message}</p>
                    )}
                  </label>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
          >
            <QrCode className="h-4 w-4" />
            Generate utility QR
          </button>
        </form>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-800 p-3 text-emerald-300">
              <selectedTypeMeta.icon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Preview</h2>
              <p className="text-sm text-slate-400">{selectedTypeMeta.description}</p>
            </div>
          </div>

          {generatedPayload ? (
            <div className="space-y-5">
              <div className="flex justify-center rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
                <BasicQrPreview
                  value={generatedPayload}
                  size={260}
                  alt="Utility QR code"
                />
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Encoded content
                </p>
                <p className="break-words text-sm text-slate-300">{generatedPayload}</p>
              </div>

              <button
                type="button"
                onClick={downloadQr}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100"
              >
                <Download className="h-4 w-4" />
                Download QR
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-14 text-center">
              <QrCode className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-3 font-medium text-white">No QR generated yet</p>
              <p className="mt-2 text-sm text-slate-500">
                Complete the form and generate a utility QR code.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UtilityQrPage;
