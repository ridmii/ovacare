import './index.css'
import './i18n'
import React, { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { PageLoader } from './components/PageLoader'

const App = lazy(() =>
  import(
    /* webpackChunkName: "app-shell" */
    /* webpackMode: "lazy" */
    './App'
  ).then((m) => ({ default: m.App }))
)

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root container missing in index.html')
}

const root = createRoot(container)
root.render(
  <Suspense fallback={<PageLoader />}>
    <App />
  </Suspense>
)
