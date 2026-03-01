import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, register } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async e => {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      if (isLogin) await login(form.email, form.password)
      else await register(form.name, form.email, form.password)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }
    setBusy(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="ico">🌿</div>
          <h1>Farm Data Management</h1>
          <p>Sign in to manage your farm</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form className="auth-form" onSubmit={submit}>
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={set} placeholder="John Farmer" required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={set} placeholder="you@farm.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={set} placeholder="••••••••" required minLength={6} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '.65rem' }} disabled={busy}>
            {busy ? 'Please wait...' : isLogin ? '🔑 Sign In' : '🚀 Register'}
          </button>
        </form>
        <div className="auth-switch">
          {isLogin ? <>No account? <span onClick={() => { setIsLogin(false); setError('') }}>Register here</span></>
                   : <>Have an account? <span onClick={() => { setIsLogin(true); setError('') }}>Sign in</span></>}
        </div>
      </div>
    </div>
  )
}
