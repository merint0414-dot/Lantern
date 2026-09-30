export default function SiteFooter() {
  return (
    <footer className="site-footer-minimal" role="contentinfo">
      <div className="lantern-container footer-minimal-inner">
        <span className="footer-brand-text">LANTERN</span>
        <span className="footer-dot" aria-hidden="true">•</span>
        <span className="footer-copyright-text">© {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}
