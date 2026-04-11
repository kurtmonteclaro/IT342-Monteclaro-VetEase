import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AdminTitleStrip, AuthForms, NavButtons, WorkspaceView } from './components/AppSections'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const SESSION_KEY = 'vetease-session'

const INITIAL_REGISTER_FORM = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'CLIENT',
}

const INITIAL_LOGIN_FORM = {
  username: '',
  password: '',
}

const INITIAL_PET_FORM = {
  name: '',
  species: '',
  breed: '',
  age: '',
  notes: '',
  vaccineHistory: '',
}

const INITIAL_BOOKING_FORM = {
  petId: '',
  serviceId: '',
  date: '',
  time: '',
  notes: '',
}

const INITIAL_SETTINGS_FORM = {
  openingTime: '09:00',
  closingTime: '17:00',
  slotMinutes: 30,
}

const NAVIGATION_CONFIG = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'pets', label: 'Pets' },
  { key: 'services', label: 'Services' },
  { key: 'book', label: 'Book' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'admin', label: 'Admin' },
]

const VIEW_TO_PATH = {
  dashboard: '/dashboard',
  pets: '/pets',
  services: '/services',
  book: '/book',
  appointments: '/appointments',
  admin: '/admin',
}

const PATH_TO_VIEW = {
  '/dashboard': 'dashboard',
  '/pets': 'pets',
  '/services': 'services',
  '/book': 'book',
  '/appointments': 'appointments',
  '/admin': 'admin',
}

const CLIENT_ONLY_PATHS = ['/pets', '/services', '/book', '/appointments']

function todayLocalDateString() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function App() {
  const [registerForm, setRegisterForm] = useState(INITIAL_REGISTER_FORM)
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM)
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(globalThis.localStorage.getItem(SESSION_KEY) || 'null')
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const [services, setServices] = useState([])
  const [pets, setPets] = useState([])
  const [petForm, setPetForm] = useState(INITIAL_PET_FORM)
  const [editingPetId, setEditingPetId] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [bookingForm, setBookingForm] = useState(INITIAL_BOOKING_FORM)
  const [availableSlots, setAvailableSlots] = useState([])
  const [pendingAppointments, setPendingAppointments] = useState([])
  const [todayAppointments, setTodayAppointments] = useState([])
  const [settingsForm, setSettingsForm] = useState(INITIAL_SETTINGS_FORM)
  const [blockedDates, setBlockedDates] = useState([])
  const [blockedDateInput, setBlockedDateInput] = useState('')

  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname.toLowerCase()

  const currentUser = session?.user || null
  const token = session?.token || ''
  const isAdmin = currentUser?.role === 'ADMIN'
  const mode = pathname === '/register' ? 'register' : 'login'
  const activeView = PATH_TO_VIEW[pathname] || 'dashboard'

  const nextAppointment = useMemo(
    () => appointments.find((appointment) => ['PENDING', 'CONFIRMED'].includes(appointment.status)) || null,
    [appointments],
  )

  const navigationItems = useMemo(() => {
    if (!currentUser) {
      return []
    }

    if (isAdmin) {
      return [
        { key: 'dashboard', label: 'Dashboard' },
        { key: 'admin', label: 'Admin' },
      ]
    }

    return NAVIGATION_CONFIG.filter((item) => item.key !== 'admin')
  }, [currentUser, isAdmin])

  const activeNavigation = useMemo(
    () => navigationItems.find((item) => item.key === activeView) || null,
    [activeView, navigationItems],
  )

  const title = useMemo(() => {
    if (!currentUser) {
      return mode === 'login' ? 'Welcome Back' : 'Create Your Portal'
    }

    if (isAdmin) {
      const adminLabels = {
        dashboard: 'Clinic Overview',
        admin: 'Admin Control Center',
      }
      return adminLabels[activeView] || 'VetEase'
    }

    const labels = {
      dashboard: 'Clinic Access Granted',
      pets: 'Pet Profiles',
      services: 'Clinic Services',
      book: 'Book Appointment',
      appointments: 'Appointment Manager',
      admin: 'Admin Control Center',
    }

    return labels[activeView] || 'VetEase'
  }, [activeView, currentUser, mode, isAdmin])

  const subtitle = useMemo(() => {
    if (!currentUser) {
      return mode === 'login'
        ? 'Sign in to manage reservations, pet owner records, and daily clinic flow.'
        : 'Set up a secure account for a smoother appointment and patient experience.'
    }

    if (isAdmin) {
      const adminLabels = {
        dashboard: 'Pending requests, today\'s schedule, and clinic settings in one place.',
        admin: 'Approve requests, monitor today\'s queue, and manage schedule settings.',
      }
      return adminLabels[activeView] || 'Your clinic workspace is ready.'
    }

    const labels = {
      dashboard: 'Your clinic workspace is ready with pets, bookings, and admin actions in one place.',
      pets: 'Manage pet records before scheduling visits.',
      services: 'Review the clinic services and time allocation for each visit.',
      book: 'Choose a pet, pick a service, and request an available slot.',
      appointments: 'Track active bookings and their latest status updates.',
      admin: 'Approve requests, monitor today\'s queue, and manage schedule settings.',
    }

    return labels[activeView] || 'Your clinic workspace is ready.'
  }, [activeView, currentUser, mode, isAdmin])

  const panelKicker = currentUser ? 'Workspace' : (mode === 'login' ? 'Login' : 'Register')
  const shellClassName = currentUser ? `shell ${isAdmin ? 'shell-admin' : 'shell-client'}` : 'shell'

  const navigateToView = (view) => {
    navigate(VIEW_TO_PATH[view] || '/dashboard')
  }

  const navigateToMode = (nextMode) => {
    navigate(nextMode === 'register' ? '/register' : '/login')
  }

  useEffect(() => {
    void loadServices()
  }, [])

  useEffect(() => {
    if (!currentUser) {
      return
    }

    void refreshAuthenticatedData(currentUser.role === 'ADMIN')
  }, [currentUser, token])

  useEffect(() => {
    if (!bookingForm.date || !bookingForm.serviceId) {
      setAvailableSlots([])
      return
    }

    if (bookingForm.date < todayLocalDateString()) {
      setAvailableSlots([])
      return
    }

    void loadAvailability(bookingForm.date, bookingForm.serviceId)
  }, [bookingForm.date, bookingForm.serviceId])

  useEffect(() => {
    const isAuthPath = pathname === '/login' || pathname === '/register'
    const isWorkspacePath = Boolean(PATH_TO_VIEW[pathname])

    if (!currentUser) {
      if (!isAuthPath) {
        navigate('/login', { replace: true })
      }
      return
    }

    if (isAuthPath || pathname === '/') {
      navigate('/dashboard', { replace: true })
      return
    }

    if (!isWorkspacePath) {
      navigate('/dashboard', { replace: true })
      return
    }

    if (pathname === '/admin' && !isAdmin) {
      navigate('/dashboard', { replace: true })
      return
    }

    if (isAdmin && CLIENT_ONLY_PATHS.includes(pathname)) {
      navigate('/admin', { replace: true })
    }
  }, [currentUser, isAdmin, navigate, pathname])

  const clearAlerts = () => {
    setErrorMessage('')
    setSuccessMessage('')
  }

  const readErrorMessage = async (response) => {
    try {
      const payload = await response.json()
      return payload.message || 'Request failed. Please try again.'
    } catch {
      return 'Request failed. Please try again.'
    }
  }

  const fetchJson = async (path, options = {}, withAuth = true) => {
    const requestHeaders = {
      'Content-Type': 'application/json',
      ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: requestHeaders,
    })

    if (response.status === 204) {
      return null
    }

    if (!response.ok) {
      throw new Error(await readErrorMessage(response))
    }

    return response.json()
  }

  const loadServices = async () => {
    try {
      const payload = await fetchJson('/api/services', {}, false)
      setServices(payload || [])
    } catch {
      setServices([])
    }
  }

  const loadAvailability = async (date, serviceId) => {
    try {
      const payload = await fetchJson(`/api/availability?date=${date}&serviceId=${serviceId}`, {}, false)
      setAvailableSlots(payload || [])
    } catch (error) {
      setAvailableSlots([])
      setErrorMessage(error.message)
    }
  }

  const refreshAuthenticatedData = async (includeAdminData) => {
    try {
      if (includeAdminData) {
        const [pendingPayload, todayPayload, settingsPayload, blockedPayload] = await Promise.all([
          fetchJson('/api/admin/appointments/pending'),
          fetchJson('/api/admin/appointments/today'),
          fetchJson('/api/admin/settings'),
          fetchJson('/api/admin/blocked-dates'),
        ])

        setPendingAppointments(pendingPayload || [])
        setTodayAppointments(todayPayload || [])
        setSettingsForm({
          openingTime: settingsPayload?.openingTime?.slice(0, 5) || '09:00',
          closingTime: settingsPayload?.closingTime?.slice(0, 5) || '17:00',
          slotMinutes: settingsPayload?.slotMinutes || 30,
        })
        setBlockedDates(blockedPayload || [])
        setPets([])
        setAppointments([])
        return
      }

      const [petPayload, appointmentPayload] = await Promise.all([
        fetchJson('/api/pets'),
        fetchJson('/api/appointments/mine'),
      ])

      setPets(petPayload || [])
      setAppointments(appointmentPayload || [])
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const persistSession = (payload) => {
    const nextSession = {
      token: payload.accessToken,
      user: payload.user,
    }

    setSession(nextSession)
    globalThis.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    navigate(payload.user?.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true })
  }

  const submitRegister = async (event) => {
    event.preventDefault()
    clearAlerts()
    setLoading(true)

    try {
      const payload = await fetchJson('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      }, false)

      persistSession(payload)
      setRegisterForm(INITIAL_REGISTER_FORM)
      setSuccessMessage('Registration successful.')
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
      const payload = await fetchJson('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      }, false)

      persistSession(payload)
      setLoginForm(INITIAL_LOGIN_FORM)
      setSuccessMessage('Login successful.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    globalThis.localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setPets([])
    setAppointments([])
    setPendingAppointments([])
    setTodayAppointments([])
    setPetForm(INITIAL_PET_FORM)
    setBookingForm(INITIAL_BOOKING_FORM)
    setEditingPetId(null)
    navigate('/login', { replace: true })
    clearAlerts()
  }

  const submitPet = async (event) => {
    event.preventDefault()
    clearAlerts()

    try {
      await fetchJson(editingPetId ? `/api/pets/${editingPetId}` : '/api/pets', {
        method: editingPetId ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...petForm,
          age: petForm.age ? Number(petForm.age) : null,
        }),
      })

      setPetForm(INITIAL_PET_FORM)
      setEditingPetId(null)
      setSuccessMessage(editingPetId ? 'Pet profile updated.' : 'Pet profile added.')
      await refreshAuthenticatedData(currentUser.role === 'ADMIN')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const editPet = (pet) => {
    setEditingPetId(pet.id)
    setPetForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age ?? '',
      notes: pet.notes ?? '',
      vaccineHistory: pet.vaccineHistory ?? '',
    })
    navigateToView('pets')
  }

  const deletePet = async (petId) => {
    clearAlerts()

    try {
      await fetchJson(`/api/pets/${petId}`, { method: 'DELETE' })
      setSuccessMessage('Pet profile removed.')
      if (editingPetId === petId) {
        setEditingPetId(null)
        setPetForm(INITIAL_PET_FORM)
      }
      await refreshAuthenticatedData(currentUser.role === 'ADMIN')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const submitBooking = async (event) => {
    event.preventDefault()
    clearAlerts()

    const today = todayLocalDateString()
    if (!bookingForm.date || bookingForm.date < today) {
      setErrorMessage('Choose today or a future date. Past dates cannot be booked.')
      return
    }
    if (bookingForm.date === today && bookingForm.time) {
      const slotTime = String(bookingForm.time).slice(0, 5)
      const now = new Date()
      const [h, m] = slotTime.split(':').map(Number)
      const slotDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0)
      if (slotDate < now) {
        setErrorMessage('That time has already passed. Pick another slot.')
        return
      }
    }

    try {
      await fetchJson('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          petId: Number(bookingForm.petId),
          serviceId: Number(bookingForm.serviceId),
          date: bookingForm.date,
          time: bookingForm.time,
          notes: bookingForm.notes,
        }),
      })

      setBookingForm(INITIAL_BOOKING_FORM)
      setAvailableSlots([])
      setSuccessMessage('Appointment request submitted as pending.')
      await refreshAuthenticatedData(currentUser.role === 'ADMIN')
      navigateToView('appointments')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const cancelAppointment = async (appointmentId, adminMode = false) => {
    clearAlerts()

    try {
      await fetchJson(adminMode ? `/api/admin/appointments/${appointmentId}/cancel` : `/api/appointments/${appointmentId}/cancel`, {
        method: 'POST',
      })

      setSuccessMessage('Appointment cancelled.')
      await refreshAuthenticatedData(currentUser.role === 'ADMIN')
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const runAdminAction = async (appointmentId, action, message) => {
    clearAlerts()

    try {
      await fetchJson(`/api/admin/appointments/${appointmentId}/${action}`, { method: 'POST' })
      setSuccessMessage(message)
      await refreshAuthenticatedData(true)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const saveSettings = async (event) => {
    event.preventDefault()
    clearAlerts()

    try {
      await fetchJson('/api/admin/settings', {
        method: 'PUT',
        body: JSON.stringify({
          ...settingsForm,
          slotMinutes: Number(settingsForm.slotMinutes),
        }),
      })

      setSuccessMessage('Clinic settings updated.')
      await refreshAuthenticatedData(true)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const addBlockedDate = async (event) => {
    event.preventDefault()
    clearAlerts()

    try {
      await fetchJson(`/api/admin/blocked-dates?date=${blockedDateInput}`, { method: 'POST' })
      setBlockedDateInput('')
      setSuccessMessage('Blocked date added.')
      await refreshAuthenticatedData(true)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const removeBlockedDate = async (id) => {
    clearAlerts()

    try {
      await fetchJson(`/api/admin/blocked-dates/${id}`, { method: 'DELETE' })
      setSuccessMessage('Blocked date removed.')
      await refreshAuthenticatedData(true)
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  return (
    <main className={currentUser ? 'screen screen-authenticated' : 'screen'}>
      <section className={shellClassName}>
        <div className="shell-orb shell-orb-one" aria-hidden="true" />
        <div className="shell-orb shell-orb-two" aria-hidden="true" />
        <aside className={currentUser && isAdmin ? 'brand-panel admin-sidebar' : 'brand-panel'}>
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-mark-core">+</span>
          </div>

          {currentUser ? (
            <div className="brand-hero brand-hero-session">
              <p className="eyebrow">Veterinary Reservation Platform</p>
              <h1 className="brand-title">VetEase</h1>
              <p className="brand-copy">A calmer digital front desk for pet owners and clinic staff, designed to make registration, login, and appointment coordination feel clear and trustworthy.</p>
            </div>
          ) : null}

          {!currentUser ? (
            <div className="brand-landing">
              <div className="brand-hero">
                <p className="eyebrow">Veterinary Reservation Platform</p>
                <h1 className="brand-title">VetEase</h1>
                <p className="brand-copy">A calmer digital front desk for pet owners and clinic staff, designed to make registration, login, and appointment coordination feel clear and trustworthy.</p>
                <div className="brand-metrics" aria-label="Platform Highlights">
                  <article className="metric-card">
                    <span className="metric-value">Smart</span>
                    <p>Booking flow with clear scheduling choices.</p>
                  </article>
                  <article className="metric-card">
                    <span className="metric-value">Calm</span>
                    <p>Focused patient and staff workspace with less clutter.</p>
                  </article>
                </div>
                <div className="brand-audience">
                  <article className="info-card"><span className="info-kicker">For Pet Owners</span><p>Simple access to booking details, account records, and future appointments.</p></article>
                  <article className="info-card"><span className="info-kicker">For Clinics</span><p>Organized sign-ins and cleaner reservation flow for the daily schedule.</p></article>
                </div>
              </div>
              <article className="info-card info-card-wide"><span className="info-kicker">Core Features</span><p>Pets, bookings, appointment review, and admin approval in one workspace.</p></article>
            </div>
          ) : isAdmin ? (
            <div className="workspace-nav admin-nav-wrap">
              <div className="workspace-user">
                <span className="info-kicker">Admin Session</span>
                <strong>{currentUser.firstName} {currentUser.lastName}</strong>
                <p>@{currentUser.username}</p>
                <p>{currentUser.email}</p>
              </div>

              <NavButtons items={navigationItems} activeView={activeView} onChange={navigateToView} className="side-nav" />

              <div className="sidebar-stat-grid">
                <article className="info-card info-card-wide compact-info-card">
                  <span className="info-kicker">Pending Reviews</span>
                  <strong>{pendingAppointments.length}</strong>
                  <p>Requests waiting for staff action.</p>
                </article>
                <article className="info-card info-card-wide compact-info-card">
                  <span className="info-kicker">Today&apos;s Queue</span>
                  <strong>{todayAppointments.length}</strong>
                  <p>Visits currently on the clinic schedule.</p>
                </article>
              </div>

              <button type="button" className="logout-button" onClick={logout}>Logout</button>
            </div>
          ) : (
            <div className="workspace-nav">
              <div className="workspace-user">
                <span className="info-kicker">Signed In</span>
                <strong>{currentUser.firstName} {currentUser.lastName}</strong>
                <p>@{currentUser.username}</p>
                <p>{currentUser.role}</p>
              </div>

              <div className="sidebar-stat-grid">
                <article className="info-card info-card-wide compact-info-card">
                  <span className="info-kicker">Pet Profiles</span>
                  <strong>{pets.length}</strong>
                  <p>Keep records current before each visit.</p>
                </article>
                <article className="info-card info-card-wide compact-info-card">
                  <span className="info-kicker">Appointments</span>
                  <strong>{appointments.length}</strong>
                  <p>Track requests, updates, and upcoming care.</p>
                </article>
              </div>

              <button type="button" className="logout-button" onClick={logout}>Logout</button>
            </div>
          )}
        </aside>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">{panelKicker}</p>
              <h2>{title}</h2>
              <p className="panel-copy">{subtitle}</p>
            </div>
            {currentUser ? (
              <div className="panel-badge-cluster" aria-label="Workspace Status">
                <span className="panel-badge">{isAdmin ? 'Clinic Ops' : 'Client Portal'}</span>
                <span className="panel-badge panel-badge-soft">{activeNavigation?.label || 'Access'}</span>
              </div>
            ) : null}
          </div>

          {isAdmin && currentUser ? (
            <AdminTitleStrip
              activeLabel={activeNavigation?.label || 'Dashboard'}
              pendingCount={pendingAppointments.length}
              todayCount={todayAppointments.length}
            />
          ) : null}

          {errorMessage ? <p className="alert alert-error">{errorMessage}</p> : null}
          {successMessage ? <p className="alert alert-success">{successMessage}</p> : null}

          {!currentUser ? (
            <>
              <div className="mode-switch" role="tablist" aria-label="Authentication Mode">
                <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { clearAlerts(); navigateToMode('login') }}>Login</button>
                <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { clearAlerts(); navigateToMode('register') }}>Register</button>
              </div>
              <AuthForms
                mode={mode}
                loading={loading}
                registerForm={registerForm}
                setRegisterForm={setRegisterForm}
                loginForm={loginForm}
                setLoginForm={setLoginForm}
                submitRegister={submitRegister}
                submitLogin={submitLogin}
              />
            </>
          ) : (
            <>
              {!isAdmin ? <NavButtons items={navigationItems} activeView={activeView} onChange={navigateToView} className="client-top-nav" /> : null}
              <div className="workspace-body">
                <WorkspaceView
                  activeView={activeView}
                  currentUser={currentUser}
                  pets={pets}
                  appointments={appointments}
                  nextAppointment={nextAppointment}
                  pendingAppointments={pendingAppointments}
                  services={services}
                  petForm={petForm}
                  setPetForm={setPetForm}
                  editingPetId={editingPetId}
                  submitPet={submitPet}
                  setEditingPetId={setEditingPetId}
                  setPetFormToInitial={() => setPetForm(INITIAL_PET_FORM)}
                  editPet={editPet}
                  deletePet={deletePet}
                  bookingForm={bookingForm}
                  setBookingForm={setBookingForm}
                  availableSlots={availableSlots}
                  submitBooking={submitBooking}
                  cancelAppointment={cancelAppointment}
                  todayAppointments={todayAppointments}
                  runAdminAction={runAdminAction}
                  settingsForm={settingsForm}
                  setSettingsForm={setSettingsForm}
                  saveSettings={saveSettings}
                  blockedDateInput={blockedDateInput}
                  setBlockedDateInput={setBlockedDateInput}
                  addBlockedDate={addBlockedDate}
                  blockedDates={blockedDates}
                  removeBlockedDate={removeBlockedDate}
                />
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
