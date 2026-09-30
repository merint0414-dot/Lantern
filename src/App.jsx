import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import KSRTC from "./pages/KSRTC";
import IRCTC from "./pages/IRCTC";
import Bharatgas from "./pages/Bharatgas";
import KSEB from "./pages/KSEB";
import NotFound from "./pages/NotFound";
import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main LANTERN Demo Home Portal */}
        <Route path="/" element={<Home />} />

        {/* Four Interactive Public Service Demonstrations */}
        <Route path="/ksrtc" element={<KSRTC />} />
        <Route path="/irctc" element={<IRCTC />} />
        <Route path="/bharatgas" element={<Bharatgas />} />
        <Route path="/kseb" element={<KSEB />} />

        {/* 404 Handlers */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}