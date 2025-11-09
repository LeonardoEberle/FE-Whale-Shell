import React from 'react'
import TopNav from '../../components/TopNav.jsx'

export default function Wallet() {
  return (
    <>
      <TopNav userName="Anônimo" />
      <div className="login-page page-with-topnav">
        <div className="login-card">
          <h1 className="login-title">Carteira</h1>
          <p>Página de Carteira (placeholder). Em breve saldo e transações.</p>
        </div>
      </div>
    </>
  )
}