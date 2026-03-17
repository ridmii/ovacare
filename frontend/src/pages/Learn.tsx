import React, { useState } from 'react';
import '../styles/pages/Learn.css';
import { EducationContent } from '../types';

const Learn: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('what-is');

  const tabs = [
    { id: 'what-is', label: 'What is PCOS?' },
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'diagnosis', label: 'Diagnosis' },
    { id: 'treatment', label: 'Treatment' },
    { id: 'lifestyle', label: 'Lifestyle' }
  ];

  const content: Record<string, EducationContent> = {
    'what-is': {
      id: 'what-is',
      title: 'Understanding Polycystic Ovary Syndrome',
      content: [
        'PCOS is a hormonal disorder common among women of reproductive age.',
        'Women with PCOS may have infrequent or prolonged menstrual periods or excess male hormone (androgen) levels.',
        'The ovaries may develop numerous small collections of fluid (follicles) and fail to regularly release eggs.'
      ],
      category: 'causes',
      icon: 'ℹ️'
    },
    'symptoms': {
      id: 'symptoms',
      title: 'Common Symptoms',
      content: [
        '• Irregular periods or no periods at all',
        '• Difficulty getting pregnant',
        '• Excessive hair growth (hirsutism)',
        '• Weight gain',
        '• Thinning hair or hair loss',
        '• Oily skin or acne',
        '• Mood changes or depression',
        '• Sleep problems'
      ],
      category: 'symptoms',
      icon: '🩺'
    },
    'diagnosis': {
      id: 'diagnosis',
      title: 'How PCOS is Diagnosed',
      content: [
        'PCOS is diagnosed when at least two of the following occur:',
        '1. Irregular periods',
        '2. Signs of excess androgens (high testosterone levels or physical signs)',
        '3. Polycystic ovaries on ultrasound (12 or more follicles in each ovary)',
        'An ultrasound scan is crucial for visualizing ovarian follicles and confirming diagnosis.'
      ],
      category: 'symptoms',
      icon: '🔬'
    },
    'treatment': {
      id: 'treatment',
      title: 'Treatment Options',
      content: [
        'Treatment focuses on managing symptoms and may include:',
        '• Birth control pills to regulate periods',
        '• Metformin to improve insulin resistance',
        '• Fertility medications if trying to conceive',
        '• Anti-androgen medications for hair growth and acne',
        '• Surgical options in some cases'
      ],      category: 'treatment',      icon: '💊'
    },
    'lifestyle': {
      id: 'lifestyle',
      title: 'Lifestyle Management',
      content: [
        'Lifestyle changes can significantly improve PCOS symptoms:',
        '• Healthy diet (low glycemic index foods)',
        '• Regular exercise (150 minutes per week)',
        '• Weight management',
        '• Stress reduction techniques',
        '• Adequate sleep',
        '• Quitting smoking'
      ],
      category: 'prevention',
      icon: '🏃‍♀️'
    }
  };

  const resources = [
    { icon: '📖', title: 'PCOS Handbook', description: 'Complete guide to understanding and managing PCOS' },
    { icon: '🎥', title: 'Video Guides', description: 'Educational videos about PCOS and treatments' },
    { icon: '🍽️', title: 'Diet Plans', description: 'PCOS-friendly meal plans and recipes' },
    { icon: '👥', title: 'Support Groups', description: 'Connect with others managing PCOS' }
  ];

  return (
    <div className="learn-page">
      <h1>PCOS Education Center</h1>
      <p className="page-subtitle">Learn about PCOS symptoms, diagnosis, and management</p>

      <div className="learn-container">
        {/* Tab Navigation */}
        <div className="tab-navigation">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="content-area">
          <div className="content-card">
            <h2>{content[activeTab].title}</h2>
            <div className="content-text">
              {content[activeTab].content.map((line: string, index: number) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          {/* Quick Facts */}
          <div className="quick-facts">
            <h3>Quick Facts</h3>
            <div className="facts-grid">
              <div className="fact">
                <div className="fact-icon">👩</div>
                <div className="fact-content">
                  <h4>Prevalence</h4>
                  <p>Affects 1 in 10 women worldwide</p>
                </div>
              </div>
              <div className="fact">
                <div className="fact-icon">⏰</div>
                <div className="fact-content">
                  <h4>Diagnosis Time</h4>
                  <p>Often takes 2+ years and multiple doctors</p>
                </div>
              </div>
              <div className="fact">
                <div className="fact-icon">🔬</div>
                <div className="fact-content">
                  <h4>Ultrasound Role</h4>
                  <p>Crucial for detecting ovarian follicles</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <div className="resources-section">
          <h2>Additional Resources</h2>
          <div className="resources-grid">
            {resources.map((resource, index) => (
              <a key={index} href="#" className="resource-card">
                <div className="resource-icon">{resource.icon}</div>
                <h4>{resource.title}</h4>
                <p>{resource.description}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Learn;