import React, { Suspense } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { PageLoader } from '../components/PageLoader'
import {
  HomePage,
  ScanPage,
  EducationPage,
  DoctorsPage,
  BookingPage,
  BookingConfirmationPage,
} from './lazyPages'

function pageFromPath(pathname: string): string {
  if (pathname.startsWith('/scan')) return 'scan'
  if (pathname.startsWith('/education')) return 'education'
  if (pathname.startsWith('/doctors') || pathname.startsWith('/booking')) return 'doctors'
  return 'home'
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export function AppRoutes() {
  const location = useLocation()
  const navigate = useNavigate()
  const activePage = pageFromPath(location.pathname)

  const setActivePage = (page: string) => {
    const routes: Record<string, string> = {
      home: '/',
      scan: '/scan',
      education: '/education',
      doctors: '/doctors',
    }
    navigate(routes[page] || '/')
  }

  return (
    <div className="min-h-screen bg-ovacare-light font-sans text-ovacare-navy selection:bg-ovacare-purple/30">
      <Navbar activePage={activePage} setActivePage={setActivePage} />

      <main className="w-full">
        <Routes location={location}>
          <Route
            path="/"
            element={
              <LazyPage>
                <HomePage setActivePage={setActivePage} />
              </LazyPage>
            }
          />
          <Route
            path="/scan"
            element={
              <LazyPage>
                <ScanPage setActivePage={setActivePage} />
              </LazyPage>
            }
          />
          <Route
            path="/education"
            element={
              <LazyPage>
                <EducationPage setActivePage={setActivePage} />
              </LazyPage>
            }
          />
          <Route
            path="/doctors"
            element={
              <LazyPage>
                <DoctorsPage setActivePage={setActivePage} />
              </LazyPage>
            }
          />
          <Route
            path="/booking/:doctorId"
            element={
              <LazyPage>
                <BookingPage />
              </LazyPage>
            }
          />
          <Route
            path="/booking/confirmation/:bookingId"
            element={
              <LazyPage>
                <BookingConfirmationPage />
              </LazyPage>
            }
          />
        </Routes>
      </main>

      <Footer setActivePage={setActivePage} />
    </div>
  )
}
