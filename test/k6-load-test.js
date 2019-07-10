import http from 'k6/http'
import { check } from 'k6'
import encoding from 'k6/encoding'

// eslint-disable-next-line no-undef
const upsInstanceUrl = __ENV.UPS_URL || 'http://localhost:9999'
// eslint-disable-next-line no-undef
const applicationId = __ENV.UPS_APP_ID || ''
// eslint-disable-next-line no-undef
const masterSecret = __ENV.UPS_APP_MASTER_SECRET || ''

const senderApiUrl = `${upsInstanceUrl}/rest/sender`
const params = {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Basic ${encoding.b64encode(`${applicationId}:${masterSecret}`)}`
  }
}
const messageConfig = {
  criteria: { alias: [ 'cordova' ] },
  config: undefined,
  message: { alert: 'Test Alert', priority: 'high' }
}

export default function () {
  const payload = JSON.stringify(messageConfig)
  const res = http.post(senderApiUrl, payload, params)
  check(res, {
    'return status 202 after notification is sent': r => r.status === 202,
    'no errors from ups server after sending notification': r => r.error === ''
  })
}
