import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserIcon, EnvelopeIcon, LockIcon } from '../../assets/icons.jsx'
import { authApi } from '../../services/api.js'

export default function Register() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setOk(false)
    if (password !== confirm) {
      setError('As senhas não coincidem')
      return
    }
    setLoading(true)
    try {
      await authApi.register({ nome: firstName, sobrenome: lastName, email, senha: password })
      setOk(true)
      setTimeout(() => navigate('/login'), 800)
    } catch (err) {
      setError(err.message || 'Falha no cadastro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Cadastro</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}
          {ok && <div className="success-banner">Conta criada com sucesso!</div>}
          <label className="field">
            <span>Nome</span>
            <div className="input with-icon">
              <span className="icon" aria-hidden="true"><UserIcon /></span>
              <input
                type="text"
                placeholder="Seu nome"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Sobrenome</span>
            <div className="input with-icon">
              <span className="icon" aria-hidden="true"><UserIcon /></span>
              <input
                type="text"
                placeholder="Seu sobrenome"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </label>

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

          <label className="field">
            <span>Confirmar Senha</span>
            <div className="input with-icon">
              <span className="icon" aria-hidden="true"><LockIcon /></span>
              <input
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Criando…' : 'Criar Conta'}
          </button>

          <div className="login-links">
            <span>Já tem uma conta? <Link to="/login">Faça login</Link></span>
          </div>
        </form>
      </div>
    </div>
  )
}