import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  INITIAL_BOOKING_FORM,
  INITIAL_LOGIN_FORM,
  INITIAL_PET_FORM,
  INITIAL_REGISTER_FORM,
  INITIAL_SERVICE_FORM,
  INITIAL_SETTINGS_FORM,
} from './formState.js'

describe('workspace form defaults', () => {
  it('uses client registration and empty auth inputs by default', () => {
    assert.equal(INITIAL_REGISTER_FORM.role, 'CLIENT')
    assert.equal(INITIAL_LOGIN_FORM.username, '')
    assert.equal(INITIAL_LOGIN_FORM.password, '')
  })

  it('keeps booking, pet, service, and settings defaults valid', () => {
    assert.equal(INITIAL_BOOKING_FORM.petId, '')
    assert.equal(INITIAL_PET_FORM.name, '')
    assert.equal(INITIAL_SERVICE_FORM.active, true)
    assert.equal(INITIAL_SETTINGS_FORM.openingTime, '09:00')
    assert.equal(INITIAL_SETTINGS_FORM.closingTime, '17:00')
  })
})
