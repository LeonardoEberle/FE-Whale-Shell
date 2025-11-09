import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { EnvelopeIcon, LockIcon } from '../../assets/icons.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 800)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Email</span>
            <div className="input with-icon">
              <span className="icon" aria-hidden="true"><EnvelopeIcon /></span>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Senha</span>
            <div className="input with-icon">
              <span className="icon" aria-hidden="true"><LockIcon /></span>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </button>

          <div className="login-links">
            <Link to="/register">Não tem uma conta? Cadastre-se</Link>
            <span>Ou continue sem cadastro:</span>
          </div>

          <Link className="btn btn-secondary" to="/dashboard">
            Continuar Anonimamente
          </Link>
        </form>
      </div>
    </div>
  )
}