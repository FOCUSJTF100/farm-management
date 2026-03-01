import { useEffect, useState } from 'react'
import axios from 'axios'

const ROLES = ['Farm Manager','Field Worker','Livestock Keeper','Driver','Security','Other']
const EMP = ['Full-time','Part-time','Seasonal','Contract']
const STATUSES = ['Active','Inactive','On Leave']
const sBadge = s => ({Active:'badge-green',Inactive:'badge-gray','On Leave':'badge-amber'}[s]||'badge-gray')
const blank = { firstName:'',lastName:'',phone:'',email:'',role:'Field Worker',employmentType:'Full-time',salary:'',salaryPeriod:'Monthly',startDate:new Date().toISOString().slice(0,10),status:'Active',nationalId:'',address:'',notes:'' }

export default function Workers() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [search, setSearch] = useState('')
  const [fRole, setFRole] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    const p = {}
    if (search) p.search = search
    if (fRole) p.role = fRole
    if (fStatus) p.status = fStatus
    const { data } = await axios.get('/api/workers', { params: p })
    setItems(data); setLoading(false)
  }

  useEffect(() => { load() }, [search, fRole, fStatus])

  const openAdd = () => { setEditing(null); setForm(blank); setError(''); setModal(true) }
  const openEdit = item => {
    setEditing(item)
    setForm({ firstName:item.firstName, lastName:item.lastName, phone:item.phone||'', email:item.email||'', role:item.role, employmentType:item.employmentType, salary:item.salary||'', salaryPeriod:item.salaryPeriod, startDate:item.startDate?.slice(0,10)||'', status:item.status, nationalId:item.nationalId||'', address:item.address||'', notes:item.notes||'' })
    setError(''); setModal(true)
  }

  const save = async e => {
    e.preventDefault(); setBusy(true); setError('')
    try {
      if (editing) await axios.put(`/api/workers/${editing._id}`, form)
      else await axios.post('/api/workers', form)
      setModal(false); load()
    } catch (err) { setError(err.response?.data?.message || 'Error saving') }
    setBusy(false)
  }

  const del = async id => {
    if (!confirm('Delete this worker?')) return
    await axios.delete(`/api/workers/${id}`); load()
  }

  const f = k => e => setForm({ ...form, [k]: e.target.value })

  return (
    <div>
      <div className="card">
        <div className="card-head">
          <div className="filters">
            <input className="search" placeholder="🔍 Search name..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <select value={fRole} onChange={e=>setFRole(e.target.value)} style={{width:'auto'}}><option value="">All Roles</option>{ROLES.map(r=><option key={r}>{r}</option>)}</select>
            <select value={fStatus} onChange={e=>setFStatus(e.target.value)} style={{width:'auto'}}><option value="">All Status</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add</button>
        </div>
        {loading ? <div className="loading">⏳ Loading...</div> : items.length===0 ? <div className="empty"><div className="ico">👷</div><p>No workers found</p></div> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Name</th><th>Role</th><th>Type</th><th>Phone</th><th>Salary</th><th>Since</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{items.map(i=>(
              <tr key={i._id}>
                <td><strong>{i.firstName} {i.lastName}</strong></td>
                <td>{i.role}</td><td>{i.employmentType}</td><td>{i.phone||'—'}</td>
                <td>{i.salary?`$${Number(i.salary).toLocaleString()}/${i.salaryPeriod==='Monthly'?'mo':i.salaryPeriod==='Weekly'?'wk':'day'}`:'—'}</td>
                <td>{i.startDate?new Date(i.startDate).toLocaleDateString():'—'}</td>
                <td><span className={`badge ${sBadge(i.status)}`}>{i.status}</span></td>
                <td><div className="actions"><button className="btn btn-secondary btn-sm" onClick={()=>openEdit(i)}>✏️</button><button className="btn btn-danger btn-sm" onClick={()=>del(i._id)}>🗑️</button></div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </div>

      {modal && (
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="modal">
            <div className="modal-head"><div className="modal-title">{editing?'Edit Worker':'Add Worker'}</div><button className="modal-close" onClick={()=>setModal(false)}>✕</button></div>
            <form onSubmit={save}>
              <div className="modal-body">
                {error&&<div className="alert alert-error">{error}</div>}
                <div className="form-grid">
                  <div className="form-group"><label>First Name *</label><input value={form.firstName} onChange={f('firstName')} required placeholder="John"/></div>
                  <div className="form-group"><label>Last Name *</label><input value={form.lastName} onChange={f('lastName')} required placeholder="Doe"/></div>
                  <div className="form-group"><label>Phone</label><input value={form.phone} onChange={f('phone')} placeholder="+255 700 000 000"/></div>
                  <div className="form-group"><label>Email</label><input type="email" value={form.email} onChange={f('email')} placeholder="worker@farm.com"/></div>
                  <div className="form-group"><label>Role *</label><select value={form.role} onChange={f('role')}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
                  <div className="form-group"><label>Employment Type</label><select value={form.employmentType} onChange={f('employmentType')}>{EMP.map(e=><option key={e}>{e}</option>)}</select></div>
                  <div className="form-group"><label>Salary ($)</label><input type="number" value={form.salary} onChange={f('salary')} min="0" placeholder="0"/></div>
                  <div className="form-group"><label>Salary Period</label><select value={form.salaryPeriod} onChange={f('salaryPeriod')}>{['Daily','Weekly','Monthly'].map(p=><option key={p}>{p}</option>)}</select></div>
                  <div className="form-group"><label>Start Date *</label><input type="date" value={form.startDate} onChange={f('startDate')} required/></div>
                  <div className="form-group"><label>Status</label><select value={form.status} onChange={f('status')}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
                  <div className="form-group"><label>National ID</label><input value={form.nationalId} onChange={f('nationalId')} placeholder="ID Number"/></div>
                  <div className="form-group"><label>Address</label><input value={form.address} onChange={f('address')} placeholder="Home address"/></div>
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
