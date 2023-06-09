require('dotenv').config({ path: './config.env' })
const express = require('express')
const app = express()
const path = require('path')
const expressHandlebars = require('express-handlebars')
const static = require('serve-static')
const schedule = require('node-schedule')
const fs = require('fs');
const https = require('https')
const cors = require('cors')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const request = require('request')
const cheerio = require('cheerio')
const moment = require('moment-timezone')
moment.tz.setDefault("Asia/Seoul")
const options = {
    key: fs.readFileSync('config/localhost.key'),
    cert: fs.readFileSync('config/localhost.crt'),
    requestCert: false,
    rejectUnauthorized: false
};
let server = require('http').createServer(app)
//const server = https.createServer(options, app)
let io = require('socket.io')(server)
const router = require('./router')
const getDays = require('./script/getDays')
const mirror = require('./script/mirrorSql')
const { weekData, yearData, regionWeatherData,curImgFile,curVideoFile } = router

router.setIo(io)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: true,
    credentials: true
}))
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
app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}))
app.set('view engine', 'handlebars')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'api')))
app.use('/smartmirror', static(path.join(__dirname, 'smartmirror')))
app.use('/', router.getRouter())
const httpsPort = process.env.PORT || 8001

//매일 오전0시에 예약한 날짜가 되면 스마트미러에 예약한 이미지포스터로 교체, 새로운 일일 수전사용량 데이터생성
schedule.scheduleJob("0 0 0 * * *", async function () {
    try{
        //새로운 데이터를 생성합니다.
    await weekData.save(7, weekData.valueObject[0][0], weekData.getDate[0])
    await yearData.save(12, yearData.valueObject[0][0], yearData.getDate[0])
    weekData.addDb()

    await curImgFile.DeleteAll("ImgFile")
    await curVideoFile.DeleteAll("VideoFile")

    await curImgFile.ChangeFile("ImgFile")
    await curVideoFile.ChangeFile("VideoFile")
    }
    catch(err){
        console.log(err)
    }
})
let url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst'
let queryParams = '?' + encodeURIComponent('ServiceKey') + '=VHqmEJqAw45745GV0%2BkA3l6TePYLRpgPhuEYJMsNv69w%2F6NaV98Z6fOUZruSuV7xvSyOfSDEa941PCus5fUjzg%3D%3D' /* Service Key*/
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1') /* */
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('20') /* */
queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('XML') /* */
let cash = null
schedule.scheduleJob("*/20 * * * * *", function () {
    try{
        let nowHourTime = getDays.Hour + "00"
        if (getDays.Min < 30) {
            nowHourTime = nowHourTime - 100
        }
        if (nowHourTime < 1000) {
            nowHourTime = "0" + nowHourTime
        }
        const hourTime = nowHourTime.toString()
    
        queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(getDays.base_date) /* */
        queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(hourTime) /* */
        queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(regionWeatherData.currentlocationX) /* */
        queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(regionWeatherData.currentlocationY) /* */
    
        let currentImg
        if (cash === null || cash !== hourTime) {
            request({ url: url + queryParams, method: 'GET' }, function (error, response, body) {
                if (regionWeatherData.weatherName != "") {
                    regionWeatherData.weatherName = []
                }
                let $ = cheerio.load(body)
                $('item').each(function () {
                    const weather = $(this).find('category').text()
                    const wea_val = $(this).find('obsrValue').text()
                    if (weather == 'PTY' || weather == 'T1H') {
                        regionWeatherData.weatherName.push(wea_val)
                    }
                })
            })
    
            /*
            없음(0), 비(1), 비/눈(2), 눈(3), 소나기(4), 빗방울(5), 빗방울/눈날림(6), 눈날림(7)
            */
            switch (regionWeatherData.weatherName[0]) {
                case '0': currentImg = "weathericon/weather-0.png"
                    break
                case '1': currentImg = "weathericon/weather-4.png"
                    break
                case '2':
                case '6': currentImg = "weathericon/weather-2.png"
                    break
                case '3':
                case '7': currentImg = "weathericon/weather-3.png"
                    break
                case '4':
                case '5': currentImg = "weathericon/weather-1.png"
                    break
            }
            cash = hourTime
            console.log(cash)
            console.log("함수실행")
            io.emit("currentimage", currentImg)
            io.emit("currentT1H", regionWeatherData.weatherName[1])
        }
    }catch(err){

    }
})
schedule.scheduleJob("0 0 0 0 1 *", function () {
    try{
        yearData.addDb(12)
    }catch(err){

    }
})

async function init() {
    await regionWeatherData.init()

    await curImgFile.GetFile()
    await curVideoFile.GetFile()
    await weekData.getData()
    await weekData.getPercent()
    await yearData.getData()
    await yearData.getPercent()
    mirror.version++
}
init()


// custom 404 page
app.use((req, res) => {
    res.type('text/plain')
    res.status(404)
    res.send('404 - Not Found')
})

// custom 500 page
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.type('text/plain')
    res.status(500)
    res.send('500 - Server Error')
})

server.listen(httpsPort, () => {
    console.log(`Express started on https://localhost:${httpsPort}; press Ctrl-C to terminate.`)
})

process.on('SIGINT', async () => {
    console.log('서버 종료.')
    console.log(weekData.dates[0])
    await weekData.save(7, weekData.values[0][0], weekData.dates[0])
    // 프로세스 종료
    process.exit()
});
