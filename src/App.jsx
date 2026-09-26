import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import AppShell from "./layouts/AppShell";
import MorphIntro from "./components/MorphIntro";
import CommandPalette from "./components/CommandPalette";

import { LumenProvider } from "./context/LumenContext";

import Overview from "./pages/Overview";
import Teams from "./pages/Teams";
import Signals from "./pages/Signals";
import CausalLab from "./pages/CausalLab";
import WhatIf from "./pages/WhatIf";
import Experiments from "./pages/Experiments";
import Privacy from "./pages/Privacy";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Integrations from "./pages/Integrations";

export default function App() {
  const [showIntro, setShowIntro] = useState(() => {
    return localStorage.getItem("lumen_intro_seen") !== "true";
  });

  const handleIntroComplete = () => {
    localStorage.setItem("lumen_intro_seen", "true");
    setShowIntro(false);
  };

  return (
    <LumenProvider>
      <BrowserRouter>
        {showIntro && (
          <MorphIntro onComplete={handleIntroComplete} />
        )}

        <CommandPalette />

        <AppShell>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/signals" element={<Signals />} />
            <Route path="/causal-lab" element={<CausalLab />} />
            <Route path="/what-if" element={<WhatIf />} />
            <Route path="/experiments" element={<Experiments />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/help" element={<Help />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </LumenProvider>
  );
}
