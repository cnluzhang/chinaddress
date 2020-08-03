// city.json 及 province.json 来自
// https://misc.360buyimg.com/jdf/1.0.0/ui/area/1.0.0/area.js
const fs = require('fs')
const https = require('https')

const url = 'https://misc.360buyimg.com/jdf/1.0.0/ui/area/1.0.0/area.js'

let info = require('./cache/pingyin.json')

main().then(process.exit, process.exit)

async function main() {
  let areas = {}
  try {
    console.log('Fetching Provinces and Cities')
    const {provincesRaw, citiesRaw} = await getProvincesAndCities()
    provincesRaw.split(',').forEach(item => {
      let provinceName = item.split('|')[0]
      areas[provinceName] = {
        id: item.split('|')[1],
        capital: item.split('|')[2],
        isMunicipality: !!item.split('|')[3]
      }
    })

    console.log('Extracting areas')
    for (const key of Object.keys(areas)) {
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

    console.log('Filling districts')
    areas = await fillDistricts(areas)
    if (areas['港澳']) {
      areas['香港特别行政区'] = {
        '香港特别行政区': areas['港澳']['香港特别行政区']
      }
      areas['澳门特别行政区'] = {
        '澳门特别行政区': areas['港澳']['澳门特别行政区']
      }
    }
    delete areas['港澳']

    console.log('Filling districts')
    for (const province of Object.keys(areas)) {
      if (!info[province]) {
        continue
      }
      console.log('Filling %s', province)
      const {pingyin, fullName} = info[province]
      const provinceData = {}

      provinceData[fullName] = areas[province]
      areas[fullName] = areas[province]
      delete areas[province]

      fs.writeFileSync('./src/' + pingyin + '.json', JSON.stringify(provinceData, null, 2))
    }
    fs.writeFileSync('./cache/areas.json', JSON.stringify(areas, null, 2))
  } catch (err) {
    console.error(err)
  }
}

async function fillDistricts(areas) {
  for (const key of Object.keys(areas)) {
    const province = areas[key]
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
  return areas
}

function getProvincesAndCities() {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let str = ''
      res.on('data', (d) => {
        str = str.concat(d.toString())
      })
      res.on('end', () => {
        const provincesRaw = str.match(/a\.each\(("[\w\W]+?")\.split/mi)[1]
        const citiesRaw = str.match(/a\.each\(({[\w\W]+?}),\s?function/mi)[1]
        resolve({provincesRaw: eval('(' + provincesRaw + ')'), citiesRaw: eval('(' + citiesRaw + ')')})
      })
      res.on('error', err => {
        reject(err)
      })
    })
  })
}

function getDistricts(fid) {
  return new Promise((resolve, reject) => {
    console.log('Fetching %s', fid)
    https.get(`https://fts.jd.com/area/get?fid=${fid}`, res => {
      let result = ''
      res.on('data', (d) => {
        result += d.toString()
      })
      res.on('end', () => {
        resolve(JSON.parse(result))
      })
      res.on('error', reject)
    })
  })
}

function attempt(cb) {
  try {
    cb()
  } catch (err) {
  }
}
