const fs = require('fs')
const dir = fs.readdirSync('./src')

const pingyin = {}

dir.forEach(file => {
  let provinceName = fs.readFileSync('./src/' + file).toString().match(/"(.+?)"/)[1]
  let key = provinceName.replace(/((维吾尔|回族|壮族)?自治区|省|市)$/g, '')
  pingyin[key] = {
    pingyin: file.split('.')[0],
    fullName: provinceName
  }
})

fs.writeFileSync('./cache/pingyin.json', JSON.stringify(pingyin, null, 2))