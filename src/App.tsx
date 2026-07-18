import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'

function App() {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark')
  }

  return (
    <Router basename="/knowledge-hub">
      <div className={`app ${isDark ? 'dark' : 'light'}`}>
        <nav className="navbar">
          <div className="nav-content">
            <Link to="/" className="logo">
              Knowledge Hub
            </Link>
            <button onClick={toggleTheme} className="theme-toggle">
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
