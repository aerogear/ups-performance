const axios = require('axios')
const FormData = require('form-data')

const upsInstanceUrl = process.env.UPS_URL || 'http://localhost:9999'
const appsEndpoint = `${upsInstanceUrl}/rest/applications`
const registerDeviceEndpoint = `${upsInstanceUrl}/rest/registry/device`

const { iosBase64Cert, iosCertPassword } = require('../fixtures')
const { generateDeviceToken } = require('../helpers')

async function createApp (appName) {
  return axios({
    method: 'POST',
    url: `${appsEndpoint}`,
    data: { name: appName }
  })
}

async function deleteApp (appId) {
  return axios({
    method: 'DELETE',
    url: `${appsEndpoint}/${appId}`
  })
}

async function createAndroidVariant (appId, variantName) {
  const variantEndpoint = `${appsEndpoint}/${appId}/android`

  return axios({
    method: 'POST',
    url: `${variantEndpoint}`,
    data: {
      name: variantName,
      projectNumber: 'testsenderid',
      googleKey: 'testserverkey'
    }
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
  })
}

async function registerDevice (variantId, variantSecret) {
  axios({
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
    console.log(err.response.status)
    console.log(err.response.statusText)
  }).then((res) => {
    console.log(res.status)
    console.log(res.statusText)
  })
}

async function init () {
  const application = (await createApp('test')).data

  const androidVariant = (await createAndroidVariant(application.pushApplicationID, 'test')).data
  const iosVariant = (await createIosVariant(application.pushApplicationID, 'test')).data

  console.log(`
    Push Application ID:    ${application.pushApplicationID}
    Master Secret:          ${application.masterSecret}
    Android Variant ID:     ${androidVariant.variantID}
    Android Variant Secret: ${androidVariant.secret}
    iOS Variant ID:         ${iosVariant.variantID}
    iOS Variant Secret:     ${iosVariant.secret}
    `
  )
  await registerDevice(androidVariant.variantID, androidVariant.secret)
  await registerDevice(iosVariant.variantID, iosVariant.secret)
  //await deleteApp(application.pushApplicationID)
}

init()
