require('dotenv').config({ path: './config.env' });
const express = require('express')
    , path = require('path')
const expressHandlebars = require('express-handlebars')
const app = express()
let static = require('serve-static')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
require('moment-timezone');
const cheerio = require('cheerio')
const moment = require('moment')
const request = require('request')
const schedule = require('node-schedule')
let multer = require('multer')
const fs = require('fs');
const xlsx = require("xlsx")
let options = {
    key: fs.readFileSync('config/localhost.key'),
    cert: fs.readFileSync('config/localhost.crt'),
    requestCert: false,
    rejectUnauthorized: false
};
//let server = require('http').createServer(app);
const https = require('https')
const httpsPort = process.env.PORT || 443
const cors = require('cors')
const session = require('express-session')
const cookieParser = require('cookie-parser')
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
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/api'))
app.use('/smartmirror', static(path.join(__dirname, 'smartmirror')));
let router = express.Router()
app.use('/', router)
const Days = require('./script/getDays')

let storagevideo = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'smartmirror/video')
    },
    filename: function (req, file, callback) {
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        basename = basename.replace(/(\s*)/g, "")
        callback(null, basename + extension);
    }
});

const sqlmirror = require('./script/crud')
const User = require('./script/User');
const Water = require('./script/Water')

class WeatherInfo {
    constructor() {
        this.weathername = []
        this.weathername = []
        this.currentlocationX = 0
        this.currentlocationY = 0
        this.readFile()
    }
    readFile() {
        const excelFile = xlsx.readFile("api/기상청41_단기예보 조회서비스_오픈API활용가이드_격자_위경도(20210401).xlsx")
        this.firstSheet = excelFile.Sheets[excelFile.SheetNames[0]]
    }
}
const excelFile = xlsx.readFile("api/기상청41_단기예보 조회서비스_오픈API활용가이드_격자_위경도(20210401).xlsx")
const firstSheet = excelFile.Sheets[excelFile.SheetNames[0]]
class PlaceInfo {
    constructor() {
        this.localselect = ""
        this.cityselect = ""
        this.villageselect = ""
        this.selectcityname = ""
        this.selectvillagename = ""
        this.localname = []
        this.cityname = []
        this.villagename = []
        this.readFile()
    }
    readFile() {
        const excelFile = xlsx.readFile("api/기상청41_단기예보 조회서비스_오픈API활용가이드_격자_위경도(20210401).xlsx")
        this.firstSheet = excelFile.Sheets[excelFile.SheetNames[0]]
    }
}

class WaterArray {
    constructor() {
        this.weekData = []
        this.yearData = []
    }
}
class SmartMirror {
    constructor() {
        this.refVideoArray = []
        this.refImageArray = []
        this.ComboVideo = []

        this.numberimage = 0
        this.numbervideo = 0
    }
}


const waterArray = new WaterArray()
const smartMirror = new SmartMirror()
const placeInfo = new PlaceInfo()
const weatherInfo = new WeatherInfo()




init()

let upload = multer({
    storage: storagevideo,
    limits: {
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
});
let storageimg = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'smartmirror/image')
    },
    filename: function (req, file, callback) {
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        basename = basename.replace(/(\s*)/g, "")
        callback(null, basename + extension);
    }
})

let uploadimg = multer({
    storage: storageimg,
    limits: {
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
})

let storageSmartmirror = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'smartmirror/item')
    },
    filename: function (req, file, callback) {
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        basename = basename.replace(/(\s*)/g, "")
        callback(null, basename + extension);
    }
})

let uploadSmartmirror = multer({
    storage: storageSmartmirror,
    limits: {
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
})
//기본 비디오 파일 저장
router.route('/processvideo').post(upload.array('photo', 1), async function (req, res) {
    const SaveVideo = await sqlmirror.SaveFile(req.files, "Video", "None", 0)
    switch (SaveVideo) {
        case 1: res.redirect('mediacontents')
            break
        case 2: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
            break
        case 3: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
            break
    }
});

//예약 비디오 파일 저장
router.route('/processbookingvideo').post(upload.array('photo', 1), async function (req, res) {
    const SaveVideo = await sqlmirror.SaveFile(req.files, "Video", "reservation", req.body.chooseimageday)
    switch (SaveVideo) {
        case 1: res.redirect('bookmedia')
            break
        case 2: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='bookmedia';</script>");
            break
        case 3: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='bookmedia';</script>");
            break
    }
});

//기본 이미지 파일 저장
router.route('/processimage').post(uploadimg.array('photo', 1), async function (req, res) {
    const SaveImg = await sqlmirror.SaveFile(req.files, "Img", "None", 0)
    switch (SaveImg) {
        case 1: res.redirect('mediacontents')
            break
        case 2: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
            break
        case 3: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
            break
    }
});

//예약 이미지 파일 저장
router.route('/processbookingimage').post(uploadimg.array('photo', 1), async function (req, res) {
    const SaveImg = await sqlmirror.SaveFile(req.files, "Img", "reservation", req.body.chooseimageday)
    switch (SaveImg) {
        case 1: res.redirect('bookmedia')
            break
        case 2: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='bookmedia';</script>");
            break
        case 3: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='bookmedia';</script>");
            break
    }
});

//스마트 미러 구동파일 교체
router.route('/processSmartmirror').post(uploadSmartmirror.array('photo', 1), function (req, res) {
    try {
        let files = req.files;
        if (files[0].filename == "SmartMirror.exe") {
            //변경
            ///home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/item/Smartmirror.exe
            fs.unlink(`/item/Smartmirror.exe`, function (err) {
                if (err) console.log(err)
            })
            sqlmirror.version++
        }
        else {
            console.log("Smartmirror.exe 구동파일이 아닙니다.")
            res.send("<script>alert('Smartmirror.exe 구동파일이 아닙니다.');location.href='smartmirrormanage';</script>");
        }
    } catch (err) {
        console.dir(err.stack);
    }
});

//files,kind,type,returnvalue
//비디오파일 삭제
app.post('/deletevideo', async function (req, res, next) {
    try {
        await sqlmirror.deletefile(req.files, "video", "None")
    } catch (err) {
        console.dir(err.stack);
    }
    res.redirect('mediacontents')
})

//이미지파일 삭제
app.post('/deleteimage',async function (req, res, next) {
    try {
        await sqlmirror.deletefile(req.files, "image", "None")
    } catch (err) {
        console.dir(err.stack);
    }
    res.redirect('mediacontents')
})

//예약 비디오파일 삭제
app.post('/deletereservationvideo',async function (req, res, next) {
    try {
        await sqlmirror.deletefile(req.files, "video", "reservation")
    } catch (err) {
        console.dir(err.stack);
    }
    res.redirect('bookmedia')
})

//예약 이미지파일 삭제

app.post('/deletereservationimage',async function (req, res, next) {
    try {
        await sqlmirror.deletefile(req.files, "image", "reservation")
    } catch (err) {
        console.dir(err.stack);
    }
    res.redirect('bookmedia')
})

//매일 오전0시에 예약한 날짜가 되면 스마트미러에 예약한 이미지포스터로 교체, 새로운 일일 수전사용량 데이터생성
schedule.scheduleJob("0 0 0 * * *", async function () {
    //새로운 데이터를 생성합니다.
    await Water.save(7, waterArray.weekData.Valueobject[0][0], waterArray.weekData.getDate[0])
    await Water.save(12, waterArray.yearData.Valueobject[0][0], waterArray.yearData.getDate[0])
    Water.addDb(7)

    //오늘 예약되어 있는 파일이 있는지 확인하기전 스마트미러 미디어 데이터베이스들을 다 삭제합니다.
    //데이터베이스에는 이름만 저장되어있고 파일은 Smartmirror/ 폴더안에 모두 저장되어 있습니다.
    await sqlmirror.DeleteAll("ImgFile")
    await sqlmirror.DeleteAll("VideoFile")

    await sqlmirror.ChangeFile("ImgFile")
    await sqlmirror.ChangeFile("VideoFile")
    sqlmirror.version++
});
let url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
let queryParams = '?' + encodeURIComponent('ServiceKey') + '=VHqmEJqAw45745GV0%2BkA3l6TePYLRpgPhuEYJMsNv69w%2F6NaV98Z6fOUZruSuV7xvSyOfSDEa941PCus5fUjzg%3D%3D'; /* Service Key*/
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1') /* */
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('20') /* */
queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('XML') /* */
let cash = null
schedule.scheduleJob("*/20 * * * * *", function () {
    moment.tz.setDefault("Asia/Seoul")
    let nowhourtime = Days.Hour + "00"
    if (Days.Min < 30) {
        nowhourtime = nowhourtime - 100
    }
    if (nowhourtime < 1000) {
        nowhourtime = "0" + nowhourtime
    }
    const hourtime = nowhourtime.toString()

    queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(Days.base_date) /* */
    queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(hourtime); /* */
    queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(weatherInfo.currentlocationX) /* */
    queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(weatherInfo.currentlocationY) /* */

    let currentimg
    if (cash === null || cash !== hourtime) {
        request({ url: url + queryParams, method: 'GET' }, function (error, response, body) {
            if (weatherInfo.weathername != "") {
                weatherInfo.weathername = []
            }
            let $ = cheerio.load(body);
            $('item').each(function () {
                const weather = $(this).find('category').text()
                const wea_val = $(this).find('obsrValue').text()
                if (weather == 'PTY' || weather == 'T1H') {
                    weatherInfo.weathername.push(wea_val)
                }
            });
        })

        /*
        없음(0), 비(1), 비/눈(2), 눈(3), 소나기(4), 빗방울(5), 빗방울/눈날림(6), 눈날림(7)
        */

        switch (weatherInfo.weathername[0]) {
            case '0': currentimg = "weathericon/weather-0.png"
                break
            case '1': currentimg = "weathericon/weather-4.png"
                break
            case '2':
            case '6': currentimg = "weathericon/weather-2.png"
                break
            case '3':
            case '7': currentimg = "weathericon/weather-3.png"
                break
            case '4':
            case '5': currentimg = "weathericon/weather-1.png"
                break
        }
        cash = hourtime;
        console.log(cash)
        console.log("함수실행")
        io.emit("currentimage", currentimg)
        io.emit("currentT1H", weatherInfo.weathername[1])
    }
})
schedule.scheduleJob("0 0 0 0 1 *", function () {
    Water.addDb(12)
})

//구역 선택 post
app.post('/weatherlista', function (req, res) {
    const name = req.body.name
    const city = req.body.city
    placeInfo.localselect = name
    placeInfo.cityselect = city
    placeInfo.cityname = []
    for (let index = 2; index <= 3775; index++) {
        if (placeInfo.localselect != firstSheet["C" + index].v) continue
        let data = firstSheet["D" + index].v
        if (data == "") continue;
        let state = true;
        for (let i = 0; i < placeInfo.cityname.length; i++) {
            if (placeInfo.cityname[i] == data) {
                state = false;
                break
            }
        }
        if (state) placeInfo.cityname.push(data)
    }
    placeInfo.villagename = new Array()
    for (let index = 2; index <= 3775; index++) {
        if (placeInfo.localselect == firstSheet["C" + index].v && placeInfo.cityselect == firstSheet["D" + index].v) {
            let data = firstSheet["E" + index].v
            if (data != "") placeInfo.villagename.push(data)
        }
    }
    res.redirect('main')
})

//최종 구역 선택
app.post('/weather', async function (req, res) {
    try{
        const name = req.body.name
        const city = req.body.city
        const village = req.body.village
        placeInfo.localselect = name
        placeInfo.cityselect = city
        placeInfo.villageselect = village
    
        for (let index = 2; index <= 3775; index++) {
            if (placeInfo.localselect == firstSheet["C" + index].v && placeInfo.cityselect == firstSheet["D" + index].v && placeInfo.villageselect == firstSheet["E" + index].v) {
                let data = firstSheet["B" + index].v
                placeInfo.selectcityname = firstSheet["D" + index].v
                placeInfo.selectvillagename = firstSheet["E" + index].v
                weatherInfo.currentlocationX = firstSheet["F" + index].v
                weatherInfo.currentlocationY = firstSheet["G" + index].v
                if (data != "") {
                    if (data == "") {
                        data = "2824561400" //임시 데이터
                    }
                    await sqlmirror.UpdateData(data)
                }
            }
        }
    
        sqlmirror.version++
        res.redirect('main')
    }catch(err){
        console.log(err)
        res.status(500).json({ error : 'server error'})
    }
})

//관리자 로그인
app.post('/main', async (req, res) => {
    const FindUser = await User.FindUser(req.body.name, req.body.password)
    if (FindUser) {
        req.session.logindata =
        {
            id: req.body.name,
            password: req.body.password,
            name: 'username',
            authorized: true
        }
        req.session.save(err => {
            if (err) console.log(err)
            else console.log(req.session)
        })
        console.log("관리자 로그인 성공")
        res.redirect('main')
    }
    else return res.status(404).send({ message: '유저 없음!' })
});

app.use('/mediacontents', async function (req, res) {
    try{
        const Video = await sqlmirror.GetFile("curvideofile", "None")
        const Img = await sqlmirror.GetFile("curimgfile", "None")
        console.log(Img)
        if (req.session.logindata) {
            res.render('mediacontents', {
                videofile: Video, imgfile: Img
            })
        }
        else {
            res.render('login', { layout: null })
        }
    }catch(err){
        console.log(err)
    }
})

app.use('/bookmedia', async function (req, res) {
    try{
        const Video = sqlmirror.GetFile("VideoFile", "reservation")
        const Img = sqlmirror.GetFile("ImgFile", "reservation")
        if (req.session.logindata) {
            res.render('bookmedia', {
                videofile: Video, imgfile: Img
            })
        }
        else {
            res.render('login', { layout: null })
        }
    }catch(err){
        console.log(err)
    }

})

app.get('/main', async function (req, res) {
    try{
        const Video = await sqlmirror.GetFile("curvideofile", "None")
        const Img = await sqlmirror.GetFile("curimgfile", "None")
        if (req.session.logindata) {
            res.render('subcopy', {
                weekData: waterArray.weekData, yearData: waterArray.yearData, videofile: Video, imgfile: Img,
                localname: placeInfo.localname, cityname: placeInfo.cityname, village: placeInfo.villagename, selectcityname: placeInfo.selectcityname, selectvillagename: placeInfo.selectvillagename,
                localselected: placeInfo.localselect, cityselected: placeInfo.cityselect
            })
        }
        else {
            res.render('login', { layout: null })
        }
    }catch(err){
        console.log(err)
    }
  

})

app.get('/login', function (req, res) {
    res.render('login', { layout: null })
})

app.get('/', function (req, res) {
    res.json({ message: `Server is running on port ${req.secure ? "HTTPS_PORT" : "HTTP_PORT"}` });
})

async function init() {
    let testweather = ""
    const GetWeatehr = await sqlmirror.GetData("weather")
    if (GetWeatehr) {
        testweather = GetWeatehr[0].Code
    }
    else {
        testweather = 1111053000
    }
    /*
    //{}""등 불필요한 문자 제거
    testweather = testweather.toString().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\//name\ ]/g, "")
*/
    for (let index = 2; index < 3775; index++) {
        if (testweather == firstSheet["B" + index].v) {
            placeInfo.selectcityname = firstSheet["D" + index].v
            placeInfo.selectvillagename = firstSheet["E" + index].v

        }
    }

    for (let index = 2; index <= 3775; index++) {
        let data = firstSheet["C" + index].v
        let state = true;
        for (let i = 0; i < placeInfo.localname.length; i++) {
            if (placeInfo.localname[i] == data) {
                state = false;
                break
            }
        }
        if (state) placeInfo.localname.push(data)
    }

    //서버가 켜질때 x,y의 값을 불러와야 하므로 만든 코드입니다.

    for (let index = 2; index < 3775; index++) {
        if ((await sqlmirror.GetData("weather"))[0].Code == firstSheet["B" + index].v) {
            weatherInfo.currentlocationX = firstSheet["F" + index].v
            weatherInfo.currentlocationY = firstSheet["G" + index].v
        }
    }

    waterArray.yearData = await Water.getData(12)
    waterArray.weekData = await Water.getData(7)
    await Water.getPercent(waterArray.yearData)
    await Water.getPercent(waterArray.weekData)
}

app.get('/smartmirror/item', function (req, res) {
    res.render('item', { layout: null })
})

app.get('/smartmirror/image/info', async function (req, res) {
    const SmartMirrorImgFile = await sqlmirror.GetData("ImgFile")
    res.json(SmartMirrorImgFile)
})

app.get('/smartmirror/video/info', async function (req, res) {
    const SmartMirrorVideoFIle = await sqlmirror.GetData("VideoFIle")
    res.json(SmartMirrorVideoFIle)
})

app.get('/smartmirror/item/info', async function (req, res) {
    const MirrorExe = await sqlmirror.GetData("MirrorExe")
    res.json(MirrorExe)

})

app.get('/smartmirror/weather', async function (req, res) {
    const Weather = await sqlmirror.GetData("Weather")
    res.render('weather', { contents: Weather[0].name, layout: null })
});

app.get('/smartmirror/model', async function (req, res) {
    const MirrorModel = await sqlmirror.GetData("MirrorModel")
    res.render('dummy', { contents: MirrorModel, layout: null })
})

// 스마트미러의 현재 실행하고 있는 비디오파일와 이미지파일 출력

app.get('/smartmirror/getcontents', function (req, res) {
    try{
        let model = req.query.model //스마트미러 모델명
        let contents = req.query.contents //스마트미러가 보여주는 미디어들
        let kinds = req.query.kinds //스마트미러가 보여주는 미디어들의 종류들 (이미지,비디오)
    
        let data = new Array()
        if (model != "") data.push(model) //model이 비어있지 않는다면 data변수에 저장
        if (contents != "") data.push(contents) //contents가 비어있지 않는다면 data변수에 저장
    
        let state = true;
        if (kinds == 0) // 비디오 데이터
        {
            for (let i = 0; i < smartMirror.refVideoArray.length; i++) {
                if (smartMirror.refVideoArray[i][0] == model) // 중복된 모델의 경우 덮어쓰기
                {
                    data.push(new Date())
                    smartMirror.refVideoArray[i] = data //data배열의 첫번째 데이터는 스마트미러 모델명이다.
                    state = false
                    break
                }
            }
            if (state) { //중복된 모델의 경우가 아닐경우
                data.push(new Date())
                smartMirror.refVideoArray.push(data)
            }
        }
        else // 이미지 데이터
        {
            for (let i = 0; i < smartMirror.refImageArray.length; i++) {
                if (smartMirror.refImageArray[i][0] == model) // 중복된 모델의 경우 덮어쓰기
                {
                    data.push(new Date())
                    smartMirror.refImageArray[i] = data //data배열의 첫번째 데이터는 스마트미러 모델명이다.
                    state = false
                    break
                }
            }
            if (state) { //중복된 모델이 아닐 경우
                data.push(new Date())
                smartMirror.refImageArray.push(data)
            }
        }
        res.render('dummy', { layout: null })
    }catch(err){
        console.log(err)
    }
})

/*
매니저 페이지 : 최근 5분 내 재생중인 홍보물을 확인하는 페이지
*/
//스마트미러 관리 페이지
/*
app.get('/smartmirrormanage', function (req, res) {
    const nowtime = new Date()
    for (let i = 0; i < smartMirror.refVideoArray.length; i++) {
        //현재시간에서 스마트미러의 비디오가 저장된 시간을 빼는 계산을 하여
        //현재 비디오가 몇분째 보여주고 있는지 계산한다.
        const elapsedMSec = nowtime - smartMirror.refVideoArray[i][2]
        const elapsedMin = elapsedMSec / 1000 / 60
        //만약 5분이상 보여주고 있다면 삭제를 하여 다음 비디오를 재생한다.
        if (elapsedMin > 5) smartMirror.refVideoArray.pop(i)
    }
    for (let i = 0; i < smartMirror.refImageArray.length; i++) {
        const elapsedMSec = nowtime - smartMirror.refImageArray[i][2]
        const elapsedMin = elapsedMSec / 1000 / 60
        if (elapsedMin > 5) smartMirror.refImageArray.pop(i)
    }
    // Combobox에 표시할 데이터
    // Combobox에 현재 실행되고 있는 스마트미러 모델명들을 보여준다.
    smartMirror.ComboVideo = new Array();
    for (let i = 0; i < smartMirror.refVideoArray.length; i++) {
        // if(smartMirror.refVideoArray[i][0] == 지정모델명)
        // 지정 모델명의 대체 이름 대입
        // 그 외의 경우 대입
        smartMirror.ComboVideo.push(smartMirror.refVideoArray[i][0])
    }
    res.render('smartmirrormanage', { videodata: smartMirror.refVideoArray, imgdata: smartMirror.refImageArray, ComboVideo: smartMirror.ComboVideo })
})
*/
app.post('/smartmirrormanage', function (req, res) {
    try{
        const selectsmartmirror = req.body.name
        const selectimage = req.body.selectimage
        for (let i = 0; i < smartMirror.refVideoArray.length; i++) {
            if (smartMirror.refVideoArray[i][0] == selectsmartmirror) {
                smartMirror.numbervideo = smartMirror.refVideoArray[i][1]
                break
            }
        }
    
        for (let i = 0; i < smartMirror.refImageArray.length; i++) {
            if (smartMirror.refImageArray[i][0] == selectimage) {
                smartMirror.numberimage = smartMirror.refImageArray[i][1]
                break
            }
        }
    
        const ImgFile = sqlmirror.GetData("ImgFile")
        const VideoFile = sqlmirror.GetData("VideoFile")
    
        res.render('smartmirrormanage', {
            videodata: smartMirror.refVideoArray, imgdata: smartMirror.refImageArray, selectsmartmirror: selectsmartmirror, ComboVideo: smartMirror.ComboVideo,
            num: VideoFile[smartMirror.numbervideo].name, imgfile: ImgFile[smartMirror.numberimage].name, selectimage: selectimage
        })
    }catch(err){
        console.log(err)
    } 
})

app.get('/smartmirror/version', function (req, res) {
    res.render('dummy', { layout: null, contents: sqlmirror.version })
})

app.get('/dummy', function (req, res) {
    res.render('dummy', { weekData: waterArray.weekData })
})

/**
 * 물 사용에 관한 아두이노 http통신시 처리기능
 */
app.get('/testwater_recieve', async function (req, res) {
    try{
        let watervalue = parseFloat(((req.query.id) / 1000).toFixed(3))
        waterArray.weekData.Valueobject[0][0] = (parseFloat(waterArray.weekData.Valueobject[0][0]) + watervalue).toFixed(3)
        await Water.getPercent(waterArray.weekData)
        waterArray.yearData.Valueobject[0][0] = (parseFloat(waterArray.yearData.Valueobject[0][0]) + watervalue).toFixed(3)
        await Water.getPercent(waterArray.yearData)
        console.log(waterArray.weekData)
        io.emit('weekendwater', waterArray.weekData.Valueobject[0][0])  //량
        io.emit('waterpercent', waterArray.weekData.Valueobject[1]) //일주일%
        io.emit('weekendTotalUseage', waterArray.weekData.Valueobject[1]) //일주일 총%
        io.emit('yearTotalUseage', waterArray.yearData.Valueobject[0][0]) //연총량
        io.emit('MonthTotalUseage', waterArray.weekData.Valueobject[1]) //연총%
        io.emit('yearWater', waterArray.weekData.Valueobject[Days.Month])
        res.render('dummy', { layout: null })
    }catch(err){
        console.log(err)
    }
})
/**
 * 
 */
//핸드드라이어에서 남은 휴지출지량 값을 받는 함수
app.get('/test_remain', function (req, res) {
    try{
        let number = req.query.number
        let hand = req.query.id
        //let receivehand = parseInt(hand)
        console.log(moment().format('MMDD:hh:mm') + hand)
        console.log(number)
        io.emit('remain', [number, hand])
        res.render('dummy', { layout: null })
    }
    catch(err){
    }
})


app.get('/wateruseage', function (req, res) {
    res.render('wateruseagecopy', {
        selectcityname: placeInfo.selectcityname, selectvillagename: placeInfo.selectvillagename,
        weekData: waterArray.weekData, yearData: waterArray.yearData
    })
})

app.get('/wateruseagea', function (req, res) {
    try{
        res.render('wateruseage', {
            selectcityname: placeInfo.selectcityname, selectvillagename: placeInfo.selectvillagename,
            weekData: waterArray.weekData, yearData: waterArray.yearData
        })
    }catch(err){
        console.log
    }
})

// custom 404 page
app.use((req, res) => {
    res.type('text/plain')
    res.status(404)
    res.send('404 - Not Found')
})

// custom 500 page
app.use((req, res) => {
    res.type('text/plain')
    res.status(500)
    res.send('500 - Server Error')
})

process.on('SIGINT', async () => {
    console.log('서버 종료.');
    await Water.save(7, waterArray.weekData.Valueobject[0][0], waterArray.weekData.getDate[0])
    // 프로세스 종료
    process.exit();
});
https.createServer(options, app).listen(httpsPort, () => {
    console.log(`Express started on https://localhost:${httpsPort}; press Ctrl-C to terminate.`);
});
let io = require('socket.io')(https)