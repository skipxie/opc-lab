import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { usePolicyMapStore } from "@/stores/usePolicyMapStore";

export default function ToastHost() {
  const message = usePolicyMapStore((s) => s.toastMessage);
  const clear = usePolicyMapStore((s) => s.clearToast);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) return;
    setVisible(true);
    const t = window.setTimeout(() => {
      setVisible(false);
      window.setTimeout(() => clear(), 220);
    }, 1800);
    return () => window.clearTimeout(t);
  }, [message, clear]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-6">
      <div
        className={cn(
          "rounded-xl bg-slate-900 px-4 py-2 text-sm text-white shadow-lg transition",
          visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        )}
      >
        {message}
      </div>
    </div>
  );
}

