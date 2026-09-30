import { Link } from "react-router-dom";
import { Compass, Home, Bus, Train, Flame, Zap } from "lucide-react";
import DemoNotice from "../components/DemoNotice";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function NotFound() {
  return (
    <div className="lantern-page-shell">
      <DemoNotice />
      <SiteHeader />

      <main id="main-content" className="portal-main-area">
        <div className="lantern-container not-found-wrapper">
          <div className="not-found-card">
            <div className="not-found-icon-box" aria-hidden="true">
              <Compass size={64} className="compass-icon" />
            </div>

            <span className="not-found-badge">Error 404</span>
            <h1 className="not-found-title">Page Not Found</h1>
            <p className="not-found-desc">
              The requested demo route or page does not exist on the LANTERN Accessibility Demo Portal.
            </p>

            <div className="not-found-actions">
              <Link to="/" className="btn-primary" data-lantern-action="return-home">
                <Home size={18} aria-hidden="true" />
                <span>Return to LANTERN Hub</span>
              </Link>
            </div>

            <div className="available-routes-list">
              <span className="available-routes-title">Available Interactive Demonstrations:</span>
              <div className="routes-pills">
                <Link to="/ksrtc" className="route-pill">
                  <Bus size={14} aria-hidden="true" />
                  <span>KSRTC Bus Booking</span>
                </Link>
                <Link to="/irctc" className="route-pill">
                  <Train size={14} aria-hidden="true" />
                  <span>IRCTC Railway Booking</span>
                </Link>
                <Link to="/bharatgas" className="route-pill">
                  <Flame size={14} aria-hidden="true" />
                  <span>Bharatgas LPG Booking</span>
                </Link>
                <Link to="/kseb" className="route-pill">
                  <Zap size={14} aria-hidden="true" />
                  <span>KSEB Electricity Payment</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
