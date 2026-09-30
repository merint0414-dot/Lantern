import { Link, NavLink } from "react-router-dom";
import { Bus, Train, Flame, Zap, Compass, Sparkles } from "lucide-react";

export default function SiteHeader({ serviceId, title, subtitle, badgeText }) {
  const getServiceIcon = () => {
    switch (serviceId) {
      case "ksrtc":
        return <Bus className="service-header-icon" aria-hidden="true" />;
      case "irctc":
        return <Train className="service-header-icon" aria-hidden="true" />;
      case "bharatgas":
        return <Flame className="service-header-icon" aria-hidden="true" />;
      case "kseb":
        return <Zap className="service-header-icon" aria-hidden="true" />;
      default:
        return <Compass className="service-header-icon" aria-hidden="true" />;
    }
  };

  return (
    <header className={`site-header header-theme-${serviceId || "lantern"}`} role="banner">
      <div className="lantern-container header-inner">
        <div className="brand-zone">
          <Link to="/" className="brand-identity-link" aria-label="LANTERN Accessibility Hub Home">
            <div className="brand-logo-mark">
              <span className="lantern-glow"></span>
              <Sparkles size={20} className="brand-star" aria-hidden="true" />
            </div>
            <div className="brand-text-col">
              <div className="brand-super">
                <span className="brand-core">LANTERN</span>
                <span className="brand-tag">ASSIST</span>
              </div>
              <span className="brand-sub">Universal Web Accessibility</span>
            </div>
          </Link>

          {serviceId && (
            <div className="service-divider" aria-hidden="true">
              <span className="slash">/</span>
            </div>
          )}

          {serviceId && (
            <div className="current-service-branding">
              <div className="service-icon-wrapper" aria-hidden="true">
                {getServiceIcon()}
              </div>
              <div className="service-title-col">
                <div className="service-title-row">
                  <h1 className="service-heading">{title}</h1>
                  {badgeText && <span className="service-portal-tag">{badgeText}</span>}
                </div>
                {subtitle && <p className="service-subtext">{subtitle}</p>}
              </div>
            </div>
          )}
        </div>

        <nav className="header-nav" aria-label="Demo Websites Switcher">
          <ul className="nav-links-list">
            <li>
              <NavLink
                to="/ksrtc"
                className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
                title="KSRTC Bus Booking Demo"
              >
                <Bus size={16} aria-hidden="true" />
                <span>KSRTC Bus</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/irctc"
                className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
                title="IRCTC Railway Booking Demo"
              >
                <Train size={16} aria-hidden="true" />
                <span>IRCTC Train</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/bharatgas"
                className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
                title="Bharatgas LPG Booking Demo"
              >
                <Flame size={16} aria-hidden="true" />
                <span>Bharatgas</span>
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/kseb"
                className={({ isActive }) => `nav-link-item ${isActive ? "active" : ""}`}
                title="KSEB Electricity Bill Demo"
              >
                <Zap size={16} aria-hidden="true" />
                <span>KSEB Electricity</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
