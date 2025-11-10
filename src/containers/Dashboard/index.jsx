import React, { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getQuotes } from '../../services/market.js'

function CryptoPricesWidget() {
  const [state, setState] = useState({ quotes: [], partial: false, lastAt: null })
  const [err, setErr] = useState('')

  useEffect(() => {
    let mounted = true
    let timer = null
    async function fetchOnce() {
      try {
        const data = await getQuotes()
        if (!mounted) return
        setState({ quotes: data.quotes || [], partial: !!data.partial, lastAt: new Date() })
        setErr('')
      } catch (e) {
        if (!mounted) return
        setErr(e.message || 'Falha ao obter cotações')
      }
    }
    fetchOnce()
    timer = setInterval(fetchOnce, 15000)
    return () => { mounted = false; if (timer) clearInterval(timer) }
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Criptomoedas</strong>
        <small>
          {state.lastAt ? `Atualizado às ${state.lastAt.toLocaleTimeString()}` : 'Atualizando…'}
          {state.partial ? ' · parcial' : ''}
        </small>
      </div>
      {err && <div className="error-banner" style={{ marginTop: '0.5rem' }}>{err}</div>}
      <div className="crypto-grid">
        {state.quotes.length === 0 ? (
          <p>Carregando cotações…</p>
        ) : (
          state.quotes.map((q) => (
            <div key={q.symbol} className="crypto-card">
              <div className="crypto-row">
                <span className="crypto-symbol">{q.symbol.replace('USDT','')}</span>
                <span className="crypto-price">
                  {Number(q.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                </span>
              </div>
              <div className="crypto-meta">
                <small className={q.stale ? 'stale' : ''}>{q.stale ? 'stale' : 'ok'} · {new Date(q.updatedAt).toLocaleTimeString()}</small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { token } = useAuth()
  return (
    <div className="wallet-page page-with-topnav">
      <div className="wallet-container">
        <div className="wallet-card">
          <h1 className="section-title">Dashboard</h1>
          {/* Widget de preços de criptomoedas (atualiza a cada 15s) */}
          <CryptoPricesWidget />
        </div>
      </div>
    </div>
  )
}