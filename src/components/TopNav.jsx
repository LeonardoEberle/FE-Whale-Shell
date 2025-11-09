import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { HomeIcon, WalletIcon, UserIcon, SunIcon, MoonIcon } from '../assets/icons.jsx'

export default function TopNav({ userName = 'Anônimo' }) {
  const [theme, setTheme] = useState(
    typeof document !== 'undefined'
      ? document.documentElement.getAttribute('data-theme') || 'dark'
      : 'dark'
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  function toggleTheme() {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="topnav">
      <div className="topnav-left">
        <Link to="/dashboard" className="topnav-link">
          <span className="icon" aria-hidden="true"><HomeIcon /></span>
          <span>Home</span>
        </Link>
        <Link to="/wallet" className="topnav-link">
          <span className="icon" aria-hidden="true"><WalletIcon /></span>
          <span>Carteira</span>
        </Link>
      </div>
      <div className="topnav-right">
        <Link to="/profile" className="topnav-user" aria-label="Abrir perfil">
          <span className="icon" aria-hidden="true"><UserIcon /></span>
          <span>{userName}</span>
        </Link>

        <button className="theme-toggle" onClick={toggleTheme} aria-label="Alternar tema">
          <span className="icon" aria-hidden="true">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </span>
        </button>

        <Link to="/login" className="topnav-link" aria-label="Sair">Sair</Link>
      </div>
    </div>
  )
}