const http = require('http');
const admin = require("firebase-admin");

const claster = require('./clstarization.js')
const serviceAccount = require("./flytomoon-b141b-firebase-adminsdk-ys77s-a8cd02940d.json");


const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, World!\n');
})

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://flytomoon-b141b-default-rtdb.europe-west1.firebasedatabase.app'
})

let db = admin.database()
let flagRef = db.ref('flags')
async function setDeer() {
    for (let i = 0; i < 20; i++) {
        deer = db.ref('deer' + i)
        deer.set({
            x: Math.floor(Math.random() * 100),
            y: Math.floor(Math.random() * 100),
            v: Math.floor(Math.random() * Math.floor(200)),
            V: Math.floor(Math.random() * Math.floor(200)),
        })
    }
}

async function setFlags(flags) {
    const newFlags = {}
    const dbFlagsLen = await (await flagRef.once('value')).numChildren()
    console.log(dbFlagsLen)
    for (let i = 0; i < flags.length; i++) {
        newFlags[`f${i + dbFlagsLen}`] = flags[i]
    }
     await db.ref('flags').update(newFlags)
}

async function getDeers(){
    let deers = []
    let ndeer
    for (let i = 0; i < 20; i++) {
        ndeer = (await db.ref(`deer${i}`).once("value")).val()
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
    const flags = await claster.searchFlags(await getDeers())
    //console.log(flags.length)
    await setFlags(flags)
}

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
    console.log('Updated')
    setInterval(refresher, 3000)
})
