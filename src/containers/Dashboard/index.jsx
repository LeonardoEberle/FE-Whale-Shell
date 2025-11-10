import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getQuotes } from '../../services/market.js'

function CryptoPricesWidget() {
  const symbols = useMemo(() => [
    'BTCUSDT',
    'ETHUSDT',
    'SOLUSDT',
    'ADAUSDT',
    'MATICUSDT',
    'XRPUSDT',
    'DOGEUSDT',
    'DOTUSDT',
    'AVAXUSDT',
    'LINKUSDT',
    'LTCUSDT',
    'TRXUSDT'
  ], [])
  const [state, setState] = useState({ quotes: [], partial: false, lastAt: null })
  const [err, setErr] = useState('')

  useEffect(() => {
    let mounted = true
    let timer = null
    async function fetchOnce() {
      try {
        const data = await getQuotes(symbols)
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
  }, [symbols])

  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: '0.75rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Criptomoedas</strong>
        <small>
          {state.lastAt ? `Atualizado às ${state.lastAt.toLocaleTimeString()}` : 'Atualizando…'}
          {state.partial ? ' · parcial' : ''}
        </small>
      </div>
      {err && <div className="error-banner" style={{ marginTop: '0.5rem' }}>{err}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
        {state.quotes.length === 0 ? (
          <p>Carregando cotações…</p>
        ) : (
          state.quotes.map((q) => (
            <div key={q.symbol} style={{ background: '#fafafa', border: '1px solid #eee', borderRadius: 6, padding: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600 }}>{q.symbol.replace('USDT','')}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {Number(q.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                </span>
              </div>
              <div style={{ marginTop: 4 }}>
                <small style={{ color: q.stale ? '#b26b00' : '#666' }}>
                  {q.stale ? 'stale' : 'ok'} · {new Date(q.updatedAt).toLocaleTimeString()}
                </small>
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
    <div className="login-page page-with-topnav">
      <div className="login-card">
        <h1 className="login-title">Dashboard</h1>
        {/* Widget de preços de criptomoedas (atualiza a cada 15s) */}
        <CryptoPricesWidget />
      </div>
    </div>
  )
}