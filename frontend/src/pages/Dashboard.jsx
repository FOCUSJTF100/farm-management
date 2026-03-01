import { useEffect, useState } from 'react'
import axios from 'axios'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = ['#15803d', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    Promise.all([
      axios.get('/api/livestock/stats'),
      axios.get('/api/crops/stats'),
      axios.get('/api/finances/stats'),
      axios.get('/api/workers/stats'),
    ]).then(([l, c, f, w]) => setData({ l: l.data, c: c.data, f: f.data, w: w.data }))
      .catch(console.error)
  }, [])

  if (!data) return <div className="loading">⏳ Loading dashboard...</div>
  const { l, c, f, w } = data

  return (
    <div>
      <div className="stats">
        <div className="stat"><div className="stat-icon bg-green">🐄</div><div><div className="stat-val">{l.total}</div><div className="stat-lbl">Total Livestock</div></div></div>
        <div className="stat"><div className="stat-icon bg-amber">🌾</div><div><div className="stat-val">{c.total}</div><div className="stat-lbl">Crop Records</div></div></div>
        <div className="stat"><div className="stat-icon bg-green">💵</div><div><div className="stat-val" style={{color: f.netProfit >= 0 ? 'var(--green)' : 'var(--red)'}}>${Math.abs(f.netProfit).toLocaleString()}</div><div className="stat-lbl">{f.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}</div></div></div>
        <div className="stat"><div className="stat-icon bg-blue">👷</div><div><div className="stat-val">{w.active}</div><div className="stat-lbl">Active Workers</div></div></div>
      </div>

      <div className="charts-grid">
        <div className="card">
          <div className="card-head"><span className="card-title">💰 Income vs Expenses</span></div>
          <div className="card-body">
            <div style={{display:'flex',justifyContent:'space-around',marginBottom:'1rem'}}>
              <div style={{textAlign:'center'}}><div style={{fontSize:'1.15rem',fontWeight:700,color:'var(--green)'}}>${f.totalIncome.toLocaleString()}</div><div style={{fontSize:'.75rem',color:'var(--gray-500)'}}>Income</div></div>
              <div style={{textAlign:'center'}}><div style={{fontSize:'1.15rem',fontWeight:700,color:'var(--red)'}}>${f.totalExpense.toLocaleString()}</div><div style={{fontSize:'.75rem',color:'var(--gray-500)'}}>Expenses</div></div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={[{name:'Income',value:f.totalIncome},{name:'Expenses',value:f.totalExpense}]} innerRadius={45} outerRadius={75} paddingAngle={5} dataKey="value">
                  <Cell fill="#15803d"/><Cell fill="#ef4444"/>
                </Pie>
                <Tooltip formatter={v=>`$${v.toLocaleString()}`}/><Legend/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">🐄 Livestock by Type</span></div>
          <div className="card-body">
            {l.byType.length > 0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={l.byType.map(x=>({name:x._id,count:x.count}))}>
                  <XAxis dataKey="name" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/>
                  <Tooltip/>
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {l.byType.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="empty"><div className="ico">🐄</div><p>No livestock yet</p></div>}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">🌾 Crop Status</span></div>
          <div className="card-body">
            {c.byStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={210}>
                <PieChart>
                  <Pie data={c.byStatus.map(x=>({name:x._id,value:x.count}))} outerRadius={75} paddingAngle={4} dataKey="value" label={({name,value})=>`${name}: ${value}`}>
                    {c.byStatus.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="empty"><div className="ico">🌾</div><p>No crops yet</p></div>}
          </div>
        </div>

        <div className="card">
          <div className="card-head"><span className="card-title">👷 Workers</span></div>
          <div className="card-body">
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1rem',marginBottom:'1rem'}}>
              <div style={{textAlign:'center',padding:'.875rem',background:'var(--green-bg)',borderRadius:'var(--radius)'}}><div style={{fontSize:'1.4rem',fontWeight:700}}>{w.active}</div><div style={{fontSize:'.75rem',color:'var(--gray-500)'}}>Active</div></div>
              <div style={{textAlign:'center',padding:'.875rem',background:'var(--blue-light)',borderRadius:'var(--radius)'}}><div style={{fontSize:'1.4rem',fontWeight:700}}>{w.total}</div><div style={{fontSize:'.75rem',color:'var(--gray-500)'}}>Total</div></div>
            </div>
            <div style={{fontSize:'.85rem',textAlign:'center',color:'var(--gray-500)'}}>Monthly Payroll: <strong style={{color:'var(--gray-900)'}}>${w.monthlyPayroll.toLocaleString()}</strong></div>
          </div>
        </div>
      </div>
    </div>
  )
}
