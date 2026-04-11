export function AuthForms({
  mode,
  loading,
  registerForm,
  setRegisterForm,
  loginForm,
  setLoginForm,
  submitRegister,
  submitLogin,
}) {
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

export function NavButtons({ items, activeView, onChange, className }) {
  return (
    <div className={className}>
      {items.map((item) => (
        <button key={item.key} type="button" className={activeView === item.key ? 'nav-pill active' : 'nav-pill'} onClick={() => onChange(item.key)}>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  )
}

export function AdminTitleStrip({ activeLabel, pendingCount, todayCount }) {
  return (
    <section className="admin-title-strip" aria-label="Admin Context">
      <div>
        <p className="admin-strip-kicker">Admin Workspace</p>
        <h3>Control Panel / {activeLabel}</h3>
      </div>
      <div className="admin-strip-metrics">
        <span>{pendingCount} Pending</span>
        <span>{todayCount} Today</span>
      </div>
    </section>
  )
}

export function WorkspaceView({
  activeView,
  currentUser,
  pets,
  appointments,
  nextAppointment,
  pendingAppointments,
  services,
  petForm,
  setPetForm,
  editingPetId,
  submitPet,
  setEditingPetId,
  setPetFormToInitial,
  editPet,
  deletePet,
  bookingForm,
  setBookingForm,
  availableSlots,
  submitBooking,
  cancelAppointment,
  todayAppointments,
  runAdminAction,
  settingsForm,
  setSettingsForm,
  saveSettings,
  blockedDateInput,
  setBlockedDateInput,
  addBlockedDate,
  blockedDates,
  removeBlockedDate,
}) {
  if (activeView === 'dashboard') {
    return (
      <div className="workspace-grid">
        <article className="surface-card">
          <div className="card-head"><span className="card-icon" aria-hidden="true" /><span className="surface-kicker">Account</span></div>
          <strong>{currentUser.firstName} {currentUser.lastName}</strong>
          <p>@{currentUser.username}</p>
          <p>{currentUser.email}</p>
          <p>Role: {currentUser.role}</p>
        </article>

        <article className="surface-card">
          <div className="card-head"><span className="card-icon" aria-hidden="true" /><span className="surface-kicker">Next Appointment</span></div>
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
          <div className="card-head"><span className="card-icon" aria-hidden="true" /><span className="surface-kicker">Quick Snapshot</span></div>
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
              {editingPetId ? <button type="button" className="secondary-button" onClick={() => { setEditingPetId(null); setPetFormToInitial() }}>Cancel</button> : null}
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
            <p className="field-label">Available Slots</p>
            <div className="slot-grid">
              {availableSlots.length === 0 ? <p className="slot-empty">Choose a service and date to see slots.</p> : null}
              {availableSlots.map((slot) => {
                const value = String(slot)
                return <button key={value} type="button" className={bookingForm.time === value ? 'slot-button active' : 'slot-button'} onClick={() => setBookingForm((previous) => ({ ...previous, time: value }))}>{value.slice(0, 5)}</button>
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
          {appointments.map((appointment) => {
            const isClosed = ['COMPLETED', 'CANCELLED'].includes(appointment.status)
            return (
              <div key={appointment.id} className="list-row">
                <div>
                  <strong>{appointment.service.name} - {appointment.pet.name}</strong>
                  <p>{appointment.date} at {String(appointment.time).slice(0, 5)}</p>
                  <span className={`status-badge ${appointment.status.toLowerCase()}`}>{appointment.status}</span>
                </div>
                {isClosed ? null : <button type="button" className="danger-button" onClick={() => void cancelAppointment(appointment.id)}>Cancel</button>}
              </div>
            )
          })}
        </div>
      </article>
    )
  }

  if (activeView === 'admin') {
    return (
      <div className="admin-workspace">
        <div className="admin-overview-grid">
          <article className="surface-card admin-card">
            <div className="card-head"><span className="card-icon" aria-hidden="true" /><span className="surface-kicker">Pending Bookings</span></div>
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

          <article className="surface-card admin-card">
            <div className="card-head"><span className="card-icon" aria-hidden="true" /><span className="surface-kicker">Today</span></div>
          <div className="stack-list">
            {todayAppointments.length === 0 ? <p>No appointments for today.</p> : null}
            {todayAppointments.map((appointment) => {
              const isClosed = ['COMPLETED', 'CANCELLED'].includes(appointment.status)
              return (
                <div key={appointment.id} className="list-row">
                  <div>
                    <strong>{appointment.service.name}</strong>
                    <p>{String(appointment.time).slice(0, 5)} - {appointment.pet.name}</p>
                  </div>
                  <div className="action-row compact">
                    {appointment.status === 'CONFIRMED' ? <button type="button" onClick={() => void runAdminAction(appointment.id, 'complete', 'Appointment completed.')}>Complete</button> : null}
                    {isClosed ? null : <button type="button" className="danger-button" onClick={() => void cancelAppointment(appointment.id, true)}>Cancel</button>}
                  </div>
                </div>
              )
            })}
          </div>
          </article>

          <article className="surface-card admin-card">
            <div className="card-head"><span className="card-icon" aria-hidden="true" /><span className="surface-kicker">Blocked Dates</span></div>
            <form className="form inline-form" onSubmit={addBlockedDate}>
              <input id="blockedDate" type="date" value={blockedDateInput} onChange={(event) => setBlockedDateInput(event.target.value)} required />
              <button type="submit">Block</button>
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

        <aside className="admin-settings-dock">
          <details className="settings-collapse">
            <summary>Clinic Settings</summary>
            <form className="form" onSubmit={saveSettings}>
              <div className="form-split compact-split">
                <div>
                  <label htmlFor="openingTime">Opening Time</label>
                  <input id="openingTime" type="time" value={settingsForm.openingTime} onChange={(event) => setSettingsForm((previous) => ({ ...previous, openingTime: event.target.value }))} />
                </div>
                <div>
                  <label htmlFor="closingTime">Closing Time</label>
                  <input id="closingTime" type="time" value={settingsForm.closingTime} onChange={(event) => setSettingsForm((previous) => ({ ...previous, closingTime: event.target.value }))} />
                </div>
              </div>

              <label htmlFor="slotMinutes">Slot Minutes</label>
              <select id="slotMinutes" value={settingsForm.slotMinutes} onChange={(event) => setSettingsForm((previous) => ({ ...previous, slotMinutes: event.target.value }))}>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="20">20 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
              </select>

              <button type="submit">Save Settings</button>
            </form>
          </details>
        </aside>
      </div>
    )
  }

  return null
}
