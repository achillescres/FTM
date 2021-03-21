const express = require('express')
const admin = require("firebase-admin")

const model = require('./models.js')
const serviceAccount = require("./flytomoon-b141b-firebase-adminsdk-ys77s-a8cd02940d.json")

const app = express()
const PORT = 3000

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://flytomoon-b141b-default-rtdb.europe-west1.firebasedatabase.app'
})

const db = admin.database()
const flagsRef = db.ref('flags')
const deersRef = db.ref('deers')
const pasturesRef = db.ref('pastures')
var flags

async function setDeers(deers) {
    await db.ref('deers').update(deers)
}

async function setFlags(flags) {
    const newFlags = {}
    const dbFlagsLen = await (await flagsRef.once('value')).numChildren()
    console.log(dbFlagsLen)
    for (let i = 0; i < flags.length; i++) {
        newFlags[`f${i + dbFlagsLen}`] = flags[i]
    }
     await flagsRef.update(newFlags)
}

async function setPastures(pastures) {
    let x, y
    const newPastures = {}
    for (let i = 0; i < pastures.length; i++) {
        x = Math.floor(pastures[i].coords.x / 11)
        y = Math.floor(pastures[i].coords.y / 11)
        newPastures[`${x}x${y}y`] = `${x}x${y}y`
    }
    console.log(newPastures)
    await pasturesRef.set(newPastures)
}

async function getDeers() {
    let deers = []
    let ndeer
    for (let i = 0; i < 20; i++) {
        ndeer = (await db.ref(`deers/deer${i}`).once("value")).val()
        deers.push({
                coords: {
                    x: ndeer.x,
                    y: ndeer.y
                },
                speed: ndeer.v, speedVector: ndeer.V
            })
    }
    return deers
}

async function refresher() {
    flags = await model.searchFlags(await getDeers(),true)
    console.log(flags)
    await setFlags(flags)
}

async function refreshPastures() {
    console.log('Refreshing...')
    const pastures = await model.searchFlags(flags, false)
    await setPastures(pastures)
}

app.get('/', async (req, res) => {
    await res.send('<h1>Hello World!</h1>')
})

app.post('/new', async (req, res) => {
    let deers = req.body.deers
    await setDeers(deers)
    console.log("New data ate!")
})

app.listen(PORT, async () => {
    console.log(`Server running at ${PORT}`)
    await refresher()
    //setInterval(refresher, 10000)

    await refreshPastures()
    setInterval(refreshPastures, 20000)
})
