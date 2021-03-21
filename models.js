/*

How deer obj must look like:
{
    coords: {
        x, y
    }

    speed,
    speedVector,
}

How to import functions:
const claster = require(./{nameOfFile}
....
flags = claster.searchFlag(deers) # deers is Array from deer objs
flaggedDeers = claster.clasterFlag(deers, flags)

*/

const _R = 4
const _BIGR = 11


async function meanVector(v1, v2) {
    return {x: (v1.x + v2.x) * 0.5, y: (v1.y + v2.y) * 0.5}
}

async function distance(v1, v2) {
    let x = v1.x - v2.x
    let y = v1.y - v2.y
    return Math.sqrt(x * x + y * y)
}

// Strict Vector Centering
async function searchFlags(deers, isSmall) {
    let R = isSmall ? _R : _BIGR
    const isNum = (el) => {
        return typeof el === 'number'
    }

    let flags = []
    let flagI = 0
    for (let i = 0; i < deers.length; i++) {
        if (isNum(deers[i].flag)) {
            continue
        }

        let flag = {coords: deers[i].coords, speed: 0, speedVector: {x: 0, y: 0}}
        deers[i].flag = flagI

        for (let j = 0; j < deers.length; j++) {
            if (isNum(deers[j].flag) || i === j || Math.floor(await distance(deers[i].coords, deers[j].coords)) >= R) {
                continue
            }
            deers[j].flag = flagI
            flag = {coords: await meanVector(flag.coords, deers[j].coords), speed: 0, speedVector: {x: 0, y: 0}}
        }
        await flags.push(flag)
        flagI++
    }

    return flags
}

async function heatMap() {

}

module.exports = {
    searchFlags: searchFlags,
}