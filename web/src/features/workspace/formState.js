export const INITIAL_REGISTER_FORM = {
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  role: 'CLIENT',
}

export const INITIAL_LOGIN_FORM = {
  username: '',
  password: '',
}

export const INITIAL_PET_FORM = {
  name: '',
  species: '',
  breed: '',
  age: '',
  notes: '',
  vaccineHistory: '',
}

export const INITIAL_BOOKING_FORM = {
  petId: '',
  serviceId: '',
  date: '',
  time: '',
  notes: '',
}

export const INITIAL_RESCHEDULE_FORM = {
  appointmentId: null,
  serviceId: '',
  date: '',
  time: '',
}

export const INITIAL_SETTINGS_FORM = {
  openingTime: '09:00',
  closingTime: '17:00',
  slotMinutes: 30,
}

export const INITIAL_SERVICE_FORM = {
  name: '',
  description: '',
  durationMinutes: 30,
  active: true,
}
