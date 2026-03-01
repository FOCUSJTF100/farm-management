import { useEffect, useState } from 'react'
import axios from 'axios'

const INC_CATS = ['Livestock Sale','Crop Sale','Equipment Sale','Other Income']
const EXP_CATS = ['Feed & Supplements','Seeds & Fertilizer','Equipment Purchase','Equipment Maintenance','Labor/Wages','Veterinary','Pesticides','Utilities','Loan Repayment','Other Expense']
const blank = { type:'Income', category:'Livestock Sale', amount:'', description:'', date:new Date().toISOString().slice(0,10), paymentMethod:'Cash', reference:'' }

export default function Finances() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [fType, setFType] = useState('')
  const [summary, setSummary] = useState({ totalIncome:0, totalExpense:0, netProfit:0 })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    const p = {}; if (fType) p.type = fType
    const [r, s] = await Promise.all([axios.get('/api/finances', { params: p }), axios.get('/api/finances/stats')])
    setItems(r.data); setSummary(s.data); setLoading(false)
  }

  useEffect(() => { load() }, [fType])

  const cats = form.type === 'Income' ? INC_CATS : EXP_CATS

  const changeType = t => setForm({ ...form, type:t, category:(t==='Income'?INC_CATS:EXP_CATS)[0] })

  const openAdd = () => { setEditing(null); setForm(blank); setError(''); setModal(true) }
  const openEdit = item => {
    setEditing(item)
    setForm({ type:item.type, category:item.category, amount:item.amount, description:item.description||'', date:item.date?.slice(0,10)||'', paymentMethod:item.paymentMethod, reference:item.reference||'' })
    setError(''); setModal(true)
  }

  const save = async e => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      if (editing) await axios.put(`/api/finances/${editing._id}`, form)
      else await axios.post('/api/finances', form)
      setModal(false); load()
    } catch (err) { setError(err.response?.data?.message || 'Error saving') }
    setBusy(false)
  }

  const del = async id => {
    if (!confirm('Delete this transaction?')) return
    await axios.delete(`/api/finances/${id}`); load()
  }

  const f = k => e => setForm({ ...form, [k]: e.target.value })

  return (
    <div>
      <div className="stats" style={{marginBottom:'1.5rem'}}>
        <div className="stat"><div className="stat-icon bg-green">📈</div><div><div className="stat-val" style={{color:'var(--green)'}}>${summary.totalIncome.toLocaleString()}</div><div className="stat-lbl">Total Income</div></div></div>
        <div className="stat"><div className="stat-icon bg-red">📉</div><div><div className="stat-val" style={{color:'var(--red)'}}>${summary.totalExpense.toLocaleString()}</div><div className="stat-lbl">Total Expenses</div></div></div>
        <div className="stat"><div className="stat-icon" style={{background:summary.netProfit>=0?'var(--green-light)':'var(--red-light)'}}>💰</div><div><div className="stat-val" style={{color:summary.netProfit>=0?'var(--green)':'var(--red)'}}>${Math.abs(summary.netProfit).toLocaleString()}</div><div className="stat-lbl">{summary.netProfit>=0?'Net Profit':'Net Loss'}</div></div></div>
      </div>

      <div className="card">
        <div className="card-head">
          <div className="filters">
            <select value={fType} onChange={e=>setFType(e.target.value)} style={{width:'auto'}}><option value="">All Transactions</option><option value="Income">Income</option><option value="Expense">Expenses</option></select>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add</button>
        </div>
        {loading ? <div className="loading">⏳ Loading...</div> : items.length===0 ? <div className="empty"><div className="ico">💰</div><p>No transactions found</p></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Date</th><th>Type</th><th>Category</th><th>Amount</th><th>Description</th><th>Payment</th><th>Actions</th></tr></thead>
            <tbody>{items.map(i=>(
              <tr key={i._id}>
                <td>{new Date(i.date).toLocaleDateString()}</td>
                <td><span className={`badge ${i.type==='Income'?'badge-green':'badge-red'}`}>{i.type}</span></td>
                <td>{i.category}</td>
                <td style={{fontWeight:700,color:i.type==='Income'?'var(--green)':'var(--red)'}}>{i.type==='Income'?'+':'-'}${Number(i.amount).toLocaleString()}</td>
                <td>{i.description||'—'}</td><td>{i.paymentMethod}</td>
                <td><div className="actions"><button className="btn btn-secondary btn-sm" onClick={()=>openEdit(i)}>✏️</button><button className="btn btn-danger btn-sm" onClick={()=>del(i._id)}>🗑️</button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>

      {modal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-head"><div className="modal-title">{editing?'Edit Transaction':'Add Transaction'}</div><button className="modal-close" onClick={()=>setModal(false)}>✕</button></div>
            <form onSubmit={save}>
              <div className="modal-body">
                {error&&<div className="alert alert-error">{error}</div>}
                <div className="form-grid">
                  <div className="form-group"><label>Type *</label><select value={form.type} onChange={e=>changeType(e.target.value)}><option>Income</option><option>Expense</option></select></div>
                  <div className="form-group"><label>Category *</label><select value={form.category} onChange={f('category')}>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div className="form-group"><label>Amount ($) *</label><input type="number" value={form.amount} onChange={f('amount')} required min="0" step="0.01" placeholder="0.00"/></div>
                  <div className="form-group"><label>Date *</label><input type="date" value={form.date} onChange={f('date')} required/></div>
                  <div className="form-group"><label>Payment Method</label><select value={form.paymentMethod} onChange={f('paymentMethod')}>{['Cash','Bank Transfer','Mobile Money','Cheque','Other'].map(m=><option key={m}>{m}</option>)}</select></div>
                  <div className="form-group"><label>Reference #</label><input value={form.reference} onChange={f('reference')} placeholder="Receipt no."/></div>
                  <div className="form-group full"><label>Description</label><input value={form.description} onChange={f('description')} placeholder="Brief description..."/></div>
                </div>
              </div>
              <div className="modal-foot"><button type="button" className="btn btn-secondary" onClick={()=>setModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy?'Saving...':'Save'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
