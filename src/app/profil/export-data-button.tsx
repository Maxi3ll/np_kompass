"use client";

import { useState } from "react";
import { exportUserData } from "@/lib/supabase/actions";
import { Download } from "lucide-react";

export function ExportDataButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportUserData();
      if (result.error) {
        alert("Fehler beim Export: " + result.error);
        return;
      }

      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `np-kompass-daten-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
    >
      <Download size={16} />
      {isExporting ? "Wird exportiert..." : "Meine Daten exportieren (JSON)"}
    </button>
  );
}
