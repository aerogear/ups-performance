# ups-performance
Repository containing scripts used for load/performance testing of UPS (Unified Push Server)

## Prerequisites
* Node.js 10
* [AeroGear Unified Push Server](https://github.com/aerogear/aerogear-unifiedpush-server) running locally or in OpenShift
* [k6 performance testing tool](https://k6.io/) installed locally

## Prepare UPS instance for tests

Install dependencies
```
npm install
```

Export URL to UPS instance (otherwise default is used: `http://localhost:9999`)
```
export UPS_URL="https://your-ups-instance.openshift.com"
```

Export these variables if you want to populate UPS instance with valid Firebase/APNS credentials
```
export UPS_URL="https://your-ups-instance.openshift.com"
export ANDROID_SENDER_ID="<firebase-sender-id>"
export ANDROID_SERVER_KEY="<firebase-sender-key>"
export IOS_BASE64_CERTIFICATE="<base64-encoded-ios-dev-certificate>"
export IOS_CERTIFICATE_PASSWORD="<password-for-ios-certificate>"
```

Run the script to populate UPS instance with application, variants and to register (fake) devices
```
node init
```

This will print out the information you need to run the tests

```
$ node init

    Push Application ID:    219e929a-2909-4057-bccd-66de8771c294
    Master Secret:          9a44275c-329d-4405-9150-aa730e276364
```

## How to run the tests

Export variables for Push Application ID and Master Secret from script output you ran in
previous step (**Push Application ID** and **Master Secret**)

```
export UPS_APP_ID="<your-push-application-id>"
export UPS_APP_MASTER_SECRET="<your-app-master-secret>"
```

Run the test (following command will start sending push notifications from 5 clients
for 5s duration)

```
k6 run --vus 10 --duration 5s test/k6-load-test.js
```

When the test is finished, k6 will print out test results with useful information, such as
* number of finished iterations (notifications sent and processed)
* number of successful/failed requests
* average time spent on one iteration