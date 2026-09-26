import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useLumen } from "../context/LumenContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useLumen();

  if (!toasts || toasts.length === 0) return null;

  return (
    <aside className="toast-container" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => {
        let IconComponent = Info;
        let iconClass = "toast-icon-info";
        if (toast.type === "success") {
          IconComponent = CheckCircle2;
          iconClass = "toast-icon-success";
        } else if (toast.type === "warning") {
          IconComponent = AlertTriangle;
          iconClass = "toast-icon-warning";
        } else if (toast.type === "danger" || toast.type === "error") {
          IconComponent = AlertCircle;
          iconClass = "toast-icon-danger";
        }

        return (
          <div key={toast.id} className={`toast-card toast-${toast.type || "info"}`}>
            <div className={`toast-icon ${iconClass}`}>
              <IconComponent size={16} />
            </div>
            <div className="toast-body">
              <strong>{toast.title}</strong>
              {toast.message && <p>{toast.message}</p>}
            </div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </aside>
  );
}
