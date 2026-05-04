import { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Download,
  QrCode,
  Calendar,
  Search,
  History as HistoryIcon,
  AlertCircle,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get("/qr/history");
      setHistory(response.data.data);
    } catch (err) {
      setError("Failed to load your QR history.");
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = (payload, name) => {
    const canvas = document.createElement("canvas");
    // We need to render the QR to a hidden canvas first
    // But since qrcode.react is a component, we'll use a simpler approach:
    // Finding the canvas by a temporary ID or just using a utility.
    // For now, I'll just use a hidden canvas in the row.
    const rowCanvas = document.getElementById(
      `qr-canvas-${payload.substring(0, 10)}`,
    );
    if (!rowCanvas) return;

    const url = rowCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `QRPH_${name.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredHistory = history.filter((item) =>
    item.custom_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
            <HistoryIcon className="h-3.5 w-3.5" />
            QR history
          </div>
          <h1 className="text-3xl font-bold text-white">
            Generated QR history
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Review your previous QR generations and download them again anytime.
          </p>
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by display name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-4 h-8 w-8 rounded-full border-4 border-blue-500/20 border-t-blue-400 animate-spin" />
            <p className="text-sm text-slate-400">Loading your history...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
              <QrCode className="h-8 w-8" />
            </div>
            <p className="text-lg font-semibold text-white">
              {searchTerm ? "No matching records found" : "No QR history yet"}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {searchTerm
                ? "Try a different search term."
                : "Your generated QR codes will appear here after you create one."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-slate-800 bg-slate-950/50 p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="rounded-2xl bg-slate-800 p-3 text-blue-400 shrink-0">
                      <QrCode className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-white break-words">
                        {item.custom_name}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {new Date(item.created_at).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                        <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs text-slate-300">
                          {item.qr_source || "QRPH"}
                        </span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500 break-all">
                        Payload preview:{" "}
                        {item.modified_payload.substring(0, 32)}...
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        downloadQR(item.modified_payload, item.custom_name)
                      }
                      className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>

                    <div className="hidden">
                      <QRCodeCanvas
                        id={`qr-canvas-${item.modified_payload.substring(0, 10)}`}
                        value={item.modified_payload}
                        size={1024}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6 text-blue-100">
        <p className="text-lg font-semibold text-white">Helpful note</p>
        <p className="mt-2 text-sm leading-6 text-blue-100/90">
          Downloading from history does not use extra credits. Keep testing with
          supported wallets and banks to confirm how the display name appears in
          real transactions.
        </p>
      </div>
    </div>
  );
};

export default HistoryPage;
