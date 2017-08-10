// city.json 及 province.json 来自
// https://misc.360buyimg.com/jdf/1.0.0/ui/area/1.0.0/area.js
const https = require('https')
const fs = require('fs')

let provincesRaw = require('./province.json')
let citiesRaw = require('./city.json')
let info = require('./cache/pingyin.json')
let areas = {}

provincesRaw.split(',').forEach(item => {
  let provinceName = item.split('|')[0]
  areas[provinceName] = {
    id: item.split('|')[1],
    capital: item.split('|')[2],
    isMunicipality: !!item.split('|')[3]
  }
})

for (const key in areas) {
  let cities = {}
  const provinceId = areas[key].id
  citiesRaw[provinceId].split(',').forEach(val => {
    const [city, id] = val.split('|')
    cities[city] = id
  })
  if (areas[key].isMunicipality) {
    attempt(() => {
      const temp = {}
      temp[info[key].fullName] = Object.keys(cities)
      cities = temp
    })
  }
  areas[key] = cities
}

fillDistricts().then(() => {
  areas['香港特别行政区'] = {
    '香港特别行政区': areas['港澳']['香港特别行政区']
  }
  areas['澳门特别行政区'] = {
    '澳门特别行政区': areas['港澳']['澳门特别行政区']
  }
  delete areas['港澳']
  for (const province in areas) {
    console.log(province)
    if (!info[province]) {
      continue
    }
    const {pingyin, fullName} = info[province]
    const provinceData = {}

    provinceData[fullName] = areas[province]
    areas[fullName] = areas[province]
    delete areas[province]

    fs.writeFileSync('./src/' + pingyin + '.json', JSON.stringify(provinceData, null, 2))
  }
  fs.writeFileSync('./cache/areas.json', JSON.stringify(areas, null, 2))
}).catch(err => {
  console.error(err)
})

async function fillDistricts() {
  for (const key in areas) {
    let province = areas[key]
    for (const city in province) {
      const cityId = province[city]
      if (typeof cityId !== 'string') {
        continue
      }
      try {
        let districts = await getDistricts(cityId)
        districts = districts.map(item => item.name)
        province[city] = districts
      } catch (err) {
        console.error(err)
      }
    }
  }
}

function getDistricts(fid) {
  return new Promise((resolve, reject) => {
    let path = './cache/' + fid
    attempt(() => {
      fs.mkdirSync('./cache')
    })
    try {
      if (fs.existsSync(path)) {
        return resolve(JSON.parse(fs.readFileSync(path).toString()))
      }
    } catch (err) {
      console.error(err)
    }
    https.get(`https://d.jd.com/area/get?fid=${fid}`, res => {
      res.on('data', (d) => {
        console.log(d.toString())
        fs.writeFileSync(path, d)
        resolve(JSON.parse(d.toString()))
      });
    }).on('error', reject)
  })
}

function attempt(cb) {
  try {
    cb()
  } catch (err) {
  }
}