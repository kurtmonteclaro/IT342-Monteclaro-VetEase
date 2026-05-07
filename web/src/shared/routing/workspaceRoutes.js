export const NAVIGATION_CONFIG = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'pets', label: 'Pets' },
  { key: 'services', label: 'Services' },
  { key: 'book', label: 'Book' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'admin', label: 'Admin' },
]

export const VIEW_TO_PATH = {
  dashboard: '/dashboard',
  pets: '/pets',
  services: '/services',
  book: '/book',
  appointments: '/appointments',
  admin: '/admin',
}

export const PATH_TO_VIEW = {
  '/dashboard': 'dashboard',
  '/pets': 'pets',
  '/services': 'services',
  '/book': 'book',
  '/appointments': 'appointments',
  '/admin': 'admin',
}

export const CLIENT_ONLY_PATHS = ['/pets', '/services', '/book', '/appointments']
