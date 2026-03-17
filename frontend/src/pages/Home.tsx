import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages/Home.css';

const Home: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  
  const features = [
    {
      icon: '🤖',
      title: 'AI-Powered Analysis',
      description: 'Deep learning models analyze ultrasound images for PCOS markers with 94% accuracy.',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: '📊',
      title: 'Visual Reports',
      description: 'Interactive reports with follicle visualization and easy-to-understand explanations.',
      gradient: 'from-blue-500 to-cyan-400'
    },
    {
      icon: '🎓',
      title: 'Educational Hub',
      description: 'Comprehensive guides about PCOS symptoms, treatments, and lifestyle management.',
      gradient: 'from-green-500 to-teal-400'
    },
    {
      icon: '👩‍⚕️',
      title: 'Doctor Network',
      description: 'Connect with verified gynecologists and endocrinologists in your area.',
      gradient: 'from-orange-500 to-red-400'
    }
  ];

  const stats = [
    { value: '94%', label: 'Accuracy Rate' },
    { value: '2 min', label: 'Analysis Time' },
    { value: '12K+', label: 'Scans Analyzed' },
    { value: '200+', label: 'Expert Doctors' }
  ];

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="home">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-circle-1"></div>
        <div className="gradient-circle-2"></div>
        <div className="gradient-circle-3"></div>
      </div>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-text fade-in">
              <div className="badge">
                <span>✨ AI-Powered</span> PCOS Detection
              </div>
              <h1 className="hero-title">
                Take Control of Your
                <span className="gradient-text"> Reproductive Health</span>
              </h1>
              <p className="hero-subtitle">
                Upload your ultrasound scan and get instant AI analysis for PCOS. 
                Get clear insights, personalized recommendations, and connect with specialists.
              </p>
              <div className="hero-buttons">
                <Link to="/scan" className="btn-primary">
                  <span>Start Free Analysis</span>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </Link>
                <Link to="/learn" className="btn-secondary">
                  <span>Learn More</span>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </Link>
              </div>
            </div>

            {/* Interactive Demo Card */}
            <div className="hero-demo fade-in-delay">
              <div className="demo-card">
                <div className="demo-header">
                  <div className="demo-status">
                    <div className="status-dot"></div>
                    <span>AI Analysis in Progress</span>
                  </div>
                  <div className="demo-progress">
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                    <span>94% Complete</span>
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
                      <div className="detected-label">PCOS Detected</div>
                      <div className="confidence">94% Confidence</div>
                    </div>
                  </div>
                  <div className="demo-stats">
                    <div className="stat">
                      <span className="stat-value">24</span>
                      <span className="stat-label">Follicles</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">12.5cm³</span>
                      <span className="stat-label">Ovary Volume</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">Moderate</span>
                      <span className="stat-label">Severity</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
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

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <div className="section-title fade-in">
            <h2>Why Choose <span className="gradient-text">OvaCare</span></h2>
            <p>Experience the future of PCOS detection with our advanced platform</p>
          </div>
        </div>

        <div className="features-container">
          {/* Feature Navigation */}
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

          {/* Active Feature Display */}
          <div className="feature-display fade-in">
            <div className={`feature-gradient ${features[activeFeature].gradient}`}>
              <div className="feature-icon-large">{features[activeFeature].icon}</div>
            </div>
            <div className="feature-content">
              <h3>{features[activeFeature].title}</h3>
              <p>{features[activeFeature].description}</p>
              <Link to="/scan" className="feature-link">
                Try it now →
              </Link>
            </div>
          </div>
        </div>

        {/* All Features Grid */}
        <div className="features-grid">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card fade-in"
            >
              <div className={`card-gradient ${feature.gradient}`}>
                <div className="card-icon">{feature.icon}</div>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="process-section">
        <div className="section-header">
          <h2>How It <span className="gradient-text">Works</span></h2>
          <p>Simple steps to get your PCOS analysis</p>
        </div>

        <div className="process-steps">
          {[
            { number: '01', title: 'Upload Scan', description: 'Upload your ovarian ultrasound image securely', icon: '📤' },
            { number: '02', title: 'AI Analysis', description: 'Our AI analyzes follicles and detects PCOS markers', icon: '🤖' },
            { number: '03', title: 'Get Results', description: 'Receive detailed report with visual explanations', icon: '📊' },
            { number: '04', title: 'Take Action', description: 'Connect with specialists and get guidance', icon: '👩‍⚕️' }
          ].map((step, index) => (
            <div
              key={index}
              className="process-step fade-in"
            >
              <div className="step-number">{step.number}</div>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              {index < 3 && <div className="step-connector">→</div>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card fade-in">
          <div className="cta-content">
            <h2>Ready to take control of your health?</h2>
            <p>Join thousands of women who've discovered their PCOS status early and taken action.</p>
            <div className="cta-buttons">
              <Link to="/scan" className="btn-primary btn-large">
                <span>Start Free Analysis</span>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </Link>
              <Link to="/doctors" className="btn-secondary btn-large">
                <span>Find Specialists</span>
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

      {/* Trust Indicators */}
      <section className="trust-section">
        <div className="section-header">
          <h3>Trusted by Women Worldwide</h3>
        </div>
        <div className="testimonials">
          <div className="testimonial">
            <div className="testimonial-content">
              "OvaCare helped me get diagnosed 2 years earlier than my doctors suspected."
            </div>
            <div className="testimonial-author">- Sarah, 28</div>
          </div>
          <div className="testimonial">
            <div className="testimonial-content">
              "The AI analysis was spot-on and the doctor recommendations were perfect."
            </div>
            <div className="testimonial-author">- Priya, 32</div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;