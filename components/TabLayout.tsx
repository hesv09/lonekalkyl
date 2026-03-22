"use client";

import { useState } from "react";
import Calculator from "./Calculator";
import Guide from "./Guide";

type Tab = "kalkylator" | "guide";

export default function TabLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("kalkylator");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Flik-navigation */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-4">
          <nav className="flex gap-0" role="tablist">
            {(
              [
                { id: "kalkylator", label: "Kalkylator" },
                { id: "guide", label: "Så funkar det" },
              ] as { id: Tab; label: string }[]
            ).map(({ id, label }) => (
              <button
                key={id}
                role="tab"
                aria-selected={activeTab === id}
                onClick={() => setActiveTab(id)}
                className={[
                  "relative px-5 py-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-indigo-500",
                  activeTab === id
                    ? "text-indigo-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-indigo-600 after:rounded-t-full"
                    : "text-gray-500 hover:text-gray-800",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Innehåll */}
      {activeTab === "kalkylator" ? <Calculator /> : <Guide />}
    </div>
  );
}
