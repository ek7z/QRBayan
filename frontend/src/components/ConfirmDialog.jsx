import { AlertTriangle, Loader2, X } from "lucide-react";

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const confirmClassName =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-500"
      : "bg-indigo-600 hover:bg-indigo-500";

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-300">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 id="confirm-dialog-title" className="text-lg font-semibold text-white">
                {title}
              </h2>
              {description && (
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {description}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-slate-600 hover:text-white disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${confirmClassName}`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
