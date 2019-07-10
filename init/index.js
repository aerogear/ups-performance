const axios = require('axios')
const FormData = require('form-data')

const upsInstanceUrl = process.env.UPS_URL || 'http://localhost:9999'
const appsEndpoint = `${upsInstanceUrl}/rest/applications`

const { iosBase64Cert, iosCertPassword } = require('../fixtures')

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

async function init () {
  const application = await createApp('test')
  const responseData = application.data

  await createAndroidVariant(responseData.pushApplicationID, 'test')
  await createIosVariant(responseData.pushApplicationID, 'test')

  console.log(`
    Push Application ID:    ${responseData.pushApplicationID}
    Master Secret:          ${responseData.masterSecret}
    `
  )
  //await deleteApp(appId)
}

init()