import React, { useState } from 'react'
import './i18n' // Initialize i18n
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { ScanPage } from './pages/ScanPage'
import { EducationPage } from './pages/EducationPage'
import { DoctorsPage } from './pages/DoctorsPage'

export function App() {
  const [activePage, setActivePage] = useState('home')

  const renderPage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage setActivePage={setActivePage} />
      case 'scan':
        return <ScanPage setActivePage={setActivePage} />
      case 'education':
        return <EducationPage setActivePage={setActivePage} />
      case 'doctors':
        return <DoctorsPage setActivePage={setActivePage} />
      default:
        return <HomePage setActivePage={setActivePage} />
    }
  }

  return (
    <div className="min-h-screen bg-ovacare-light font-sans text-ovacare-navy selection:bg-ovacare-purple/30">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="w-full">{renderPage()}</main>

      <Footer setActivePage={setActivePage} />
    </div>
  )
}