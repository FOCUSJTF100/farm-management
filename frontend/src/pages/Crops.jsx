import { useEffect, useState } from 'react'
import axios from 'axios'

const TYPES = ['Grain','Vegetable','Fruit','Legume','Tuber','Cash Crop','Other']
const STATUSES = ['Planted','Growing','Harvested','Failed']
const sBadge = s => ({Planted:'badge-blue',Growing:'badge-green',Harvested:'badge-amber',Failed:'badge-red'}[s]||'badge-gray')
const blank = { name:'',type:'Grain',fieldName:'',fieldSize:'',plantingDate:'',expectedHarvestDate:'',status:'Planted',yieldAmount:'',irrigationType:'Rain-fed',notes:'' }

export default function Crops() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [search, setSearch] = useState('')
  const [fType, setFType] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    const p = {}
    if (search) p.search = search
    if (fType) p.type = fType
    if (fStatus) p.status = fStatus
    const { data } = await axios.get('/api/crops', { params: p })
    setItems(data); setLoading(false)
  }

  useEffect(() => { load() }, [search, fType, fStatus])

  const openAdd = () => { setEditing(null); setForm(blank); setError(''); setModal(true) }
  const openEdit = item => {
    setEditing(item)
    setForm({ name:item.name, type:item.type, fieldName:item.fieldName, fieldSize:item.fieldSize, plantingDate:item.plantingDate?.slice(0,10)||'', expectedHarvestDate:item.expectedHarvestDate?.slice(0,10)||'', status:item.status, yieldAmount:item.yieldAmount||'', irrigationType:item.irrigationType, notes:item.notes||'' })
    setError(''); setModal(true)
  }

  const save = async e => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      if (editing) await axios.put(`/api/crops/${editing._id}`, form)
      else await axios.post('/api/crops', form)
      setModal(false); load()
    } catch (err) { setError(err.response?.data?.message || 'Error saving') }
    setBusy(false)
  }

  const del = async id => {
    if (!confirm('Delete this record?')) return
    await axios.delete(`/api/crops/${id}`); load()
  }

  const f = k => e => setForm({ ...form, [k]: e.target.value })
  const fmt = d => d ? new Date(d).toLocaleDateString() : '—'

  return (
    <div>
      <div className="card">
        <div className="card-head">
          <div className="filters">
            <input className="search" placeholder="🔍 Search crop or field..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <select value={fType} onChange={e=>setFType(e.target.value)} style={{width:'auto'}}><option value="">All Types</option>{TYPES.map(t=><option key={t}>{t}</option>)}</select>
            <select value={fStatus} onChange={e=>setFStatus(e.target.value)} style={{width:'auto'}}><option value="">All Status</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add</button>
        </div>
        {loading ? <div className="loading">⏳ Loading...</div> : items.length===0 ? <div className="empty"><div className="ico">🌾</div><p>No records found</p></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Name</th><th>Type</th><th>Field</th><th>Size(ac)</th><th>Planted</th><th>Harvest</th><th>Status</th><th>Yield(kg)</th><th>Actions</th></tr></thead>
            <tbody>{items.map(i=>(
              <tr key={i._id}>
                <td><strong>{i.name}</strong></td><td>{i.type}</td><td>{i.fieldName}</td><td>{i.fieldSize}</td>
                <td>{fmt(i.plantingDate)}</td><td>{fmt(i.expectedHarvestDate)}</td>
                <td><span className={`badge ${sBadge(i.status)}`}>{i.status}</span></td>
                <td>{i.yieldAmount||'—'}</td>
                <td><div className="actions"><button className="btn btn-secondary btn-sm" onClick={()=>openEdit(i)}>✏️</button><button className="btn btn-danger btn-sm" onClick={()=>del(i._id)}>🗑️</button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>

      {modal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-head"><div className="modal-title">{editing?'Edit Crop':'Add Crop'}</div><button className="modal-close" onClick={()=>setModal(false)}>✕</button></div>
            <form onSubmit={save}>
              <div className="modal-body">
                {error&&<div className="alert alert-error">{error}</div>}
                <div className="form-grid">
                  <div className="form-group"><label>Crop Name *</label><input value={form.name} onChange={f('name')} required placeholder="e.g. Maize"/></div>
                  <div className="form-group"><label>Type *</label><select value={form.type} onChange={f('type')}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div className="form-group"><label>Field Name *</label><input value={form.fieldName} onChange={f('fieldName')} required placeholder="e.g. North Field"/></div>
                  <div className="form-group"><label>Field Size (acres) *</label><input type="number" value={form.fieldSize} onChange={f('fieldSize')} required min="0" step="0.1" placeholder="0"/></div>
                  <div className="form-group"><label>Planting Date *</label><input type="date" value={form.plantingDate} onChange={f('plantingDate')} required/></div>
                  <div className="form-group"><label>Expected Harvest</label><input type="date" value={form.expectedHarvestDate} onChange={f('expectedHarvestDate')}/></div>
                  <div className="form-group"><label>Status</label><select value={form.status} onChange={f('status')}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
                  <div className="form-group"><label>Irrigation</label><select value={form.irrigationType} onChange={f('irrigationType')}>{['Rain-fed','Drip','Sprinkler','Flood','None'].map(i=><option key={i}>{i}</option>)}</select></div>
                  <div className="form-group"><label>Yield (kg)</label><input type="number" value={form.yieldAmount} onChange={f('yieldAmount')} min="0" placeholder="0"/></div>
                  <div className="form-group full"><label>Notes</label><textarea value={form.notes} onChange={f('notes')} placeholder="Additional notes..."/></div>
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
