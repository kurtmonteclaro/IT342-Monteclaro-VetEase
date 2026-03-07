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
      return 'VetEase Dashboard'
    }
    return mode === 'login' ? 'Welcome Back' : 'Create Account'
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
      <section className="panel">
        <p className="eyebrow">VetEase</p>
        <h1>{title}</h1>

        {errorMessage ? <p className="alert alert-error">{errorMessage}</p> : null}
        {successMessage ? <p className="alert alert-success">{successMessage}</p> : null}

        {currentUser ? (
          <div className="dashboard">
            <p>Signed in as <strong>{currentUser.name}</strong>.</p>
            <p>Email: {currentUser.email}</p>
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
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={registerForm.name}
                  onChange={onChangeRegister}
                  required
                />

                <label htmlFor="registerEmail">Email</label>
                <input
                  id="registerEmail"
                  name="email"
                  type="email"
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
                  value={registerForm.password}
                  onChange={onChangeRegister}
                  required
                />

                <button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </form>
            ) : (
              <form className="form" onSubmit={submitLogin}>
                <label htmlFor="loginEmail">Email</label>
                <input
                  id="loginEmail"
                  name="email"
                  type="email"
                  value={loginForm.email}
                  onChange={onChangeLogin}
                  required
                />

                <label htmlFor="loginPassword">Password</label>
                <input
                  id="loginPassword"
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={onChangeLogin}
                  required
                />

                <button type="submit" disabled={loading}>
                  {loading ? 'Signing in...' : 'Login'}
                </button>
              </form>
            )}
          </>
        )}
      </section>
    </main>
  )
}

export default App
