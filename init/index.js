const axios = require('axios')
const FormData = require('form-data')
const { generateDeviceToken } = require('../helpers')

const upsInstanceUrl = process.env.UPS_URL || 'http://localhost:9999'
const appsEndpoint = `${upsInstanceUrl}/rest/applications`
const registerDeviceEndpoint = `${upsInstanceUrl}/rest/registry/device`

const androidSenderId = process.env.ANDROID_SENDER_ID || 'testsenderid'
const androidServerKey = process.env.ANDROID_SERVER_KEY || 'testserverkey'
const iosBase64Cert = process.env.IOS_BASE64_CERTIFICATE || require('../fixtures').iosBase64Cert
const iosCertPassword = process.env.IOS_CERTIFICATE_PASSWORD || require('../fixtures').iosCertPassword

const args = require('yargs').argv

async function createApp (appName) {
  return axios({
    method: 'POST',
    url: `${appsEndpoint}`,
    data: { name: appName }
  }).catch((err) => {
    console.error('Cannot create UPS Application')
    throw new Error(`Statuscode: ${err.response.status}, statustext: ${err.response.statusText}`)
  })
}

async function createAndroidVariant (appId, variantName) {
  const variantEndpoint = `${appsEndpoint}/${appId}/android`

  return axios({
    method: 'POST',
    url: `${variantEndpoint}`,
    data: {
      name: variantName,
      projectNumber: androidSenderId,
      googleKey: androidServerKey
    }
  }).catch((err) => {
    console.error('Cannot create Android variant')
    throw new Error(`Statuscode: ${err.response.status}, statustext: ${err.response.statusText}`)
  })
}

async function createIosVariant (appId, variantName) {
  const variantEndpoint = `${appsEndpoint}/${appId}/ios`
  const certBuffer = Buffer.from(iosBase64Cert, 'base64')
  const bodyFormData = new FormData()

  bodyFormData.append('name', variantName)
  bodyFormData.append('production', 'false')
  bodyFormData.append('passphrase', iosCertPassword)
  bodyFormData.append('certificate', certBuffer)

  return axios({
    method: 'POST',
    url: `${variantEndpoint}`,
    data: bodyFormData,
    headers: bodyFormData.getHeaders()
  }).catch((err) => {
    console.error('Cannot create iOS variant')
    throw new Error(`Statuscode: ${err.response.status}, statustext: ${err.response.statusText}`)
  })
}

async function registerDevice (variantId, variantSecret) {
  const numberOfDevices = args.devices || 1
  for (let i = 0; i < numberOfDevices; i++) {
    await axios({
      url: `${registerDeviceEndpoint}`,
      method: 'POST',
      auth: {
        username: variantId,
        password: variantSecret
      },
      data: {
        deviceToken: await generateDeviceToken(),
        deviceType: 'tablet',
        operatingSystem: 'Android',
        osVersion: '6.1.2',
        alias: 'cordova',
        categories: ['football', 'sport']
      }
    }).catch((err) => {
      console.error('Cannot register a device')
      throw new Error(`Statuscode: ${err.response.status}, statustext: ${err.response.statusText}`)
    })
  }
}

async function init () {
  try {
    const application = (await createApp('test')).data

    if (!args.variants || args.variants.indexOf('android') !== -1) {
      const androidVariant = (await createAndroidVariant(application.pushApplicationID, 'test')).data
      await registerDevice(androidVariant.variantID, androidVariant.secret)
    }

    if (!args.variants || args.variants.indexOf('ios') !== -1) {
      const iosVariant = (await createIosVariant(application.pushApplicationID, 'test')).data
      await registerDevice(iosVariant.variantID, iosVariant.secret)
    }

    console.log(`
    Push Application ID:    ${application.pushApplicationID}
    Master Secret:          ${application.masterSecret}
    `)
  } catch (e) {
    console.error(e)
  }
}

init()
