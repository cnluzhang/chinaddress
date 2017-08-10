中国三级地址库
===========
任何修改后，都请将你的名字添加在Editors.json里，作为整理者之一。

## 处理京东地址库
province.json 及 city.json 是从京东的[地址库 JS](https://misc.360buyimg.com/jdf/1.0.0/ui/area/1.0.0/area.js)中提取的

运行以下命令从以上两个 json 文件中同步数据到 src
```
$ npm install
$ npm run extract
```

## 如何构建
```
$ npm install
$ npm run build
```
请勿直接修改 dist 目录中的文件

## License
**ISC License (ISC)**
