function formatDateLabel(dateValue) {
  if (!dateValue) {
    return 'Not scheduled'
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`)
  return Number.isNaN(parsedDate.getTime())
    ? dateValue
    : parsedDate.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
}

function formatTimeLabel(timeValue) {
  return String(timeValue || '').slice(0, 5) || '--:--'
}

function EmptyState({ eyebrow, title, copy }) {
  return (
    <div className="empty-state">
      <span className="surface-kicker">{eyebrow}</span>
      <strong>{title}</strong>
      <p>{copy}</p>
    </div>
  )
}

function SectionHeading({ kicker, title, copy }) {
  return (
    <div className="section-heading">
      <span className="surface-kicker">{kicker}</span>
      <h3>{title}</h3>
      {copy ? <p>{copy}</p> : null}
    </div>
  )
}

function SummaryMetric({ label, value, tone = 'default' }) {
  return (
    <article className={`summary-metric summary-metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function StatusBadge({ status }) {
  return <span className={`status-badge ${String(status).toLowerCase()}`}>{status}</span>
}

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
      <div className="auth-shell">
        <article className="surface-card feature-callout">
          <SectionHeading
            kicker="Why VetEase"
            title="Create a polished clinic-ready account"
            copy="Set up secure access for pet records, service booking, and reservation monitoring."
          />
          <div className="summary-strip">
            <SummaryMetric label="Profiles" value="Pet + owner" tone="warm" />
            <SummaryMetric label="Scheduling" value="Live slots" tone="cool" />
            <SummaryMetric label="Staff Flow" value="Approval ready" tone="soft" />
          </div>
        </article>

        <form className="form auth-form-card" onSubmit={submitRegister}>
          <SectionHeading kicker="Registration" title="Open your VetEase portal" />

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
      </div>
    )
  }

  return (
    <div className="auth-shell">
      <article className="surface-card feature-callout">
        <SectionHeading
          kicker="Welcome Back"
          title="Step into a calmer clinic workspace"
          copy="Log in to manage pets, monitor bookings, and keep the appointment flow moving."
        />
        <div className="summary-strip">
          <SummaryMetric label="Appointments" value="Visible" tone="cool" />
          <SummaryMetric label="Records" value="Organized" tone="soft" />
          <SummaryMetric label="Experience" value="Focused" tone="warm" />
        </div>
      </article>

      <form className="form auth-form-card" onSubmit={submitLogin}>
        <SectionHeading kicker="Login" title="Continue to your portal" />

        <label htmlFor="loginUsername">Username</label>
        <input id="loginUsername" type="text" placeholder="Enter your username" value={loginForm.username} onChange={(event) => setLoginForm((previous) => ({ ...previous, username: event.target.value }))} required />

        <label htmlFor="loginPassword">Password</label>
        <input id="loginPassword" type="password" placeholder="Enter your password" value={loginForm.password} onChange={(event) => setLoginForm((previous) => ({ ...previous, password: event.target.value }))} required />

        <button type="submit" disabled={loading}>{loading ? 'Signing In...' : 'Login to VetEase'}</button>
      </form>
    </div>
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

function todayLocalDateString() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
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
    if (currentUser.role === 'ADMIN') {
      return (
        <div className="workspace-stack">
          <section className="hero-card hero-card-admin">
            <div>
              <span className="surface-kicker">Clinic Command</span>
              <h3>{currentUser.firstName}, the desk is ready.</h3>
              <p>Review incoming requests, keep the day on track, and adjust clinic timing from one clear control surface.</p>
            </div>
            <div className="summary-strip">
              <SummaryMetric label="Pending" value={pendingAppointments.length} tone="warm" />
              <SummaryMetric label="Today" value={todayAppointments.length} tone="cool" />
              <SummaryMetric label="Blocked Dates" value={blockedDates.length} tone="soft" />
            </div>
          </section>

          <div className="workspace-grid">
            <article className="surface-card">
              <div className="card-head"><span className="card-icon" aria-hidden="true" /><span className="surface-kicker">Staff Account</span></div>
              <strong>{currentUser.firstName} {currentUser.lastName}</strong>
              <p>@{currentUser.username}</p>
              <p>{currentUser.email}</p>
              <p>Role: {currentUser.role}</p>
            </article>

            <article className="surface-card">
              <div className="card-head"><span className="card-icon" aria-hidden="true" /><span className="surface-kicker">Needs Action</span></div>
              <strong>{pendingAppointments.length} pending</strong>
              <p>Booking requests awaiting approval or decline.</p>
            </article>

            <article className="surface-card">
              <div className="card-head"><span className="card-icon" aria-hidden="true" /><span className="surface-kicker">Today</span></div>
              <strong>{todayAppointments.length} on the schedule</strong>
              <p>Confirmed and pending visits for the current day.</p>
            </article>
          </div>
        </div>
      )
    }

    return (
      <div className="workspace-stack">
        <section className="hero-card">
          <div>
            <span className="surface-kicker">Pet Care Dashboard</span>
            <h3>Hello, {currentUser.firstName}.</h3>
            <p>Your records, bookings, and clinic access are lined up in one polished workspace built for quick daily use.</p>
          </div>
          <div className="summary-strip">
            <SummaryMetric label="Pets" value={pets.length} tone="cool" />
            <SummaryMetric label="Appointments" value={appointments.length} tone="soft" />
            <SummaryMetric label="Next Status" value={nextAppointment?.status || 'Open'} tone="warm" />
          </div>
        </section>

        <div className="workspace-grid">
          <article className="surface-card">
            <div className="card-head"><span className="card-icon" aria-hidden="true" /><span className="surface-kicker">Account</span></div>
            <strong>{currentUser.firstName} {currentUser.lastName}</strong>
            <p>@{currentUser.username}</p>
            <p>{currentUser.email}</p>
            <p>Role: {currentUser.role}</p>
          </article>

          <article className="surface-card feature-appointment-card">
            <div className="card-head"><span className="card-icon" aria-hidden="true" /><span className="surface-kicker">Next Appointment</span></div>
            {nextAppointment ? (
              <>
                <strong>{nextAppointment.service.name}</strong>
                <p>{nextAppointment.pet.name}</p>
                <div className="meta-row">
                  <span>{formatDateLabel(nextAppointment.date)}</span>
                  <span>{formatTimeLabel(nextAppointment.time)}</span>
                </div>
                <StatusBadge status={nextAppointment.status} />
              </>
            ) : (
              <EmptyState eyebrow="No Upcoming Visit" title="Nothing scheduled yet" copy="Head to booking once your pet profiles are ready and request a future slot." />
            )}
          </article>

          <article className="surface-card">
            <div className="card-head"><span className="card-icon" aria-hidden="true" /><span className="surface-kicker">Quick Snapshot</span></div>
            <strong>{pets.length} Pets</strong>
            <p>{appointments.length} Appointments tracked</p>
          </article>
        </div>
      </div>
    )
  }

  if (activeView === 'pets') {
    return (
      <div className="workspace-grid workspace-grid-wide">
        <article className="surface-card">
          <SectionHeading
            kicker={editingPetId ? 'Edit Pet' : 'Add Pet'}
            title={editingPetId ? 'Update a pet profile' : 'Create a pet profile'}
            copy="Keep species, breed, care notes, and vaccine history easy to review before appointments."
          />
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
          <SectionHeading
            kicker="Your Pets"
            title={`${pets.length} profile${pets.length === 1 ? '' : 's'} in your care`}
            copy="Tap into edit mode whenever a pet record changes before the next clinic visit."
          />
          <div className="stack-list">
            {pets.length === 0 ? <EmptyState eyebrow="No Profiles Yet" title="Add your first pet" copy="Once you save a pet here, that profile will be available in the booking flow." /> : null}
            {pets.map((pet) => (
              <div key={pet.id} className="list-row list-row-card">
                <div>
                  <strong>{pet.name}</strong>
                  <p>{pet.species} - {pet.breed}</p>
                  <div className="meta-row">
                    <span>Age: {pet.age ?? 'N/A'}</span>
                    <span>{pet.vaccineHistory ? 'Vaccines tracked' : 'No vaccine log'}</span>
                  </div>
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
      <div className="workspace-stack">
        <section className="hero-card hero-card-soft">
          <div>
            <span className="surface-kicker">Clinic Services</span>
            <h3>Choose the right visit type before booking.</h3>
            <p>Each service includes its own duration so owners and staff can align on expectations ahead of the visit.</p>
          </div>
          <div className="summary-strip">
            <SummaryMetric label="Services" value={services.length} tone="cool" />
          </div>
        </section>
        <div className="workspace-grid">
          {services.map((service) => (
            <article key={service.id} className="surface-card service-card">
              <span className="surface-kicker">Service</span>
              <strong>{service.name}</strong>
              <p>{service.description}</p>
              <div className="meta-row">
                <span className="status-badge neutral">{service.durationMinutes} min</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    )
  }

  if (activeView === 'book') {
    return (
      <div className="workspace-grid workspace-grid-wide">
        <article className="surface-card">
          <SectionHeading
            kicker="New Booking"
            title="Request a clinic visit"
            copy="Choose a pet, service, and date first. The app will reveal the currently available slots for that service."
          />
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
            <input id="bookingDate" type="date" min={todayLocalDateString()} value={bookingForm.date} onChange={(event) => setBookingForm((previous) => ({ ...previous, date: event.target.value, time: '' }))} required />

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

        <article className="surface-card booking-side-panel">
          <SectionHeading
            kicker="Booking Tips"
            title="A smoother way to prepare"
            copy="Keeping a pet profile current makes future booking faster and helps staff review your request with better context."
          />
          <div className="stack-list">
            <div className="list-row list-row-card">
              <div>
                <strong>Pick the pet first</strong>
                <p>That keeps the request tied to the right patient profile.</p>
              </div>
            </div>
            <div className="list-row list-row-card">
              <div>
                <strong>Choose a service before date review</strong>
                <p>Available times depend on the clinic&apos;s configured duration for that service.</p>
              </div>
            </div>
            <div className="list-row list-row-card">
              <div>
                <strong>Add notes when needed</strong>
                <p>Share symptoms, follow-up context, or special handling instructions.</p>
              </div>
            </div>
          </div>
        </article>
      </div>
    )
  }

  if (activeView === 'appointments') {
    return (
      <article className="surface-card">
        <SectionHeading
          kicker="My Appointments"
          title="Track every booking from one list"
          copy="Pending and confirmed requests stay visible here until they are completed or cancelled."
        />
        <div className="stack-list">
          {appointments.length === 0 ? <EmptyState eyebrow="No Appointments Yet" title="You have no clinic visits scheduled" copy="Once you request a booking, the appointment timeline will appear here." /> : null}
          {appointments.map((appointment) => {
            const isClosed = ['COMPLETED', 'CANCELLED'].includes(appointment.status)
            return (
              <div key={appointment.id} className="list-row list-row-card">
                <div>
                  <strong>{appointment.service.name} - {appointment.pet.name}</strong>
                  <p>{formatDateLabel(appointment.date)} at {formatTimeLabel(appointment.time)}</p>
                  <div className="meta-row">
                    <span>{appointment.notes || 'No extra notes'}</span>
                  </div>
                  <StatusBadge status={appointment.status} />
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
            <SectionHeading
              kicker="Pending Bookings"
              title="Requests waiting for review"
              copy="Accept or decline incoming appointment requests from pet owners."
            />
            <div className="stack-list">
              {pendingAppointments.length === 0 ? <EmptyState eyebrow="All Clear" title="No pending requests" copy="New booking requests will appear here for staff review." /> : null}
              {pendingAppointments.map((appointment) => (
                <div key={appointment.id} className="list-row list-row-card">
                  <div>
                    <strong>{appointment.service.name}</strong>
                    <p>{formatDateLabel(appointment.date)} at {formatTimeLabel(appointment.time)}</p>
                    <div className="meta-row">
                      <span>{appointment.client.firstName} {appointment.client.lastName}</span>
                      <span>{appointment.pet.name}</span>
                    </div>
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
            <SectionHeading
              kicker="Today"
              title="Current clinic schedule"
              copy="Keep visits moving and mark confirmed appointments complete when finished."
            />
            <div className="stack-list">
              {todayAppointments.length === 0 ? <EmptyState eyebrow="Quiet Day" title="No appointments for today" copy="Today&apos;s scheduled visits will populate here automatically." /> : null}
              {todayAppointments.map((appointment) => {
                const isClosed = ['COMPLETED', 'CANCELLED'].includes(appointment.status)
                return (
                  <div key={appointment.id} className="list-row list-row-card">
                    <div>
                      <strong>{appointment.service.name}</strong>
                      <p>{formatTimeLabel(appointment.time)} - {appointment.pet.name}</p>
                      <div className="meta-row">
                        <span>{appointment.client.firstName} {appointment.client.lastName}</span>
                      </div>
                      <StatusBadge status={appointment.status} />
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
            <SectionHeading
              kicker="Blocked Dates"
              title="Protect unavailable clinic days"
              copy="Reserve dates when the clinic should not accept online booking."
            />
            <form className="form inline-form" onSubmit={addBlockedDate}>
              <input id="blockedDate" type="date" value={blockedDateInput} onChange={(event) => setBlockedDateInput(event.target.value)} required />
              <button type="submit">Block</button>
            </form>

            <div className="stack-list top-gap">
              {blockedDates.length === 0 ? <EmptyState eyebrow="Open Calendar" title="No blocked dates" copy="Blocked dates will show up here once they are added." /> : null}
              {blockedDates.map((blockedDate) => (
                <div key={blockedDate.id} className="list-row list-row-card">
                  <div>
                    <strong>{formatDateLabel(blockedDate.date)}</strong>
                    <p>Clinic unavailable for online booking</p>
                  </div>
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
