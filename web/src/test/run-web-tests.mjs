import assert from 'node:assert/strict'
import {
  INITIAL_BOOKING_FORM,
  INITIAL_LOGIN_FORM,
  INITIAL_PET_FORM,
  INITIAL_REGISTER_FORM,
  INITIAL_SERVICE_FORM,
  INITIAL_SETTINGS_FORM,
} from '../features/workspace/formState.js'
import { CLIENT_ONLY_PATHS, NAVIGATION_CONFIG, PATH_TO_VIEW, VIEW_TO_PATH } from '../shared/routing/workspaceRoutes.js'

for (const item of NAVIGATION_CONFIG) {
  const path = VIEW_TO_PATH[item.key]

  assert.ok(path, `missing path for ${item.key}`)
  assert.equal(PATH_TO_VIEW[path], item.key)
}

assert.equal(CLIENT_ONLY_PATHS.includes('/admin'), false)
assert.equal(INITIAL_REGISTER_FORM.role, 'CLIENT')
assert.equal(INITIAL_LOGIN_FORM.username, '')
assert.equal(INITIAL_LOGIN_FORM.password, '')
assert.equal(INITIAL_BOOKING_FORM.petId, '')
assert.equal(INITIAL_PET_FORM.name, '')
assert.equal(INITIAL_SERVICE_FORM.active, true)
assert.equal(INITIAL_SETTINGS_FORM.openingTime, '09:00')
assert.equal(INITIAL_SETTINGS_FORM.closingTime, '17:00')

console.log('Web route and form-state contract tests passed.')
