import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { walletApi } from '../../services/wallet.js'
import { getQuotes } from '../../services/market.js'

function fmtUSD(n) { return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) }

export default function Wallet() {
  const { token } = useAuth()
  const [type, setType] = useState('buy')
  const [symbol, setSymbol] = useState('')
  const [qty, setQty] = useState('0.00000000')
  const fileInputRef = useRef(null)
  const [processing, setProcessing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMsg, setModalMsg] = useState('Transação registrada com sucesso.')
  const modalTimerRef = useRef(null)
  const [showNewTx, setShowNewTx] = useState(false)
  const [quotes, setQuotes] = useState([])
  const [lastAt, setLastAt] = useState(null)
  const [err, setErr] = useState('')
  // Estado mínimo: sem efeitos colaterais extras

  // Lista fixa de criptomoedas conhecidas (exibição), usando cotações reais da Function
  const COINS = useMemo(() => [
    'BTCUSDT',
    'ETHUSDT',
    'XRPUSDT',
    'SOLUSDT',
    'DOGEUSDT',
    'ADAUSDT',
    'LINKUSDT',
    'DOTUSDT',
    'UNIUSDT',
    'LTCUSDT',
    'MATICUSDT',
    'JUPUSDT'
  ], [])

  // holdings: { symbol, quantity, invested, avgPrice }
  const [holdings, setHoldings] = useState(() => {
    try {
      const raw = localStorage.getItem('wallet_holdings')
      if (raw) return JSON.parse(raw)
    } catch {}
    return []
  })

  useEffect(() => {
    try {
      localStorage.setItem('wallet_holdings', JSON.stringify(holdings))
    } catch {}
  }, [holdings])

  // Sincroniza alterações locais com o MS-Wallet (quando autenticado)
  useEffect(() => {
    if (!token) return
    try {
      walletApi.updateMyWallet({ holdings }, token).catch(() => {})
    } catch {}
  }, [holdings, token])

  // Carrega/limpa carteira ao logar/deslogar e sincroniza com MS-Wallet
  useEffect(() => {
    let cancelled = false
    async function run() {
      if (!token) {
        setHoldings([])
        try { localStorage.removeItem('wallet_holdings') } catch {}
        return
      }
      try {
        const doc = await walletApi.getMyWallet(token)
        const serverHoldings = Array.isArray(doc?.portfolio?.holdings) ? doc.portfolio.holdings : []
        if (!cancelled) setHoldings(serverHoldings)
      } catch (err) {
        // 404: sem carteira criada ainda, mantém local
        // outras falhas: ignora e usa localStorage
        // console.warn('Wallet sync error:', err)
      }
    }
    run()
    return () => { cancelled = true }
  }, [token])

  // Carrega cotações reais do BFF (mesmo conjunto exibido no Dashboard)
  useEffect(() => {
    let mounted = true
    let timer = null
    async function fetchOnce() {
      try {
        const data = await getQuotes()
        if (!mounted) return
        setQuotes(data.quotes || [])
        setLastAt(new Date())
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

  const quotesMap = useMemo(() => {
    const m = new Map()
    for (const q of quotes) m.set(q.symbol.toUpperCase(), Number(q.price) || 0)
    return m
  }, [quotes])
  const unitPrice = quotesMap.get(symbol.toUpperCase()) ?? 0
  const qtyNum = (() => {
    const s = String(qty).trim().replace(',', '.')
    const n = parseFloat(s)
    return Number.isFinite(n) ? n : 0
  })()
  const totalUSD = unitPrice * qtyNum

  const totals = useMemo(() => {
    let invested = 0
    let current = 0
    for (const h of holdings) {
      invested += h.invested
      const p = quotesMap.get(h.symbol.toUpperCase()) ?? 0
      current += p * h.quantity
    }
    const changePct = invested > 0 ? ((current - invested) / invested) * 100 : 0
    return { invested, current, changePct }
  }, [holdings, quotesMap])

  function showModal(msg = 'Transação registrada com sucesso.') {
    setModalMsg(msg)
    setModalOpen(true)
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current)
    modalTimerRef.current = setTimeout(() => setModalOpen(false), 2000)
  }

  function addTransaction() {
    if (processing) return false
    if (!symbol || qtyNum <= 0) return false
    setProcessing(true)
    const price = unitPrice
    setHoldings(prev => {
      const idx = prev.findIndex(h => h.symbol === symbol)
      if (type === 'buy') {
        if (idx === -1) {
          const next = [...prev, { symbol, quantity: qtyNum, invested: qtyNum * price, avgPrice: price }]
          showModal('Transação registrada com sucesso.')
          return next
        }
        const h = { ...prev[idx] }
        h.quantity = h.quantity + qtyNum
        h.invested = h.invested + qtyNum * price
        h.avgPrice = h.invested / h.quantity
        const next = [...prev]
        next[idx] = h
        showModal('Transação registrada com sucesso.')
        return next
      } else {
        if (idx === -1) return prev
        const h = { ...prev[idx] }
        const available = h.quantity
        if (qtyNum > available + 1e-8) {
          alert('Quantidade de venda não pode exceder a quantidade possuída.')
          return prev
        }
        const newQty = available - qtyNum
        if (newQty <= 1e-8) {
          const next = prev.filter(x => x.symbol !== symbol)
          showModal('Transação registrada com sucesso.')
          return next
        }
        const newInvested = h.invested * (newQty / available)
        h.quantity = newQty
        h.invested = newInvested
        h.avgPrice = h.invested / h.quantity
        const next = [...prev]
        next[idx] = h
        showModal('Transação registrada com sucesso.')
        return next
      }
    })
    setProcessing(false)
    return true
  }

  function removeCoin(sym) {
    setHoldings(prev => prev.filter(h => h.symbol !== sym))
  }

  function exportJson() {
    const data = { holdings, exportedAt: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'wallet.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function importJson(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result)
        if (Array.isArray(parsed)) setHoldings(parsed)
        else if (Array.isArray(parsed.holdings)) setHoldings(parsed.holdings)
        // sincroniza após importação
        if (token) walletApi.updateMyWallet({ holdings: Array.isArray(parsed) ? parsed : parsed.holdings }, token).catch(()=>{})
      } catch {}
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
    reader.readAsText(file)
  }

  function resetForm() {
    setSymbol('')
    setQty('0.00000000')
    setType('buy')
  }

  return (
    <div className="wallet-page page-with-topnav">
      <div className="wallet-container">
        {/* Header */}
        <div className="wallet-header">
          <h1>Minha Carteira</h1>
          <div className="wallet-actions">
            <button className="btn btn-primary" onClick={() => setShowNewTx(v => !v)}>
              {showNewTx ? 'Ocultar Transação' : '+ Adicionar Transação'}
            </button>
            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>Importar</button>
            <button className="btn btn-secondary" onClick={exportJson}>Exportar</button>
            <input ref={fileInputRef} type="file" accept="application/json" style={{ display: 'none' }} onChange={importJson} />
          </div>
        </div>

        {/* Summary */}
        <div className="wallet-card">
          <div className="summary-grid">
            <div className="summary-item">
              <span className="summary-label">Valor Total Investido</span>
              <span className="summary-value">{fmtUSD(totals.invested)}</span>
            </div>
          </div>
        </div>

        {/* New Transaction */}
        {showNewTx && (
        <div className="wallet-card" id="new-tx">
          <h2 className="section-title">Nova Transação</h2>
          <div className="form-grid">
            <div className="field">
              <span>Criptomoeda</span>
              <div className="input select-wrapper">
                <select className="select-input" value={symbol} onChange={(e)=>setSymbol(e.target.value)} aria-label="Selecionar criptomoeda">
                  <option value="">Selecione uma criptomoeda</option>
                  {COINS.map(sym => {
                    const short = sym.endsWith('USDT') ? sym.replace('USDT','') : sym
                    return <option key={sym} value={sym}>{short}</option>
                  })}
                </select>
              </div>
            </div>
            <div className="field">
              <span>Tipo de Transação</span>
              <div className="toggle">
                <button className={`toggle-btn ${type==='buy'?'active':''}`} onClick={()=>setType('buy')}>Compra</button>
                <button className={`toggle-btn ${type==='sell'?'active':''}`} onClick={()=>setType('sell')}>Venda</button>
              </div>
            </div>
            <div className="field">
              <span>Preço Atual (USD)</span>
              <div className="input"><input readOnly value={unitPrice.toFixed(2)} /></div>
            </div>
            <div className="field">
              <span>Quantidade</span>
              <div className="input"><input
                type="text"
                inputMode="decimal"
                pattern="[0-9.,]*"
                placeholder="0.00000000"
                value={qty}
                onChange={(e)=>{
                  const raw = e.target.value
                  const cleaned = raw.replace(/[Ee\-\+]/g,'').replace(/[^0-9.,]/g,'')
                  setQty(cleaned)
                }}
                onBlur={()=>{
                  const s = String(qty).trim().replace(',', '.')
                  const n = parseFloat(s)
                  if (Number.isFinite(n) && n >= 0) setQty(n.toFixed(8))
                }}
              /></div>
              {type==='sell' && symbol && (
                <small style={{opacity:0.8}}>Disponível: {holdings.find(h=>h.symbol===symbol)?.quantity?.toFixed(8) || '0.00000000'}</small>
              )}
            </div>
            <div className="field">
              <span>Valor Total (USD)</span>
              <div className="input"><input readOnly value={totalUSD.toFixed(2)} /></div>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" disabled={processing} onClick={()=>{ const ok = addTransaction(); if (ok) resetForm(); }}>Adicionar Transação</button>
            <button className="btn btn-secondary" onClick={resetForm}>Cancelar</button>
          </div>
        </div>
        )}

        {/* Portfolio by Crypto */}
        <div className="wallet-card">
          <h2 className="section-title">Carteira de Criptomoeda</h2>
          {holdings.length === 0 ? (
            <div className="empty">Nenhuma transação encontrada. Adicione sua primeira transação!</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Criptomoeda</th>
                  <th>Quantidade</th>
                  <th>Preço Médio</th>
                  <th>Investido</th>
                  <th>Atual</th>
                  <th>P/L</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {holdings.map(h => {
                  const current = (quotesMap.get(h.symbol.toUpperCase()) ?? 0) * h.quantity
                  const pl = current - h.invested
                  const plPct = h.invested>0 ? (pl / h.invested) * 100 : 0
                  return (
                    <tr key={h.symbol}>
                      <td>{h.symbol}</td>
                      <td>{h.quantity.toFixed(8)}</td>
                      <td>{fmtUSD(h.avgPrice)}</td>
                      <td>{fmtUSD(h.invested)}</td>
                      <td>{fmtUSD(current)}</td>
                      <td className={pl>=0? 'pos':'neg'}>{fmtUSD(pl)} ({plPct.toFixed(2)}%)</td>
                      <td><button className="btn btn-secondary" onClick={()=>removeCoin(h.symbol)}>Remover</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {modalOpen && (
        <div className="modal-backdrop" onClick={()=>setModalOpen(false)}>
          <div className="modal-card" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-title">Transação concluída</div>
            <div>{modalMsg}</div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={()=>setModalOpen(false)}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}