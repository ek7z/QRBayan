import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useToast } from "../components/ToastProvider";
import {
  CreditCard,
  Upload,
  CheckCircle,
  AlertCircle,
  Clock,
  Image as ImageIcon,
  ChevronRight,
  ShieldCheck,
  History,
} from "lucide-react";

const BuyCreditsPage = () => {
  const { showToast } = useToast();
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [proofs, setProofs] = useState([]);

  const [referenceNumber, setReferenceNumber] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPackages();
    fetchMyProofs();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await api.get("/credits/packages");
      setPackages(response.data.data);
    } catch (err) {
      setError("Failed to load credit packages.");
      showToast({
        type: "error",
        title: "Could not load packages",
        message: "Please refresh and try again.",
      });
    }
  };

  const fetchMyProofs = async () => {
    try {
      const response = await api.get("/credits/my-proofs");
      setProofs(response.data.data);
    } catch (err) {
      console.error("Failed to load history");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPackage || !referenceNumber || !image) {
      const message =
        "Please select a package, enter reference number, and upload proof.";
      setError(message);
      showToast({ type: "error", title: "Missing details", message });
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("amount", selectedPackage.credits);
    formData.append("referenceNumber", referenceNumber);
    formData.append("packageId", selectedPackage.id);
    formData.append("image", image);

    try {
      await api.post("/credits/upload-proof", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showToast({
        type: "success",
        title: "Proof submitted",
        message: "Please wait for admin approval before credits are added.",
      });
      setReferenceNumber("");
      setImage(null);
      setImagePreview(null);
      setSelectedPackage(null);
      fetchMyProofs();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to submit proof. Please try again.";
      setError(message);
      showToast({ type: "error", title: "Submission failed", message });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/10 text-amber-300 border-amber-500/20";
      case "approved":
        return "bg-green-500/10 text-green-300 border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-300 border-red-500/20";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Buy credits</h1>
          <p className="mt-2 text-sm text-slate-400">
            Choose a package, upload your payment proof, and wait for admin
            approval.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Payment review available
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-blue-500/10 p-3 text-blue-400">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  1. Choose a package
                </h2>
                <p className="text-sm text-slate-400">
                  Select the credit amount you want to purchase.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  onClick={() => setSelectedPackage(pkg)}
                  className={`rounded-3xl border p-5 text-left transition-colors ${
                    selectedPackage?.id === pkg.id
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                  }`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-2xl bg-slate-800 p-3 text-slate-300">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    {selectedPackage?.id === pkg.id && (
                      <CheckCircle className="h-5 w-5 text-blue-400" />
                    )}
                  </div>
                  <p className="text-lg font-semibold text-white">{pkg.name}</p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    ₱{pkg.price}
                  </p>
                  <p className="mt-3 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                    {pkg.credits} credits
                  </p>
                </button>
              ))}
            </div>
          </div>

          {selectedPackage && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-400">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    2. Submit payment details
                  </h2>
                  <p className="text-sm text-slate-400">
                    Scan the payment QR, send the exact amount, then add your
                    reference number and upload your screenshot.
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-5">
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-5">
                    <p className="text-sm font-medium text-slate-300">
                      Scan this payment QR
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Use this QR to send your payment for the selected credit
                      package.
                    </p>

                    <div className="mt-5 overflow-hidden rounded-3xl border border-slate-800 bg-white p-4">
                      <img
                        src="/payment.png"
                        alt="Payment QR"
                        className="mx-auto h-auto w-full max-w-xs object-contain"
                      />
                    </div>

                    <div className="mt-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-100">
                      <p className="font-medium text-white">Amount to send</p>
                      <p className="mt-1 text-2xl font-bold">
                        PHP {selectedPackage.price}
                      </p>
                      <p className="mt-2 text-xs text-indigo-100/80">
                        After sending, copy the reference number from your
                        wallet or bank app and submit it below.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Reference number
                    </label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-white outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500"
                      placeholder="REF-0000-0000"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Payment proof
                    </label>
                    <div
                      onClick={() => fileInputRef.current.click()}
                      className="flex h-65 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-center transition-colors hover:border-indigo-500/40"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Proof"
                          className="h-full w-full rounded-2xl object-cover"
                        />
                      ) : (
                        <>
                          <div className="mb-4 rounded-2xl bg-slate-800 p-4 text-slate-400">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        <p className="font-medium text-white">
                          Upload payment screenshot
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          PNG or JPG format after you complete the payment
                        </p>
                      </>
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between gap-5 md:col-span-2">
                  <div className="rounded-3xl border border-slate-800 bg-slate-950/50 p-5">
                    <p className="text-sm font-medium text-slate-300">
                      Order summary
                    </p>
                    <div className="mt-5 space-y-4 text-sm">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Package</span>
                        <span className="font-medium text-white">
                          {selectedPackage.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Credits</span>
                        <span className="font-medium text-indigo-300">
                          +{selectedPackage.credits}
                        </span>
                      </div>
                      <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                        <span className="text-slate-400">Amount</span>
                        <span className="text-2xl font-bold text-white">
                          ₱{selectedPackage.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={loading || !referenceNumber || !image}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="animate-spin text-base">●</span>
                    ) : (
                      <>
                        Submit proof
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-800 p-3 text-blue-400">
                <History className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Recent submissions
                </h3>
                <p className="text-sm text-slate-400">
                  Track the status of your uploaded proofs.
                </p>
              </div>
            </div>

            {proofs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-10 text-center">
                <Clock className="mx-auto h-8 w-8 text-slate-500" />
                <p className="mt-3 font-medium text-white">
                  No submissions yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Your uploaded proofs will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-130 overflow-y-auto pr-1">
                {proofs.map((proof) => (
                  <div
                    key={proof.id}
                    className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-white">
                          #{proof.reference_number}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          ₱{proof.amount}
                        </p>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize ${getStatusColor(proof.status)}`}
                      >
                        {proof.status}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(proof.created_at).toLocaleDateString()} at{" "}
                      {new Date(proof.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>

                    {proof.admin_notes && (
                      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-slate-400">
                        Note: {proof.admin_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6 text-blue-100">
            <div className="mb-4 flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-300" />
              <h3 className="text-lg font-semibold text-white">How it works</h3>
            </div>
            <div className="space-y-3 text-sm">
              <p>1. Select a credit package.</p>
              <p>2. Scan the payment QR and send the exact amount.</p>
              <p>3. Upload the screenshot and reference number.</p>
              <p>4. Wait for admin approval before credits are added.</p>
            </div>
          </div>
        </div>
      </div>

      {success && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-200 shadow-2xl backdrop-blur">
          <CheckCircle className="h-5 w-5" />
          <span>{success}</span>
          <button
            onClick={() => setSuccess("")}
            className="text-green-200/70 hover:text-green-200"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 shadow-2xl backdrop-blur">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-200/70 hover:text-red-200"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default BuyCreditsPage;
