import { Link } from "react-router-dom";
import { Bus, Train, Flame, Zap, ArrowRight } from "lucide-react";
import DemoNotice from "../components/DemoNotice";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function Home() {
  const demoServices = [
    {
      id: "ksrtc",
      title: "KSRTC Bus Booking",
      subtitle: "Kerala State Road Transport Corporation",
      description:
        "Search buses, select a seat, enter passenger details and complete a demo booking.",
      btnText: "Book Bus",
      route: "/ksrtc",
      icon: <Bus size={32} aria-hidden="true" />,
      colorClass: "card-ksrtc",
      badge: "Kerala RTC Swift"
    },
    {
      id: "irctc",
      title: "IRCTC Railway Booking",
      subtitle: "Indian Railway Catering and Tourism Corporation",
      description:
        "Search trains, select a train, enter passenger details and complete a demo railway booking.",
      btnText: "Book Train",
      route: "/irctc",
      icon: <Train size={32} aria-hidden="true" />,
      colorClass: "card-irctc",
      badge: "NextGen E-Ticketing"
    },
    {
      id: "bharatgas",
      title: "Bharatgas Booking",
      subtitle: "Bharat Petroleum Corporation Limited (BPCL)",
      description:
        "Verify a consumer, book an LPG cylinder and complete a demo payment.",
      btnText: "Book Gas",
      route: "/bharatgas",
      icon: <Flame size={32} aria-hidden="true" />,
      colorClass: "card-bharatgas",
      badge: "LPG Refill Portal"
    },
    {
      id: "kseb",
      title: "KSEB Bill Payment",
      subtitle: "Kerala State Electricity Board Limited",
      description:
        "View an electricity bill and complete a realistic demo payment.",
      btnText: "Pay Electricity Bill",
      route: "/kseb",
      icon: <Zap size={32} aria-hidden="true" />,
      colorClass: "card-kseb",
      badge: "Quick Pay Portal"
    }
  ];

  return (
    <div className="lantern-page-shell">
      <DemoNotice />
      <SiteHeader />

      <main id="main-content" className="home-main">
        {/* Minimalist Hero Section */}
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="lantern-container hero-container">
            <h1 id="hero-title" className="hero-main-title">
              LANTERN
            </h1>
          </div>
        </section>

        {/* Four Service Cards */}
        <section className="services-section" aria-labelledby="services-section-title">
          <div className="lantern-container">
            <div className="section-header-row">
              <h2 id="services-section-title" className="section-title">
                Interactive Service
              </h2>
            </div>

            <div className="services-grid" role="list">
              {demoServices.map((service, index) => (
                <article
                  key={service.id}
                  className={`service-card ${service.colorClass}`}
                  role="listitem"
                  aria-labelledby={`card-title-${service.id}`}
                  data-lantern-step={index + 1}
                  data-lantern-action={`open-${service.id}`}
                  data-lantern-label={service.title}
                >
                  <div className="card-top-row">
                    <div className="card-icon-container" aria-hidden="true">
                      {service.icon}
                    </div>
                    <span className="badge-portal-type">{service.badge}</span>
                  </div>

                  <div className="card-body">
                    <span className="card-sub-brand">{service.subtitle}</span>
                    <h3 id={`card-title-${service.id}`} className="card-heading">
                      {service.title}
                    </h3>
                    <p className="card-paragraph">{service.description}</p>
                  </div>

                  <div className="card-footer">
                    <Link
                      to={service.route}
                      className="btn-card-action"
                      id={`home-btn-${service.id}`}
                      aria-label={`${service.btnText} for ${service.title}`}
                      data-lantern-action={`navigate-${service.id}`}
                    >
                      <span>{service.btnText}</span>
                      <ArrowRight size={18} className="btn-arrow" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
