import React, { useEffect, useState } from 'react'
import TopNav from '../../components/TopNav.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { usuariosApi } from '../../services/api.js'

export default function Dashboard() {
  const { userEmail, token } = useAuth()
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    async function load() {
      setError('')
      try {
        const data = await usuariosApi.list(token)
        if (mounted) setUsers(data)
      } catch (err) {
        if (mounted) setError(err.message || 'Falha ao carregar usuários')
      }
    }
    load()
    return () => { mounted = false }
  }, [token])
  return (
    <> 
      <TopNav userName={userEmail || 'Usuário'} />
      <div className="login-page page-with-topnav">
        <div className="login-card">
          <h1 className="login-title">Dashboard</h1>
          {error && <div className="error-banner">{error}</div>}
          {!error && (
            <div>
              <h2>Usuários</h2>
              <ul>
                {users.map((u) => (
                  <li key={u.usuId}>{u.nome} — {u.email}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </>
  )
}