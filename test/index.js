const axios = require('axios')

const upsInstanceUrl = process.env.UPS_URL || 'http://localhost:9999'
const applicationId = process.env.UPS_APP_ID || ''
const masterSecret = process.env.UPS_APP_MASTER_SECRET || ''

async function test () {
  axios({
    url: `${upsInstanceUrl}/rest/sender`,
    method: 'POST',
    auth: {
      username: applicationId,
      password: masterSecret
    },
    data: {
      criteria: { alias: ['cordova'] },
      config: undefined,
      message: { alert: 'Test Alert', priority: 'high' }
    }
  }).catch((err) => {
    console.log(err.response.status)
    console.log(err.response.statusText)
  }).then((res) => {
    console.log(res.status)
    console.log(res.statusText)
  })
}

test()
