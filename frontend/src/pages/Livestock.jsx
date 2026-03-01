import { useEffect, useState } from 'react'
import axios from 'axios'

const TYPES = ['Cattle','Goat','Sheep','Pig','Poultry','Horse','Other']
const HEALTH = ['Healthy','Sick','Under Treatment','Quarantined']
const hBadge = s => ({Healthy:'badge-green',Sick:'badge-red','Under Treatment':'badge-amber',Quarantined:'badge-gray'}[s]||'badge-gray')
const blank = { name:'',type:'Cattle',breed:'',gender:'Unknown',age:'',weight:'',healthStatus:'Healthy',tagNumber:'',estimatedValue:'',notes:'' }

export default function Livestock() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [search, setSearch] = useState('')
  const [fType, setFType] = useState('')
  const [fHealth, setFHealth] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    const p = {}
    if (search) p.search = search
    if (fType) p.type = fType
    if (fHealth) p.healthStatus = fHealth
    const { data } = await axios.get('/api/livestock', { params: p })
    setItems(data); setLoading(false)
  }

  useEffect(() => { load() }, [search, fType, fHealth])

  const openAdd = () => { setEditing(null); setForm(blank); setError(''); setModal(true) }
  const openEdit = item => {
    setEditing(item)
    setForm({ name:item.name, type:item.type, breed:item.breed||'', gender:item.gender, age:item.age||'', weight:item.weight||'', healthStatus:item.healthStatus, tagNumber:item.tagNumber||'', estimatedValue:item.estimatedValue||'', notes:item.notes||'' })
    setError(''); setModal(true)
  }

  const save = async e => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      if (editing) await axios.put(`/api/livestock/${editing._id}`, form)
      else await axios.post('/api/livestock', form)
      setModal(false); load()
    } catch (err) { setError(err.response?.data?.message || 'Error saving') }
    setBusy(false)
  }

  const del = async id => {
    if (!confirm('Delete this record?')) return
    await axios.delete(`/api/livestock/${id}`); load()
  }

  const f = k => e => setForm({ ...form, [k]: e.target.value })

  return (
    <div>
      <div className="card">
        <div className="card-head">
          <div className="filters">
            <input className="search" placeholder="🔍 Search name..." value={search} onChange={e => setSearch(e.target.value)} />
            <select value={fType} onChange={e => setFType(e.target.value)} style={{width:'auto'}}>
              <option value="">All Types</option>{TYPES.map(t=><option key={t}>{t}</option>)}
            </select>
            <select value={fHealth} onChange={e => setFHealth(e.target.value)} style={{width:'auto'}}>
              <option value="">All Health</option>{HEALTH.map(h=><option key={h}>{h}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add</button>
        </div>
        {loading ? <div className="loading">⏳ Loading...</div> : items.length === 0 ? <div className="empty"><div className="ico">🐄</div><p>No records found</p></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Tag</th><th>Name</th><th>Type</th><th>Breed</th><th>Gender</th><th>Age</th><th>Weight(kg)</th><th>Health</th><th>Value($)</th><th>Actions</th></tr></thead>
            <tbody>{items.map(i=>(
              <tr key={i._id}>
                <td>{i.tagNumber||'—'}</td><td><strong>{i.name}</strong></td><td>{i.type}</td><td>{i.breed||'—'}</td>
                <td>{i.gender}</td><td>{i.age!=null?`${i.age}y`:'—'}</td><td>{i.weight||'—'}</td>
                <td><span className={`badge ${hBadge(i.healthStatus)}`}>{i.healthStatus}</span></td>
                <td>{i.estimatedValue?`$${Number(i.estimatedValue).toLocaleString()}`:'—'}</td>
                <td><div className="actions"><button className="btn btn-secondary btn-sm" onClick={()=>openEdit(i)}>✏️</button><button className="btn btn-danger btn-sm" onClick={()=>del(i._id)}>🗑️</button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>

      {modal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-head"><div className="modal-title">{editing?'Edit Livestock':'Add Livestock'}</div><button className="modal-close" onClick={()=>setModal(false)}>✕</button></div>
            <form onSubmit={save}>
              <div className="modal-body">
                {error&&<div className="alert alert-error">{error}</div>}
                <div className="form-grid">
                  <div className="form-group"><label>Name *</label><input value={form.name} onChange={f('name')} required placeholder="e.g. Bessie"/></div>
                  <div className="form-group"><label>Tag #</label><input value={form.tagNumber} onChange={f('tagNumber')} placeholder="LV-001"/></div>
                  <div className="form-group"><label>Type *</label><select value={form.type} onChange={f('type')}>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div className="form-group"><label>Breed</label><input value={form.breed} onChange={f('breed')} placeholder="e.g. Friesian"/></div>
                  <div className="form-group"><label>Gender</label><select value={form.gender} onChange={f('gender')}>{['Male','Female','Unknown'].map(g=><option key={g}>{g}</option>)}</select></div>
                  <div className="form-group"><label>Health</label><select value={form.healthStatus} onChange={f('healthStatus')}>{HEALTH.map(h=><option key={h}>{h}</option>)}</select></div>
                  <div className="form-group"><label>Age (years)</label><input type="number" value={form.age} onChange={f('age')} min="0" placeholder="0"/></div>
                  <div className="form-group"><label>Weight (kg)</label><input type="number" value={form.weight} onChange={f('weight')} min="0" placeholder="0"/></div>
                  <div className="form-group"><label>Value ($)</label><input type="number" value={form.estimatedValue} onChange={f('estimatedValue')} min="0" placeholder="0"/></div>
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
