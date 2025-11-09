import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { usuariosApi } from '../../services/api.js'

export default function Profile() {
  const { token, userEmail, setUserEmail, userName, setUserName } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [form, setForm] = useState({
    nome: '',
    sobrenome: '',
    dataNasc: '',
    email: '',
    endereco: '',
    telefone: ''
  })
  const [initialForm, setInitialForm] = useState({
    nome: '',
    sobrenome: '',
    dataNasc: '',
    email: '',
    endereco: '',
    telefone: ''
  })

  const usuId = useMemo(() => {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      const payload = JSON.parse(jsonPayload)
      return payload?.usu_id
    } catch (_) {
      return null
    }
  }, [token])

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      setError('')
      setSuccess('')
      try {
        if (!usuId) throw new Error('Usuário inválido')
        const user = await usuariosApi.getById(usuId, token)
        if (!mounted) return
        const loaded = {
          nome: user?.nome || '',
          sobrenome: user?.sobrenome || '',
          dataNasc: (user?.dataNasc ? String(user.dataNasc).slice(0, 10) : ''),
          email: user?.email || '',
          endereco: user?.endereco || '',
          telefone: user?.telefone || ''
        }
        setForm(loaded)
        setInitialForm(loaded)
      } catch (err) {
        if (mounted) setError(err.message || 'Falha ao carregar dados do perfil')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [usuId, token])

  function onChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  function onChangeTelefone(e) {
    let digits = e.target.value.replace(/\D/g, '')
    if (digits.length > 11) digits = digits.slice(0, 11)
    let formatted = digits
    if (digits.length >= 2) {
      formatted = `(${digits.slice(0,2)}`
      if (digits.length >= 7) {
        formatted += `) ${digits.slice(2,7)}-${digits.slice(7)}`
      } else if (digits.length >= 6) {
        formatted += `) ${digits.slice(2,6)}-${digits.slice(6)}`
      } else if (digits.length > 2) {
        formatted += `) ${digits.slice(2)}`
      } else {
        formatted += ')'
      }
    }
    setForm((f) => ({ ...f, telefone: formatted }))
  }

  // Fecha automaticamente o modal de sucesso após alguns segundos
  useEffect(() => {
    if (!success) return
    const timer = setTimeout(() => setSuccess(''), 2500)
    return () => clearTimeout(timer)
  }, [success])

  const isValidEmail = useMemo(() => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(form.email)
  }, [form.email])

  const isFormValid = useMemo(() => {
    return !!form.nome && isValidEmail
  }, [form.nome, isValidEmail])

  function onCancel() {
    setForm(initialForm)
    setError('')
    setSuccess('')
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      if (!usuId) throw new Error('Usuário inválido')
      const body = {
        Nome: form.nome,
        Sobrenome: form.sobrenome,
        DataNasc: form.dataNasc || null,
        Email: form.email,
        Endereco: form.endereco,
        Telefone: form.telefone,
      }
      await usuariosApi.update(usuId, body, token)
      setSuccess('Dados atualizados com sucesso')
      const nomeCompleto = [form.nome, form.sobrenome].filter(Boolean).join(' ').trim()
      if (nomeCompleto) setUserName(nomeCompleto)
      if (form.email) setUserEmail(form.email)
      // Removido reload da página; exibiremos um modal de sucesso.
    } catch (err) {
      setError(err.message || 'Falha ao atualizar dados')
    }
  }

  return (
    <div className="login-page page-with-topnav">
      <div className="login-card">
        <h1 className="login-title">Perfil</h1>
        {loading ? (
          <p>Carregando…</p>
        ) : (
          <form className="login-form" onSubmit={onSubmit} noValidate>
            {error && <div className="error-banner">{error}</div>}
            {success && (
              <div className="modal-backdrop" role="dialog" aria-modal="true">
                <div className="modal-card">
                  <h2 className="modal-title">Sucesso</h2>
                  <p>Seus dados foram atualizados com sucesso.</p>
                  <div className="modal-actions">
                    <button type="button" className="btn btn-primary" onClick={() => setSuccess('')}>Fechar</button>
                  </div>
                </div>
              </div>
            )}

            <label className="field">
              <span>Nome</span>
              <div className="input">
                <input name="nome" value={form.nome} onChange={onChange} required />
              </div>
            </label>
            <label className="field">
              <span>Sobrenome</span>
              <div className="input">
                <input name="sobrenome" value={form.sobrenome} onChange={onChange} />
              </div>
            </label>
            <label className="field">
              <span>Data de nascimento</span>
              <div className="input">
                <input type="date" name="dataNasc" value={form.dataNasc} onChange={onChange} />
              </div>
            </label>
            <label className="field">
              <span>Email</span>
              <div className="input">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                  onInvalid={(e) => e.target.setCustomValidity('Informe um email válido')}
                  onInput={(e) => e.target.setCustomValidity('')}
                />
              </div>
            </label>
            
            <label className="field">
              <span>Endereço</span>
              <div className="input">
                <input name="endereco" value={form.endereco} onChange={onChange} />
              </div>
            </label>
            <label className="field">
              <span>Telefone</span>
              <div className="input">
                <input name="telefone" value={form.telefone} onChange={onChangeTelefone} placeholder="(11) 99999-9999" />
              </div>
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" type="button" onClick={onCancel}>Cancelar</button>
              <button className="btn btn-primary" type="submit" disabled={!isFormValid}>Salvar alterações</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}