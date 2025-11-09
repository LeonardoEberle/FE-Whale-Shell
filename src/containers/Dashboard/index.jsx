import React from 'react'
import TopNav from '../../components/TopNav.jsx'

export default function Dashboard() {
  return (
    <>
      <TopNav userName="Anônimo" />
      <div className="login-page page-with-topnav">
        <div className="login-card">
          <h1 className="login-title">Dashboard</h1>
          <p>Bem-vindo! Este é um placeholder para conteúdo do Dashboard.</p>
        </div>
      </div>
    </>
  )
}