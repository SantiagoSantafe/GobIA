import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Landing from "./pages/Landing.jsx";
import Metodologia from "./pages/Metodologia.jsx";
import { DashboardLayout } from "./components/DashboardLayout.jsx";
import Alertas from "./pages/dashboard/Alertas.jsx";
import Contratos from "./pages/dashboard/Contratos.jsx";
import Historico from "./pages/dashboard/Historico.jsx";
import Radar from "./pages/dashboard/Radar.jsx";
import Score from "./pages/dashboard/Score.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="alertas" replace />} />
          <Route path="alertas"   element={<Alertas />} />
          <Route path="contratos" element={<Contratos />} />
          <Route path="historico" element={<Historico />} />
          <Route path="radar"     element={<Radar />} />
          <Route path="score"     element={<Score />} />
        </Route>
        <Route path="/metodologia" element={<Metodologia />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
