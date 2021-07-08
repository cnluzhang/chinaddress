/**
 * Created by chenzhuokai on 2017/7/17.
 */
'use strict';
const fs = require('fs')
const jsonConcat = require('json-concat')
const mainlandOnly = process.argv[2] === '--mainland'

// 按京东的地址选择器顺序排列
let files = [
  'Beijing.json',
  'Shanghai.json',
  'Tianjin.json',
  'Chongqing.json',

  'Hebei.json',
  'Shanxi.json',
  'Henan.json',
  'Liaoning.json',

  'Jilin.json',
  'Heilongjiang.json',
  'InnerMongolia.json',
  'Jiangsu.json',

  'Shandong.json',
  'Anhui.json',
  'Zhejiang.json',
  'Fujian.json',

  'Hubei.json',
  'Hunan.json',
  'Guangdong.json',
  'Guangxi.json',

  'Jiangxi.json',
  'Sichuan.json',
  'Hainan.json',
  'Guizhou.json',

  'Yunnan.json',
  'Tibet.json',
  'Shaanxi.json',
  'Gansu.json',

  'Qinghai.json',
  'Ningxia.json',
  'Xinjiang.json',

  'Hongkong.json',
  'Macau.json',
  'Taiwan.json'
]

if (mainlandOnly) {
  files = remove(files, 'Hongkong.json', 'Macau.json', 'Taiwan.json')
}

for (const file of files) {
  const jsonText = fs.readFileSync('./src/' + file)
  try {
    JSON.parse(jsonText)
  } catch (err) {
    console.error('JSON format error in', file, err)
    process.exit(1)
  }
}

const dest = `./dist/${mainlandOnly ? 'mainland' : 'areas'}.json`
jsonConcat({
  src: files.map(file => './src/' + file),
  dest: null
}, function (err, json) {
  if (err) {
    console.error(err)
    process.exit(1)
    return
  }

  console.log('JSON concat success, writing file')
  fs.writeFileSync(dest, JSON.stringify(json, null, 2))
  fs.writeFileSync(dest.replace('.json', '.min.json'), JSON.stringify(json))

  const jsonArray = []
  for (const provinceName in json) {
    const cities = json[provinceName]
    const citiesArray = []
    for (const cityName in cities) {
      citiesArray.push({
        [cityName]: cities[cityName]
      })
    }
    const province = {
      [provinceName]: citiesArray
    }
    jsonArray.push(province)
  }
  fs.writeFileSync(dest.replace('.json', '.array.json'), JSON.stringify(jsonArray, null, 2))
  fs.writeFileSync(dest.replace('.json', '.array.min.json'), JSON.stringify(jsonArray))

  process.exit()
});


function remove(array, ...args) {
  args.forEach(arg => {
    array.splice(array.indexOf(arg), 1)
  })
  return array
}
