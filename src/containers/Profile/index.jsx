import React from 'react'
import TopNav from '../../components/TopNav.jsx'

export default function Profile() {
  return (
    <>
      <TopNav userName="Anônimo" />
      <div className="login-page page-with-topnav">
        <div className="login-card">
          <h1 className="login-title">Perfil</h1>
          <p>Página de Perfil (placeholder). Em breve dados do usuário.</p>
        </div>
      </div>
    </>
  )
}