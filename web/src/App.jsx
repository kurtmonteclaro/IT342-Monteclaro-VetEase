import { useEffect, useMemo, useState } from 'react'
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

function App() {
  const [mode, setMode] = useState('login')
  const [registerForm, setRegisterForm] = useState(INITIAL_REGISTER_FORM)
  const [loginForm, setLoginForm] = useState(INITIAL_LOGIN_FORM)
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem(SESSION_KEY) || 'null')
    } catch {
      return null
    }
  })
  const [activeView, setActiveView] = useState('dashboard')
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

  const currentUser = session?.user || null
  const token = session?.token || ''

  const nextAppointment = useMemo(
    () => appointments.find((appointment) => ['PENDING', 'CONFIRMED'].includes(appointment.status)) || null,
    [appointments],
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
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
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
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    setActiveView(payload.user.role === 'ADMIN' ? 'admin' : 'dashboard')
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
    window.localStorage.removeItem(SESSION_KEY)
    setSession(null)
    setPets([])
    setAppointments([])
    setPendingAppointments([])
    setTodayAppointments([])
    setPetForm(INITIAL_PET_FORM)
    setBookingForm(INITIAL_BOOKING_FORM)
    setEditingPetId(null)
    setMode('login')
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
    setActiveView('pets')
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
      setActiveView('appointments')
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

  const navigationItems = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'pets', label: 'Pets' },
    { key: 'services', label: 'Services' },
    { key: 'book', label: 'Book' },
    { key: 'appointments', label: 'Appointments' },
    ...(currentUser?.role === 'ADMIN' ? [{ key: 'admin', label: 'Admin' }] : []),
  ]

  const renderAuthForm = () => {
    if (mode === 'register') {
      return (
        <form className="form" onSubmit={submitRegister}>
          <label htmlFor="registerUsername">Username</label>
          <input id="registerUsername" type="text" placeholder="Choose a username" value={registerForm.username} onChange={(event) => setRegisterForm((previous) => ({ ...previous, username: event.target.value }))} required />

          <div className="form-split">
            <div>
              <label htmlFor="registerFirstName">First Name</label>
              <input id="registerFirstName" type="text" placeholder="First name" value={registerForm.firstName} onChange={(event) => setRegisterForm((previous) => ({ ...previous, firstName: event.target.value }))} required />
            </div>
            <div>
              <label htmlFor="registerLastName">Last Name</label>
              <input id="registerLastName" type="text" placeholder="Last name" value={registerForm.lastName} onChange={(event) => setRegisterForm((previous) => ({ ...previous, lastName: event.target.value }))} required />
            </div>
          </div>

          <label htmlFor="registerEmail">Email Address</label>
          <input id="registerEmail" type="email" placeholder="you@example.com" value={registerForm.email} onChange={(event) => setRegisterForm((previous) => ({ ...previous, email: event.target.value }))} required />

          <label htmlFor="registerPassword">Password</label>
          <input id="registerPassword" type="password" minLength={8} placeholder="Minimum 8 characters" value={registerForm.password} onChange={(event) => setRegisterForm((previous) => ({ ...previous, password: event.target.value }))} required />

          <label htmlFor="registerRole">Role</label>
          <select id="registerRole" value={registerForm.role} onChange={(event) => setRegisterForm((previous) => ({ ...previous, role: event.target.value }))}>
            <option value="CLIENT">CLIENT</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <button type="submit" disabled={loading}>{loading ? 'Creating Account...' : 'Create Account'}</button>
        </form>
      )
    }

    return (
      <form className="form" onSubmit={submitLogin}>
        <label htmlFor="loginUsername">Username</label>
        <input id="loginUsername" type="text" placeholder="Enter your username" value={loginForm.username} onChange={(event) => setLoginForm((previous) => ({ ...previous, username: event.target.value }))} required />

        <label htmlFor="loginPassword">Password</label>
        <input id="loginPassword" type="password" placeholder="Enter your password" value={loginForm.password} onChange={(event) => setLoginForm((previous) => ({ ...previous, password: event.target.value }))} required />

        <button type="submit" disabled={loading}>{loading ? 'Signing In...' : 'Login to VetEase'}</button>
      </form>
    )
  }

  const renderWorkspace = () => {
    if (activeView === 'dashboard') {
      return (
        <div className="workspace-grid">
          <article className="surface-card">
            <span className="surface-kicker">Account</span>
            <strong>{currentUser.firstName} {currentUser.lastName}</strong>
            <p>@{currentUser.username}</p>
            <p>{currentUser.email}</p>
            <p>Role: {currentUser.role}</p>
          </article>

          <article className="surface-card">
            <span className="surface-kicker">Next Appointment</span>
            {nextAppointment ? (
              <>
                <strong>{nextAppointment.service.name}</strong>
                <p>{nextAppointment.pet.name}</p>
                <p>{nextAppointment.date} at {String(nextAppointment.time).slice(0, 5)}</p>
                <span className={`status-badge ${nextAppointment.status.toLowerCase()}`}>{nextAppointment.status}</span>
              </>
            ) : (
              <p>No upcoming appointments yet.</p>
            )}
          </article>

          <article className="surface-card">
            <span className="surface-kicker">Quick Snapshot</span>
            <strong>{pets.length} Pets</strong>
            <p>{appointments.length} Appointments tracked</p>
            {currentUser.role === 'ADMIN' ? <p>{pendingAppointments.length} Pending admin requests</p> : null}
          </article>
        </div>
      )
    }

    if (activeView === 'pets') {
      return (
        <div className="workspace-grid workspace-grid-wide">
          <article className="surface-card">
            <span className="surface-kicker">{editingPetId ? 'Edit Pet' : 'Add Pet'}</span>
            <form className="form" onSubmit={submitPet}>
              <label htmlFor="petName">Name</label>
              <input id="petName" value={petForm.name} onChange={(event) => setPetForm((previous) => ({ ...previous, name: event.target.value }))} required />

              <div className="form-split">
                <div>
                  <label htmlFor="petSpecies">Species</label>
                  <input id="petSpecies" value={petForm.species} onChange={(event) => setPetForm((previous) => ({ ...previous, species: event.target.value }))} required />
                </div>
                <div>
                  <label htmlFor="petBreed">Breed</label>
                  <input id="petBreed" value={petForm.breed} onChange={(event) => setPetForm((previous) => ({ ...previous, breed: event.target.value }))} required />
                </div>
              </div>

              <label htmlFor="petAge">Age</label>
              <input id="petAge" type="number" min="0" value={petForm.age} onChange={(event) => setPetForm((previous) => ({ ...previous, age: event.target.value }))} />

              <label htmlFor="petNotes">Notes</label>
              <textarea id="petNotes" value={petForm.notes} onChange={(event) => setPetForm((previous) => ({ ...previous, notes: event.target.value }))} />

              <label htmlFor="petVaccineHistory">Vaccine History</label>
              <textarea id="petVaccineHistory" value={petForm.vaccineHistory} onChange={(event) => setPetForm((previous) => ({ ...previous, vaccineHistory: event.target.value }))} />

              <div className="action-row">
                <button type="submit">{editingPetId ? 'Update Pet' : 'Save Pet'}</button>
                {editingPetId ? <button type="button" className="secondary-button" onClick={() => { setEditingPetId(null); setPetForm(INITIAL_PET_FORM) }}>Cancel</button> : null}
              </div>
            </form>
          </article>

          <article className="surface-card">
            <span className="surface-kicker">Your Pets</span>
            <div className="stack-list">
              {pets.length === 0 ? <p>No pets yet.</p> : null}
              {pets.map((pet) => (
                <div key={pet.id} className="list-row">
                  <div>
                    <strong>{pet.name}</strong>
                    <p>{pet.species} - {pet.breed}</p>
                  </div>
                  <div className="action-row compact">
                    <button type="button" className="secondary-button" onClick={() => editPet(pet)}>Edit</button>
                    <button type="button" className="danger-button" onClick={() => void deletePet(pet.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>
      )
    }

    if (activeView === 'services') {
      return (
        <div className="workspace-grid">
          {services.map((service) => (
            <article key={service.id} className="surface-card">
              <span className="surface-kicker">Service</span>
              <strong>{service.name}</strong>
              <p>{service.description}</p>
              <span className="status-badge neutral">{service.durationMinutes} min</span>
            </article>
          ))}
        </div>
      )
    }

    if (activeView === 'book') {
      return (
        <article className="surface-card">
          <span className="surface-kicker">New Booking</span>
          <form className="form" onSubmit={submitBooking}>
            <label htmlFor="bookingPet">Pet</label>
            <select id="bookingPet" value={bookingForm.petId} onChange={(event) => setBookingForm((previous) => ({ ...previous, petId: event.target.value }))} required>
              <option value="">Select pet</option>
              {pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name}</option>)}
            </select>

            <label htmlFor="bookingService">Service</label>
            <select id="bookingService" value={bookingForm.serviceId} onChange={(event) => setBookingForm((previous) => ({ ...previous, serviceId: event.target.value, time: '' }))} required>
              <option value="">Select service</option>
              {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
            </select>

            <label htmlFor="bookingDate">Date</label>
            <input id="bookingDate" type="date" value={bookingForm.date} onChange={(event) => setBookingForm((previous) => ({ ...previous, date: event.target.value, time: '' }))} required />

            <div>
              <label>Available Slots</label>
              <div className="slot-grid">
                {availableSlots.length === 0 ? <p className="slot-empty">Choose a service and date to see slots.</p> : null}
                {availableSlots.map((slot) => {
                  const value = String(slot)
                  return <button key={value} type="button" className={`slot-button ${bookingForm.time === value ? 'active' : ''}`} onClick={() => setBookingForm((previous) => ({ ...previous, time: value }))}>{value.slice(0, 5)}</button>
                })}
              </div>
            </div>

            <label htmlFor="bookingNotes">Notes</label>
            <textarea id="bookingNotes" value={bookingForm.notes} onChange={(event) => setBookingForm((previous) => ({ ...previous, notes: event.target.value }))} />

            <button type="submit">Submit Booking</button>
          </form>
        </article>
      )
    }

    if (activeView === 'appointments') {
      return (
        <article className="surface-card">
          <span className="surface-kicker">My Appointments</span>
          <div className="stack-list">
            {appointments.length === 0 ? <p>No appointments yet.</p> : null}
            {appointments.map((appointment) => (
              <div key={appointment.id} className="list-row">
                <div>
                  <strong>{appointment.service.name} - {appointment.pet.name}</strong>
                  <p>{appointment.date} at {String(appointment.time).slice(0, 5)}</p>
                  <span className={`status-badge ${appointment.status.toLowerCase()}`}>{appointment.status}</span>
                </div>
                {!['COMPLETED', 'CANCELLED'].includes(appointment.status) ? <button type="button" className="danger-button" onClick={() => void cancelAppointment(appointment.id)}>Cancel</button> : null}
              </div>
            ))}
          </div>
        </article>
      )
    }

    if (activeView === 'admin') {
      return (
        <div className="workspace-grid workspace-grid-wide">
          <article className="surface-card">
            <span className="surface-kicker">Pending Bookings</span>
            <div className="stack-list">
              {pendingAppointments.length === 0 ? <p>No pending requests.</p> : null}
              {pendingAppointments.map((appointment) => (
                <div key={appointment.id} className="list-row">
                  <div>
                    <strong>{appointment.service.name}</strong>
                    <p>{appointment.date} at {String(appointment.time).slice(0, 5)} - {appointment.client.firstName} {appointment.client.lastName}</p>
                  </div>
                  <div className="action-row compact">
                    <button type="button" onClick={() => void runAdminAction(appointment.id, 'confirm', 'Appointment accepted.')}>Accept</button>
                    <button type="button" className="danger-button" onClick={() => void cancelAppointment(appointment.id, true)}>Decline</button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-card">
            <span className="surface-kicker">Today</span>
            <div className="stack-list">
              {todayAppointments.length === 0 ? <p>No appointments for today.</p> : null}
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="list-row">
                  <div>
                    <strong>{appointment.service.name}</strong>
                    <p>{String(appointment.time).slice(0, 5)} - {appointment.pet.name}</p>
                  </div>
                  <div className="action-row compact">
                    {appointment.status === 'CONFIRMED' ? <button type="button" onClick={() => void runAdminAction(appointment.id, 'complete', 'Appointment completed.')}>Complete</button> : null}
                    {!['COMPLETED', 'CANCELLED'].includes(appointment.status) ? <button type="button" className="danger-button" onClick={() => void cancelAppointment(appointment.id, true)}>Cancel</button> : null}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="surface-card">
            <span className="surface-kicker">Clinic Settings</span>
            <form className="form" onSubmit={saveSettings}>
              <label htmlFor="openingTime">Opening Time</label>
              <input id="openingTime" type="time" value={settingsForm.openingTime} onChange={(event) => setSettingsForm((previous) => ({ ...previous, openingTime: event.target.value }))} />

              <label htmlFor="closingTime">Closing Time</label>
              <input id="closingTime" type="time" value={settingsForm.closingTime} onChange={(event) => setSettingsForm((previous) => ({ ...previous, closingTime: event.target.value }))} />

              <label htmlFor="slotMinutes">Slot Minutes</label>
              <input id="slotMinutes" type="number" min="5" value={settingsForm.slotMinutes} onChange={(event) => setSettingsForm((previous) => ({ ...previous, slotMinutes: event.target.value }))} />

              <button type="submit">Save Settings</button>
            </form>
          </article>

          <article className="surface-card">
            <span className="surface-kicker">Blocked Dates</span>
            <form className="form" onSubmit={addBlockedDate}>
              <label htmlFor="blockedDate">Date</label>
              <input id="blockedDate" type="date" value={blockedDateInput} onChange={(event) => setBlockedDateInput(event.target.value)} required />
              <button type="submit">Block Date</button>
            </form>

            <div className="stack-list top-gap">
              {blockedDates.length === 0 ? <p>No blocked dates.</p> : null}
              {blockedDates.map((blockedDate) => (
                <div key={blockedDate.id} className="list-row">
                  <span>{blockedDate.date}</span>
                  <button type="button" className="danger-button" onClick={() => void removeBlockedDate(blockedDate.id)}>Remove</button>
                </div>
              ))}
            </div>
          </article>
        </div>
      )
    }

    return null
  }

  return (
    <main className="screen">
      <section className="shell">
        <aside className="brand-panel">
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
          ) : (
            <div className="workspace-nav">
              <div className="workspace-user">
                <span className="info-kicker">Signed In</span>
                <strong>{currentUser.firstName} {currentUser.lastName}</strong>
                <p>@{currentUser.username}</p>
                <p>{currentUser.role}</p>
              </div>

              <div className="nav-pills">
                {navigationItems.map((item) => (
                  <button key={item.key} type="button" className={activeView === item.key ? 'nav-pill active' : 'nav-pill'} onClick={() => setActiveView(item.key)}>{item.label}</button>
                ))}
              </div>

              <button type="button" className="logout-button" onClick={logout}>Logout</button>
            </div>
          )}
        </aside>

        <section className="panel">
          <div className="panel-header">
            <p className="panel-kicker">{currentUser ? 'Workspace' : mode === 'login' ? 'Login' : 'Register'}</p>
            <h2>{title}</h2>
            <p className="panel-copy">{subtitle}</p>
          </div>

          {errorMessage ? <p className="alert alert-error">{errorMessage}</p> : null}
          {successMessage ? <p className="alert alert-success">{successMessage}</p> : null}

          {!currentUser ? (
            <>
              <div className="mode-switch" role="tablist" aria-label="Authentication Mode">
                <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { clearAlerts(); setMode('login') }}>Login</button>
                <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => { clearAlerts(); setMode('register') }}>Register</button>
              </div>
              {renderAuthForm()}
            </>
          ) : (
            <div className="workspace-body">{renderWorkspace()}</div>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
