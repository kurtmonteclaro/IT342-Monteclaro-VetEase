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

    return NAVIGATION_CONFIG.filter((item) => isAdmin || item.key !== 'admin')
  }, [currentUser, isAdmin])

  const activeNavigation = useMemo(
    () => navigationItems.find((item) => item.key === activeView) || null,
    [activeView, navigationItems],
  )

  const title = useMemo(() => {
    if (!currentUser) {
      return mode === 'login' ? 'Welcome Back' : 'Create Your Portal'
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
  }, [activeView, currentUser, mode])

  const subtitle = useMemo(() => {
    if (!currentUser) {
      return mode === 'login'
        ? 'Sign in to manage reservations, pet owner records, and daily clinic flow.'
        : 'Set up a secure account for a smoother appointment and patient experience.'
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
  }, [activeView, currentUser, mode])

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
      const [petPayload, appointmentPayload] = await Promise.all([
        fetchJson('/api/pets'),
        fetchJson('/api/appointments/mine'),
      ])

      setPets(petPayload || [])
      setAppointments(appointmentPayload || [])

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
      }
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
    navigate('/dashboard', { replace: true })
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
        <aside className={currentUser && isAdmin ? 'brand-panel admin-sidebar' : 'brand-panel'}>
          <div className="brand-mark" aria-hidden="true">
            <span className="brand-mark-core">+</span>
          </div>

          <div>
            <p className="eyebrow">Veterinary Reservation Platform</p>
            <h1 className="brand-title">VetEase</h1>
            <p className="brand-copy">A calmer digital front desk for pet owners and clinic staff, designed to make registration, login, and appointment coordination feel clear and trustworthy.</p>
          </div>

          {!currentUser ? (
            <div className="brand-grid">
              <article className="info-card"><span className="info-kicker">For Pet Owners</span><p>Simple access to booking details, account records, and future appointments.</p></article>
              <article className="info-card"><span className="info-kicker">For Clinics</span><p>Organized sign-ins and cleaner reservation flow for the daily schedule.</p></article>
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

              <article className="info-card info-card-wide">
                <span className="info-kicker">At A Glance</span>
                <p>{pendingAppointments.length} pending reviews and {todayAppointments.length} appointments today.</p>
              </article>

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

              <article className="info-card info-card-wide">
                <span className="info-kicker">Your Journey</span>
                <p>Keep your pets updated and make bookings from a focused, distraction-free workspace.</p>
              </article>

              <button type="button" className="logout-button" onClick={logout}>Logout</button>
            </div>
          )}
        </aside>

        <section className="panel">
          <div className="panel-header">
            <p className="panel-kicker">{panelKicker}</p>
            <h2>{title}</h2>
            <p className="panel-copy">{subtitle}</p>
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
