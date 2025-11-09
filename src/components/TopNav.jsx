import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HomeIcon, WalletIcon, UserIcon, SunIcon, MoonIcon } from '../assets/icons.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function TopNav({ userName }) {
  const navigate = useNavigate()
  const { userEmail, userName: nameFromCtx, logout } = useAuth()
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

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
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
          <span>{userName || nameFromCtx || userEmail || 'Usuário'}</span>
        </Link>

        <button className="theme-toggle" onClick={toggleTheme} aria-label="Alternar tema">
          <span className="icon" aria-hidden="true">
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </span>
        </button>

        <button className="topnav-link" onClick={handleLogout} aria-label="Sair">Sair</button>
      </div>
    </div>
  )
}