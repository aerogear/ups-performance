const crypto = require('crypto')

async function generateDeviceToken () {
  const buffer = await crypto.randomBytes(100)
  return buffer.toString('hex')
}

module.exports = {
  generateDeviceToken
}
