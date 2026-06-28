import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation, Trans } from 'react-i18next';
import '../styles/pages/Home.css';

const FEATURE_META = [
  { icon: '🤖', gradient: 'from-purple-500 to-pink-500' },
  { icon: '📊', gradient: 'from-blue-500 to-cyan-400' },
  { icon: '🎓', gradient: 'from-green-500 to-teal-400' },
  { icon: '👩‍⚕️', gradient: 'from-orange-500 to-red-400' },
];

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [activeFeature, setActiveFeature] = useState(0);

  const features = FEATURE_META.map((meta, index) => ({
    ...meta,
    title: t(`home.features.${index}.title`),
    description: t(`home.features.${index}.description`),
  }));

  const stats = t('home.stats', { returnObjects: true }) as Array<{
    value: string;
    label: string;
  }>;

  const steps = t('home.processSection.steps', { returnObjects: true }) as Array<{
    number: string;
    title: string;
    description: string;
    icon: string;
  }>;

  const testimonials = t('home.trustSection.testimonials', { returnObjects: true }) as Array<{
    quote: string;
    author: string;
  }>;

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURE_META.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home">
      <div className="animated-bg">
        <div className="gradient-circle-1"></div>
        <div className="gradient-circle-2"></div>
        <div className="gradient-circle-3"></div>
      </div>

      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text fade-in">
              <div className="badge">
                <Trans
                  i18nKey="home.hero.badgeRich"
                  components={[<span key="0" />]}
                />
              </div>
              <h1 className="hero-title">
                {t('home.hero.title')}
                <span className="gradient-text"> {t('home.hero.titleHighlight')}</span>
              </h1>
              <p className="hero-subtitle">{t('home.hero.subtitle')}</p>
              <div className="hero-buttons">
                <Link to="/scan" className="btn-primary">
                  <span>{t('home.hero.primaryButton')}</span>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </Link>
                <Link to="/learn" className="btn-secondary">
                  <span>{t('home.hero.secondaryButton')}</span>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </Link>
              </div>
            </div>

            <div className="hero-demo fade-in-delay">
              <div className="demo-card">
                <div className="demo-header">
                  <div className="demo-status">
                    <div className="status-dot"></div>
                    <span>{t('home.hero.demoCardStatus')}</span>
                  </div>
                  <div className="demo-progress">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <span>{t('home.hero.demoCardProgress')}</span>
                  </div>
                </div>
                <div className="demo-content">
                  <div className="ultrasound-preview">
                    <div className="ultrasound-image">
                      <div className="ovary-shape">
                        <div className="follicle"></div>
                        <div className="follicle"></div>
                        <div className="follicle"></div>
                        <div className="follicle"></div>
                        <div className="follicle"></div>
                      </div>
                    </div>
                    <div className="analysis-overlay">
                      <div className="detected-label">{t('home.hero.demoCardDetected')}</div>
                      <div className="confidence">{t('home.hero.demoCardConfidence')}</div>
                    </div>
                  </div>
                  <div className="demo-stats">
                    <div className="stat">
                      <span className="stat-value">24</span>
                      <span className="stat-label">{t('home.hero.demoCardFollicles')}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">12.5cm³</span>
                      <span className="stat-label">{t('home.hero.demoCardOvaryVolume')}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{t('home.hero.demoCardSeverityValue')}</span>
                      <span className="stat-label">{t('home.hero.demoCardSeverity')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-stats fade-in-delay-2">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <div className="section-title fade-in">
            <h2>
              <Trans
                i18nKey="home.featuresSection.sectionTitleRich"
                components={[<span key="1" className="gradient-text" />]}
              />
            </h2>
            <p>{t('home.featuresSection.sectionSubtitle')}</p>
          </div>
        </div>

        <div className="features-container">
          <div className="feature-navigation">
            {features.map((feature, index) => (
              <button
                key={index}
                className={`feature-tab ${activeFeature === index ? 'active' : ''}`}
                onClick={() => setActiveFeature(index)}
              >
                <span className="tab-icon">{feature.icon}</span>
                <span className="tab-title">{feature.title}</span>
              </button>
            ))}
          </div>

          <div className="feature-display fade-in">
            <div className={`feature-gradient ${features[activeFeature].gradient}`}>
              <div className="feature-icon-large">{features[activeFeature].icon}</div>
            </div>
            <div className="feature-content">
              <h3>{features[activeFeature].title}</h3>
              <p>{features[activeFeature].description}</p>
              <Link to="/scan" className="feature-link">
                {t('home.featuresSection.tryNow')}
              </Link>
            </div>
          </div>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card fade-in">
              <div className={`card-gradient ${feature.gradient}`}>
                <div className="card-icon">{feature.icon}</div>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="process-section">
        <div className="section-header">
          <h2>
            <Trans
              i18nKey="home.processSection.titleRich"
              components={[<span key="1" className="gradient-text" />]}
            />
          </h2>
          <p>{t('home.processSection.subtitle')}</p>
        </div>

        <div className="process-steps">
          {steps.map((step, index) => (
            <div key={index} className="process-step fade-in">
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {index < steps.length - 1 && <div className="step-connector">→</div>}
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-card fade-in">
          <div className="cta-content">
            <h2>{t('home.ctaSection.title')}</h2>
            <p>{t('home.ctaSection.subtitle')}</p>
            <div className="cta-buttons">
              <Link to="/scan" className="btn-primary btn-large">
                <span>{t('home.ctaSection.primaryButton')}</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </Link>
              <Link to="/doctors" className="btn-secondary btn-large">
                <span>{t('home.ctaSection.secondaryButton')}</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </Link>
            </div>
          </div>
          <div className="cta-graphic">
            <div className="floating-element-1"></div>
            <div className="floating-element-2"></div>
            <div className="floating-element-3"></div>
          </div>
        </div>
      </section>

      <section className="trust-section">
        <div className="section-header">
          <h3>{t('home.trustSection.title')}</h3>
        </div>
        <div className="testimonials">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial">
              <div className="testimonial-content">&ldquo;{testimonial.quote}&rdquo;</div>
              <div className="testimonial-author">- {testimonial.author}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
