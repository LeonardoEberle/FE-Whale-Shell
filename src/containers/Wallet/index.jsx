import React, { useEffect, useMemo, useRef, useState } from 'react'

const COINS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 68000 },
  { symbol: 'ETH', name: 'Ethereum', price: 3800 },
  { symbol: 'SOL', name: 'Solana', price: 150 },
  { symbol: 'ADA', name: 'Cardano', price: 0.45 },
  { symbol: 'MATIC', name: 'Polygon', price: 0.75 },
  { symbol: 'XRP', name: 'XRP', price: 0.65 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.12 },
  { symbol: 'DOT', name: 'Polkadot', price: 5.25 },
  { symbol: 'AVAX', name: 'Avalanche', price: 35 },
  { symbol: 'LINK', name: 'Chainlink', price: 14.2 }
]

function fmtUSD(n) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

export default function Wallet() {
  const [type, setType] = useState('buy')
  const [symbol, setSymbol] = useState('')
  const [qty, setQty] = useState('0.00000000')
  const fileInputRef = useRef(null)
  const [processing, setProcessing] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMsg, setModalMsg] = useState('Transação registrada com sucesso.')
  const modalTimerRef = useRef(null)
  const [showNewTx, setShowNewTx] = useState(false)
  // Estado mínimo: sem efeitos colaterais extras

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

  const selected = useMemo(() => COINS.find(c => c.symbol === symbol) || null, [symbol])
  const unitPrice = selected?.price ?? 0
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
      const coin = COINS.find(c => c.symbol === h.symbol)
      current += (coin?.price ?? 0) * h.quantity
    }
    const changePct = invested > 0 ? ((current - invested) / invested) * 100 : 0
    return { invested, current, changePct }
  }, [holdings])

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
                  {COINS.map(c => <option key={c.symbol} value={c.symbol}>{c.symbol} - {c.name}</option>)}
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
          <h2 className="section-title">Portfolio por Criptomoeda</h2>
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
                  const coin = COINS.find(c=>c.symbol===h.symbol)
                  const current = (coin?.price ?? 0) * h.quantity
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