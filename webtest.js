const express = require('express')
    , path = require('path')
const expressHandlebars = require('express-handlebars')
const app = express()
const bodyparser = require('body-parser')
    , static = require('serve-static')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const crypto = require('crypto')
require('moment-timezone');
const cheerio = require('cheerio')
const moment = require('moment')
const request = require('request')
const schedule = require('node-schedule')
let multer = require('multer')
const fs = require('fs');
const xlsx = require("xlsx")
let server = require('http').createServer(app);
let io = require('socket.io')(server)
const cors = require('cors')
const session = require('express-session')
const cookieParser = require('cookie-parser')
app.use(cors({
    origin: true,
    credentials: true
}))
process.setMaxListeners(15);
let Graphql = require('graphql')
const jwt = require('jsonwebtoken')
let GraphqlHttp = require('express-graphql').graphqlHTTP

const { WSATYPE_NOT_FOUND } = require('constants')
const { response } = require('express')
const { next } = require('cheerio/lib/api/traversing')
const { constants } = require('http2')

app.use(cookieParser())
app.use(
    session({
        key: "logindata",
        secret: "secretuser",
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: (3.6e+6) * 24
        },
    })
)

const port = process.env.PORT || 8001
app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}))
app.set('view engine', 'handlebars')
app.use(express.static(__dirname + '/public'))
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/api'))
app.use('/smartmirror', static(path.join(__dirname, 'smartmirror')));
// 라우터 사용하여 라우팅 함수 등록
let router = express.Router()
app.use('/', router)

const todayDay = moment().format('DD')
const todayYear = moment().format('YY')
const todayMonth = moment().format('MM')

const mongo = require('./mongo/mongo')
const mirrorsave = require('./mongo/mirrorsave')
const getDays = require('./script/getDays')
const water = require('./script/water')
const mysql = require('./script/Mysql');
const { Interface } = require('readline');
let weekData
let yearData
async function Init() {
    let wfunc = await water.initWater(7)
    weekData = water
    water.getPercent(weekData)
    let yfunc = await water.initWater(7)
    yearData = water
    water.getPercent(yearData)

    /*
         // localname 중복검사 및 추가
        //서버 실행시 구역을 선택하기 위하여 콤보박스에 목록을 추가하는 코드입니다.
        for (let index = 2; index <= 3775; index++) {
            let data = firstSheet["C" + index].v
            let state = true;
            // 중복검사
            for (let i = 0; i < localname.length; i++) {
                if (localname[i] == data) {
                    state = false;
                    break
                }
            }
            // 새 데이터 추가
            if (state) localname.push(data)
        }
        cityname = new Array()
        
        //서버 실행시 초기 설정되었던 행정구역 코드 설정
        villagename = new Array();
        */
}
Init()
process.on('SIGINT', async () => {
    console.log('서버를 종료합니다.');
    
    // 프로세스 종료
    process.exit();
  });

let percentArray = new Array()
let yearpercentArray = new Array()
/*
계속 데이터베이스를 불러오는건 낭비이니깐
매일 12시에만 데이터를 불러서 저장하고
실시간으로 들어오는건 변수에 저장을 하자.
*/
app.get('/testwater_recieve', function (req, res) {
    let watervalue = parseFloat(((req.query.id) / 1000).toFixed(3))
    weekData.Valueobject[0][6] = (parseFloat(weekData.Valueobject[0][6]) + watervalue).toFixed(3)
    water.getPercent(weekData)
    yearData.Valueobject[0][6] = (parseFloat(yearData.Valueobject[0][6]) + watervalue).toFixed(3)
    water.getPercent(yearData)

    io.emit('weekendwater', weekendWater[0])  //량
    io.emit('waterpercent', percentArray) //일주일%
    io.emit('weekendTotalUseage', weekendTotalUseage) //일주일 총%
    io.emit('yearTotalUseage', yearTotalUseage) //연총량
    io.emit('wateryearpercent', yearpercentArray) //연총%
    io.emit('yearWater', yearWater[todayMonth - 1])
    res.render('dkatk', { layout: null })
})

app.get('/dkatk', async function (req, res) {
    let wfunc = await mirrorsave.getFile("None")
    let vid = mirrorsave.VideoFile
    let img = mirrorsave.ImageFile
    console.log(vid)
    console.log(img)
    res.render('dkatk', {
        weekData: weekData, yearData: yearData
    })
})
/*
res.render('dkatk', {
        weekData: weekData,yearData : yearData, cbDvalue : cbDvalue, cbYvalue : cbYvalue,selectcityname: selectcityname, selectvillagename: selectvillagename
    })*/

let localname = new Array()

app.get('/main', function (req, res) {
    //수전 데이터중 일주일 데이터의 수치를 보여준다.
    let cbDvalue = Math.max.apply(null, weekData.Valueobject[0])
    let cbYvalue = Math.max.apply(null, yearData.Valueobject[0])
    res.render('subcopy', {
        weekData: weekData, yearData: yearData
    })
})

// custom 404 page
app.use((req, res) => {
    res.type('text/plain')
    res.status(404)
    res.send('404 - Not Found')
})

// custom 500 page
app.use((err, req, res, next) => {
    console.error(err.message)
    res.type('text/plain')
    res.status(500)
    res.send('500 - Server Error')
})

server.listen(port, () => console.log(
    `Express started on http://localhost:${port}; ` +
    `press Ctrl-C to terminate.`)
)



/*

{{#each weekData.Valueobject.[0] as |value key|}}
    {{#each ../weekData.getDate as |childValue childKey|}} 
        <div>{{value}} - {{childValue}}. {{key}}</div>
    {{/each}}
{{/each}}


구역쪽
selectcityname: selectcityname, selectvillagename: selectvillagename,

어제 water.Valueobject[0][5]
오늘 water.Valueobject[0][6]
전달 water.Valueobject[0][10]
이번달 water.Valueobject[0][11]
이번주 총 Math.max.apply(null, Valueobject[0])
7일(L,%,달,월) Valueobject[0][0~6]
올해 총 Math.max.apply(null, Valueobject[0])
1~12개월 Valueobject[0][0~11]
*/




app.get('/wateruseage', function (req, res) {
    let cbDvalue = Math.max.apply(null, weekData.Valueobject[0])
    let cbYvalue = Math.max.apply(null, yearData.Valueobject[0])
    io.emit('weekendwater', weekData.Valueobject[0][6])  //량
    io.emit('waterpercent', weekData.Percent) //일주일%
    io.emit('weekendTotalUseage', weekData.Valueobject[0]) //일주일 총%
    io.emit('yearTotalUseage', weekData.Valueobject[0]) //연총량
    io.emit('wateryearpercent', weekData.Percent) //연총%
    io.emit('yearWater', weekData.Valueobject[todayMonth - 1])
    res.render('wateruseage', {
        selectcityname: selectcityname, selectvillagename: selectvillagename, weekData: weekData, yearData: yearData
    })
})

