import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { CLIENT_ONLY_PATHS, NAVIGATION_CONFIG, PATH_TO_VIEW, VIEW_TO_PATH } from './workspaceRoutes.js'

describe('workspace route contracts', () => {
  it('maps every navigation key to a resolvable path and view', () => {
    for (const item of NAVIGATION_CONFIG) {
      const path = VIEW_TO_PATH[item.key]

      assert.ok(path, `missing path for ${item.key}`)
      assert.equal(PATH_TO_VIEW[path], item.key)
    }
  })

  it('keeps admin out of client-only routes', () => {
    assert.deepEqual(CLIENT_ONLY_PATHS.includes('/admin'), false)
  })
})
