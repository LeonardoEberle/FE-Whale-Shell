import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EnvelopeIcon, LockIcon } from '../../assets/icons.jsx'
import { authApi, usuariosApi } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setToken, setUserEmail, setUserName } = useAuth()
  const navigate = useNavigate()

  function decodeJwtPayload(token) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (_) {
      return null
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      if (res?.token) {
        setToken(res.token)
        setUserEmail(email)
        // Buscar nome do usuário após login
        const payload = decodeJwtPayload(res.token)
        const usuId = payload?.usu_id
        if (usuId) {
          try {
            const user = await usuariosApi.getById(usuId, res.token)
            const nomeCompleto = [user?.nome, user?.sobrenome].filter(Boolean).join(' ').trim()
            if (nomeCompleto) setUserName(nomeCompleto)
          } catch (_) {
            // se falhar, mantém email
          }
        }
        navigate('/dashboard')
      } else {
        setError('Resposta inesperada do servidor')
      }
    } catch (err) {
      setError(err.message || 'Falha no login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}
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

          <Link className="btn btn-secondary" to="/register">
            Criar uma conta
          </Link>
        </form>
      </div>
    </div>
  )
}