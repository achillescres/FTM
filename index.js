const express = require('express')
const admin = require("firebase-admin")
const path = require('path')

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
        x = Math.floor(Math.floor(pastures[i].coords.x / 11) * 11 / 1000)
        y = Math.floor(Math.floor(pastures[i].coords.y / 11) * 11 / 1000)
        let xx = Math.floor(pastures[i].coords.x / 11) * 11 / 1000
        let yy = Math.floor(pastures[i].coords.y / 11) * 11 / 1000
        newPastures[`${x}x${y}y`] = {coords: {x: xx , y: yy}}
    }

    console.log(newPastures)
    await pasturesRef.set(newPastures)
}

async function getDeers() {
    let _deers = (await db.ref('deers').once('value')).val()
    const deers = []
    for (let i in _deers) {
        deers.push(_deers[i])
    }
    return deers
}

async function getFlags() {
    let _flags = (await db.ref('flags').once('value')).val()
    const flags = []
    for (let i in _flags) {
        flags.push(_flags[i])
    }
    return flags
}

async function refresher() {
    flags = await model.searchFlags(await getDeers(),true)
    console.log(flags)
    await setFlags(flags)
}

async function refreshPastures() {
    console.log('Refreshing...')
    const pastures = await model.searchFlags(await getDeers(), false)
    await setPastures(pastures)
}

app.get('/', async (req, res) => {
    res.sendfile()
})

app.post('/new', async (req, res) => {
    let deers = req.body.deers
    await setDeers(deers)
    console.log("New data ate!")
})

function simulateDeers() {
    let alphas = new Array(3)
    for (let i = 0; i < alphas.length; i++) {
        alphas[i] = {coords: {x: Math.floor(120000 + Math.random() * 25000), y: Math.floor(66000 + Math.random() * 4050)},
            speed: 0, speedVector: {x: 0, y: 0}}
    }

    console.log(alphas)
    let deers = {}
    for (let i = 0; i < alphas.length; i++) {
        deers[`deer${i}`] = alphas[i]
    }

    console.log(deers)
    let xx
    let k = alphas.length
    for (let i = 0; i < alphas.length; i++) {
        for (let j = 0; j < Number(Math.ceil(Math.random() * 3) * 3); j++) {
            xx = Math.sqrt(Math.random())
            deers[`deer${k}`] = {
                    coords: {
                        x: (xx  + alphas[i].coords.x),
                        y: (Math.sqrt(1 - xx) + alphas[i].coords.y)
                    }, speed: 0, speedVector: {x: 0, y: 0}
            }
            k++
        }
    }
    db.ref('deers').set(deers)
}

app.listen(PORT, async () => {
    console.log(`Server running at ${PORT}`)
    //await simulateDeers()
    //await refresher()
    //setInterval(refresher, 10000)

    await refreshPastures()
    //setInterval(refreshPastures, 20000)

    console.log(1)
    //simulateDeers()
})
