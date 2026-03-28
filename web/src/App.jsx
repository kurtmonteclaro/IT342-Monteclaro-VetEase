import { useMemo, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const INITIAL_REGISTER_FORM = {
  name: '',
  email: '',
  password: '',
}

const INITIAL_LOGIN_FORM = {
  email: '',
  password: '',
}

function App() {
  const [mode, setMode] = useState('login')
  const [registerForm, setRegisterForm] = useState(INITIAL_REGISTER_FORM)
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  const title = useMemo(() => {
    if (currentUser) {
      return 'Clinic Access Granted'
    }
    return mode === 'login' ? 'Welcome Back' : 'Create Your Portal'
  }, [currentUser, mode])

  const subtitle = useMemo(() => {
    if (currentUser) {
      return 'Your account is connected and ready for the next clinic workflow.'
    }
    return mode === 'login'
      ? 'Sign in to manage reservations, pet owner records, and daily clinic flow.'
      : 'Set up a secure account for a smoother appointment and patient experience.'
  }, [currentUser, mode])

  const clearAlerts = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const onChangeRegister = (event) => {
    const { name, value } = event.target
    setRegisterForm((previous) => ({ ...previous, [name]: value }))
  }

  const onChangeLogin = (event) => {
    const { name, value } = event.target
    setLoginForm((previous) => ({ ...previous, [name]: value }))
  }

  const readErrorMessage = async (response) => {
    try {
      const payload = await response.json()
      if (payload.message) {
        return payload.message
      }
      return 'Request failed. Please try again.'
    } catch {
      return 'Request failed. Please try again.'
    }
  }

  const submitRegister = async (event) => {
    event.preventDefault()
    clearAlerts()

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      const payload = await response.json()
      setSuccessMessage(payload.message || 'Registration successful. You can now log in.')
      setRegisterForm(INITIAL_REGISTER_FORM)
      setMode('login')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const submitLogin = async (event) => {
    event.preventDefault()
    clearAlerts()

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      const payload = await response.json()
      setCurrentUser(payload)
      setSuccessMessage('Login successful. Dashboard access granted.')
      setLoginForm(INITIAL_LOGIN_FORM)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setCurrentUser(null)
    clearAlerts()
    setMode('login')
  }

  return (
    <main className="screen">
      <section className="shell">
        <aside className="brand-panel">
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-mark-core">+</span>
          </div>
          <p className="eyebrow">Veterinary Reservation Platform</p>
          <h1 className="brand-title">VetEase</h1>
          <p className="brand-copy">
            A calmer digital front desk for pet owners and clinic staff, designed to make
            registration, login, and appointment coordination feel clear and trustworthy.
          </p>

          <div className="brand-grid">
            <article className="info-card">
              <span className="info-kicker">For Pet Owners</span>
              <p>Simple access to booking details, account records, and future appointments.</p>
            </article>
            <article className="info-card">
              <span className="info-kicker">For Clinics</span>
              <p>Organized sign-ins and cleaner reservation flow for the daily schedule.</p>
            </article>
            <article className="info-card info-card-wide">
              <span className="info-kicker">Phase 1 Focus</span>
              <p>Secure registration and login with a polished first impression for your system.</p>
            </article>
          </div>
        </aside>

        <section className="panel">
          <div className="panel-header">
            <p className="panel-kicker">{currentUser ? 'Dashboard' : mode === 'login' ? 'Login' : 'Register'}</p>
            <h2>{title}</h2>
            <p className="panel-copy">{subtitle}</p>
          </div>

          {errorMessage ? <p className="alert alert-error">{errorMessage}</p> : null}
          {successMessage ? <p className="alert alert-success">{successMessage}</p> : null}

          {currentUser ? (
            <div className="dashboard">
              <div className="dashboard-card">
                <span className="dashboard-label">Signed in as</span>
                <strong>{currentUser.name}</strong>
                <p>{currentUser.email}</p>
              </div>
              <button type="button" onClick={logout}>Logout</button>
            </div>
          ) : (
            <>
              <div className="mode-switch" role="tablist" aria-label="Authentication Mode">
                <button
                  type="button"
                  className={mode === 'login' ? 'active' : ''}
                  onClick={() => {
                    clearAlerts()
                    setMode('login')
                  }}
                >
                  Login
                </button>
                <button
                  type="button"
                  className={mode === 'register' ? 'active' : ''}
                  onClick={() => {
                    clearAlerts()
                    setMode('register')
                  }}
                >
                  Register
                </button>
              </div>

              {mode === 'register' ? (
                <form className="form" onSubmit={submitRegister}>
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={registerForm.name}
                    onChange={onChangeRegister}
                    required
                  />

                  <label htmlFor="registerEmail">Email Address</label>
                  <input
                    id="registerEmail"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={registerForm.email}
                    onChange={onChangeRegister}
                    required
                  />

                  <label htmlFor="registerPassword">Password</label>
                  <input
                    id="registerPassword"
                    name="password"
                    type="password"
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    value={registerForm.password}
                    onChange={onChangeRegister}
                    required
                  />

                  <button type="submit" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              ) : (
                <form className="form" onSubmit={submitLogin}>
                  <label htmlFor="loginEmail">Email Address</label>
                  <input
                    id="loginEmail"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginForm.email}
                    onChange={onChangeLogin}
                    required
                  />

                  <label htmlFor="loginPassword">Password</label>
                  <input
                    id="loginPassword"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={onChangeLogin}
                    required
                  />

                  <button type="submit" disabled={loading}>
                    {loading ? 'Signing In...' : 'Login to VetEase'}
                  </button>
                </form>
              )}
            </>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
