import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import ResumeBuilder from './pages/ResumeBuilder/ResumeBuilder.jsx'
import Auth from './pages/Auth/Auth.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/*" element={<ResumeBuilder />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
