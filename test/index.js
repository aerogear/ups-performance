const agSender = require("unifiedpush-node-sender")

const upsInstanceUrl = process.env.UPS_URL || "http://localhost:9999"
const applicationId = process.env.UPS_APP_ID || "0b83651c-c26d-47fb-8e95-13c34d20aa1a"
const masterSecret = process.env.UPS_APP_MASTER_SECRET || "3a3c6f3f-f9d7-4286-8f80-6928db3aa3a8"

const settings = {
    url: upsInstanceUrl,
    applicationId: applicationId,
    masterSecret: masterSecret
}

async function start() {
    const client = await agSender(settings)

    for (let i = 0; i < 100; i++) {
        const clientResponse = await client.sender.send({
            alert: "Test Alert",
            priority: "high"
        }, {
            criteria: {
                alias: ["cordova"]
            }  
        }).catch((error) => {
            console.log("Notification not sent, error received ", error)
        })
        console.log("Notification sent, response received ", clientResponse, i);
    }
}

start()