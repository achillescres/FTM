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

const R = 10


async function meanVector(v1, v2) {
    return {x: (v1.x + v2.x) * 0.5, y: (v1.y + v2.y) * 0.5}
}

async function distance(v1, v2) {
    let x = v1.x - v2.x
    let y = v1.y - v2.y
    return Math.sqrt(x * x + y * y)
}


async function searchFlags(deers) {
    const isNum = (el) => {
        return typeof el === 'number'
    }

    let flags = []
    let flagI = 0
    for (let i = 0; i < deers.length; i++) {
        if (isNum(deers[i].flag)) {
            continue
        }

        let flag = deers[i].coords;
        deers[i].flag = flagI

        for (let j = 0; j < deers.length; j++) {
            if (isNum(deers[j].flag) || i === j || Math.floor(await distance(deers[i].coords, deers[j].coords)) > R) {
                continue
            }
            deers[j].flag = flagI
            flag = await meanVector(flag, deers[j].coords)
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
