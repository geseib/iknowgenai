import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// The 14+ course lives at /course; everything else is the original app.
// BASE_URL is '/iknowgenai/' in local dev and '/' on Vercel.
const CourseApp = lazy(() => import('./course/CourseApp.jsx'))
const path = window.location.pathname
  .replace(import.meta.env.BASE_URL, '/')
  .replace(/\/+$/, '') || '/'
const isCourse = path === '/course' || path.startsWith('/course/')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isCourse ? (
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0B0E14' }} />}>
        <CourseApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
