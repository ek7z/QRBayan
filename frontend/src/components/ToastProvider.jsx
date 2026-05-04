import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const toastStyles = {
  success: {
    icon: CheckCircle,
    className: "border-green-500/20 bg-green-500/10 text-green-100",
    iconClassName: "text-green-300",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-500/20 bg-red-500/10 text-red-100",
    iconClassName: "text-red-300",
  },
  info: {
    icon: Info,
    className: "border-blue-500/20 bg-blue-500/10 text-blue-100",
    iconClassName: "text-blue-300",
  },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message, duration = 4500 }) => {
      const id = crypto.randomUUID();
      setToasts((current) => [
        ...current,
        { id, type, title, message },
      ]);

      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-3 sm:bottom-6 sm:right-6">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] || toastStyles.info;
          const Icon = style.icon;

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur ${style.className}`}
              role="status"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${style.iconClassName}`} />
              <div className="min-w-0 flex-1">
                {toast.title && (
                  <p className="font-semibold text-white">{toast.title}</p>
                )}
                {toast.message && (
                  <p className="mt-0.5 break-words text-current/85">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="rounded-lg p-1 text-current/70 hover:bg-white/10 hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
};
