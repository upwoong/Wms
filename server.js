require('dotenv').config({ path: './config.env' });
const express = require('express')
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
moment.tz.setDefault("Asia/Seoul");

const options = {
    key: fs.readFileSync('config/localhost.key'),
    cert: fs.readFileSync('config/localhost.crt'),
    requestCert: false,
    rejectUnauthorized: false
  };
const server = https.createServer(options, app)
const io = require('socket.io')(server)
const routes = require('./router')
module.exports = {
    io: io
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, 'api')))
app.use('/smartmirror', static(path.join(__dirname, 'smartmirror')));
app.use('/',routes.router)
const httpsPort = process.env.PORT || 443

const Days = require('./script/getDays')
const mirrorSql = require('./script/mirrorSql')
const Water = require('./script/Water')

//매일 오전0시에 예약한 날짜가 되면 스마트미러에 예약한 이미지포스터로 교체, 새로운 일일 수전사용량 데이터생성
schedule.scheduleJob("0 0 0 * * *", async function () {
    //새로운 데이터를 생성합니다.
    await Water.save(7, routes.waterArray.weekData.valueObject[0][0], routes.waterArray.weekData.getDate[0])
    await Water.save(12, routes.waterArray.yearData.valueObject[0][0], routes.waterArray.yearData.getDate[0])
    Water.addDb(7)

    await mirrorSql.DeleteAll("ImgFile")
    await mirrorSql.DeleteAll("VideoFile")

    await mirrorSql.ChangeFile("ImgFile")
    await mirrorSql.ChangeFile("VideoFile")
    mirrorSql.version++
});
let url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
let queryParams = '?' + encodeURIComponent('ServiceKey') + '=VHqmEJqAw45745GV0%2BkA3l6TePYLRpgPhuEYJMsNv69w%2F6NaV98Z6fOUZruSuV7xvSyOfSDEa941PCus5fUjzg%3D%3D'; /* Service Key*/
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1') /* */
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('20') /* */
queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('XML') /* */
let cash = null
schedule.scheduleJob("*/20 * * * * *", function () {
    let nowHourTime = Days.Hour + "00"
    if (Days.Min < 30) {
        nowHourTime = nowHourTime - 100
    }
    if (nowHourTime < 1000) {
        nowHourTime = "0" + nowHourTime
    }
    const hourTime = nowHourTime.toString()

    queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(Days.base_date) /* */
    queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(hourtime); /* */
    queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(routes.weatherInfo.currentlocationX) /* */
    queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(routes.weatherInfo.currentlocationY) /* */

    let currentImg
    if (cash === null || cash !== hourTime) {
        request({ url: url + queryParams, method: 'GET' }, function (error, response, body) {
            if (routes.weatherInfo.weatherName != "") {
                routes.weatherInfo.weatherName = []
            }
            let $ = cheerio.load(body);
            $('item').each(function () {
                const weather = $(this).find('category').text()
                const wea_val = $(this).find('obsrValue').text()
                if (weather == 'PTY' || weather == 'T1H') {
                    routes.weatherInfo.weatherName.push(wea_val)
                }
            });
        })

        /*
        없음(0), 비(1), 비/눈(2), 눈(3), 소나기(4), 빗방울(5), 빗방울/눈날림(6), 눈날림(7)
        */
        switch (routes.weatherInfo.weatherName[0]) {
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
        cash = hourTime;
        console.log(cash)
        console.log("함수실행")
        io.emit("currentimage", currentimg)
        io.emit("currentT1H", routes.weatherInfo.weatherName[1])
    }
})
schedule.scheduleJob("0 0 0 0 1 *", function () {
    Water.addDb(12)
})

async function init() {
    let initWeather = ""
    const GetWeather = await mirrorSql.GetData("weather")
    if (GetWeather) {
        initWeather = GetWeather[0].Code
    }
    else {
        initWeather = 1111053000
    }

    for (let index = 2; index < 3775; index++) {
        if (initWeather == routes.weatherInfo.firstSheet["B" + index].v) {
            routes.placeInfo.selectCityName = routes.weatherInfo.firstSheet["D" + index].v
            routes.placeInfo.selectVillageName = routes.weatherInfo.firstSheet["E" + index].v
        }
    }

    for (let index = 2; index <= 3775; index++) {
        let data = routes.placeInfo.firstSheet["C" + index].v
        let state = true;
        for (let i = 0; i < routes.placeInfo.localName.length; i++) {
            if (routes.placeInfo.localName[i] == data) {
                state = false;
                break
            }
        }
        if (state) routes.placeInfo.localName.push(data)
    }

    //서버가 켜질때 x,y의 값을 불러와야 하므로 만든 코드
    for (let index = 2; index < 3775; index++) {
        if ((await sqlmirror.GetData("weather"))[0].Code == routes.weatherInfo.firstSheet["B" + index].v) {
            routes.weatherInfo.currentLocationX = routes.weatherInfo.firstSheet["F" + index].v
            routes.weatherInfo.currentLocationY = routes.weatherInfo.firstSheet["G" + index].v
        }
    }

    routes.waterArray.yearData = await Water.getData(12)
    routes.waterArray.weekData = await Water.getData(7)
    await Water.getPercent(routes.waterArray.yearData)
    await Water.getPercent(routes.waterArray.weekData)
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
  console.log(`Express started on https://localhost:${httpsPort}; press Ctrl-C to terminate.`);
})

process.on('SIGINT', async () => {
    console.log('서버 종료.');
    await Water.save(7, routes.waterArray.weekData.valueObject[0][0], routes.waterArray.weekData.getDate[0])
    // 프로세스 종료
    process.exit();
});
