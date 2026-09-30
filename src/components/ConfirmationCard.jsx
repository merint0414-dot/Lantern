import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Printer,
  ArrowRight,
  ShieldAlert,
  QrCode
} from "lucide-react";

export default function ConfirmationCard({
  containerId = "confirmation-card",
  serviceName = "Booking",
  serviceType = "ksrtc", // ksrtc, irctc, bharatgas, kseb
  bookingId,
  pnr,
  txnId,
  details = [],
  amount = 0,
  disclaimerText = "DEMO ONLY — NOT A REAL BOOKING",
  onReset
}) {
  const handlePrint = () => {
    window.print();
  };

  const [sessionId] = useState(() => `LANTERN-${Math.floor(100000 + Math.random() * 900000)}`);
  const [formattedTime] = useState(() =>
    new Date().toLocaleString("en-IN", { dateStyle: "full", timeStyle: "medium" })
  );

  return (
    <div
      id={containerId}
      className={`confirmation-ticket-wrapper theme-${serviceType}`}
      role="region"
      aria-label={`${serviceName} Demo Confirmation`}
      data-lantern-step="confirmation"
      data-lantern-action="view-confirmation"
      data-lantern-label="Booking Confirmation"
    >
      {/* Official-looking printable ticket card */}
      <div className="ticket-card-printable">
        {/* Prominent Demo Watermark Bar */}
        <div className="ticket-watermark-ribbon" role="alert">
          <ShieldAlert size={16} aria-hidden="true" />
          <span>{disclaimerText}</span>
        </div>

        {/* Header with success badge */}
        <div className="ticket-header">
          <div className="ticket-success-badge">
            <div className="success-icon-ring" aria-hidden="true">
              <CheckCircle2 size={32} className="success-check-icon" />
            </div>
            <div>
              <span className="badge-subtitle">LANTERN Accessibility Demo</span>
              <h2 className="badge-title">✓ Demo {serviceName} Confirmed</h2>
            </div>
          </div>

          <div className="ticket-ref-block">
            {pnr && (
              <div className="ref-item">
                <span className="ref-label">PNR Number:</span>
                <span className="ref-code pnr-highlight">{pnr}</span>
              </div>
            )}
            {bookingId && (
              <div className="ref-item">
                <span className="ref-label">Booking Reference:</span>
                <span className="ref-code">{bookingId}</span>
              </div>
            )}
            <div className="ref-item">
              <span className="ref-label">Transaction ID:</span>
              <span className="ref-code txn-code">{txnId}</span>
            </div>
          </div>
        </div>

        {/* Dashed divider */}
        <div className="ticket-perforated-divider" aria-hidden="true">
          <div className="cutout-left"></div>
          <div className="cutout-line"></div>
          <div className="cutout-right"></div>
        </div>

        {/* Ticket Body / Key-Value Details Grid */}
        <div className="ticket-body">
          <div className="ticket-details-grid">
            {details.map((item, idx) => (
              <div key={idx} className={`detail-tile ${item.fullWidth ? "full-width" : ""}`}>
                <span className="tile-label">{item.label}</span>
                <span className={`tile-val ${item.highlight ? "text-highlight" : ""}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          {/* Right-hand QR Simulation & Payment Stamp */}
          <div className="ticket-stamp-col">
            <div className="qr-sim-box" title="Demo QR Code (Verification Simulation)" aria-label="Demo Verification QR Code">
              <div className="qr-inner-pattern">
                <QrCode size={88} className="qr-svg" aria-hidden="true" />
              </div>
              <span className="qr-caption">LANTERN DEMO SCAN</span>
            </div>

            <div className="paid-stamp-box">
              <span className="stamp-label">AMOUNT PAID</span>
              <span className="stamp-amount">₹{Number(amount).toFixed(2)}</span>
              <span className="stamp-status">✓ PAYMENT VERIFIED</span>
            </div>
          </div>
        </div>

        {/* Footer Warning & Notice */}
        <div className="ticket-footer-disclaimer">
          <p className="primary-warn">
            <strong>CRITICAL NOTICE:</strong> {disclaimerText}. This electronic document was generated locally by the LANTERN demonstration sandbox. No transport authorities, utility boards, or gas agencies were notified.
          </p>
          <p className="timestamp-note">
            Generated on: {formattedTime} | Session ID: {sessionId}
          </p>
        </div>
      </div>

      {/* Post-confirmation actions */}
      <div className="confirmation-actions-bar">
        <button
          type="button"
          className="btn-action-print"
          onClick={handlePrint}
          aria-label="Print or save demo ticket receipt"
          data-lantern-action="print-ticket"
        >
          <Printer size={16} aria-hidden="true" />
          <span>Print / Save Demo Receipt</span>
        </button>

        {onReset && (
          <button
            type="button"
            className="btn-action-new"
            onClick={onReset}
            aria-label="Start a new booking or lookup"
            data-lantern-action="start-new-booking"
          >
            <span>Start Another Demo</span>
          </button>
        )}

        <Link
          to="/"
          className="btn-action-hub"
          aria-label="Return to LANTERN Demo Home Portal"
          data-lantern-action="return-home"
        >
          <span>Explore Other Services</span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
