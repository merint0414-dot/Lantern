import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Eye, Type } from "lucide-react";

export default function DemoNotice({ currentService = "" }) {
  const [highContrast, setHighContrast] = useState(() => {
    return localStorage.getItem("lantern_contrast") === "true";
  });
  const [largeText, setLargeText] = useState(() => {
    return localStorage.getItem("lantern_large_text") === "true";
  });

  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add("high-contrast-mode");
    } else {
      document.documentElement.classList.remove("high-contrast-mode");
    }
    localStorage.setItem("lantern_contrast", highContrast);
  }, [highContrast]);

  useEffect(() => {
    if (largeText) {
      document.documentElement.classList.add("large-text-mode");
    } else {
      document.documentElement.classList.remove("large-text-mode");
    }
    localStorage.setItem("lantern_large_text", largeText);
  }, [largeText]);

  return (
    <aside
      className="lantern-demo-banner"
      role="region"
      aria-label="LANTERN Accessibility and Demonstration Notice"
    >
      <div className="lantern-container banner-content">
        <div className="banner-left">
          <div className="demo-badge" aria-hidden="true">
            <span className="pulse-dot"></span>
            <strong>LANTERN DEMO</strong>
          </div>
          <p className="demo-disclaimer" id="lantern-disclaimer">
            <ShieldAlert size={16} className="inline-icon" aria-hidden="true" />
            <span>
              <strong>Not an official website.</strong> No real booking or payment will be performed. Designed for LANTERN accessibility guidance testing.
            </span>
          </p>
        </div>

        <div className="banner-right">
          {currentService && (
            <Link
              to="/"
              className="return-hub-link"
              aria-label="Return to LANTERN Demo Home Portal"
              data-lantern-action="return-home"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              <span>LANTERN Portal Home</span>
            </Link>
          )}

          <div className="accessibility-quick-tools" aria-label="Accessibility settings">
            <button
              type="button"
              className={`a11y-pill-btn ${highContrast ? "active" : ""}`}
              onClick={() => setHighContrast(!highContrast)}
              aria-pressed={highContrast}
              title="Toggle high contrast mode for increased visual clarity"
              data-lantern-action="toggle-contrast"
            >
              <Eye size={14} aria-hidden="true" />
              <span>High Contrast</span>
            </button>

            <button
              type="button"
              className={`a11y-pill-btn ${largeText ? "active" : ""}`}
              onClick={() => setLargeText(!largeText)}
              aria-pressed={largeText}
              title="Toggle larger font size for easier reading"
              data-lantern-action="toggle-text-size"
            >
              <Type size={14} aria-hidden="true" />
              <span>{largeText ? "Normal Text" : "Large Text"}</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
