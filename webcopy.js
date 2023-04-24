const express = require('express')
    , path = require('path')
const expressHandlebars = require('express-handlebars')
const app = express()
const bodyparser = require('body-parser')
    , static = require('serve-static')
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

const { next } = require('cheerio/lib/api/traversing')

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
app.set('view engine', 'handlebars')
app.use(express.static(__dirname + '/public'))
app.set('views', __dirname + '/views')
app.use(express.static(__dirname + '/api'))
app.use('/smartmirror', static(path.join(__dirname, 'smartmirror')));
let router = express.Router()
app.use('/', router)
const mongo = require('./mongo/mongo')
const Days = require('./script/getDays')
const mirrorsave = require('./mongo/mirrorsave')

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
router.route('/processvideo').post(upload.array('photo', 1), function (req, res) {
    let savefunction = mirrorsave.savefile(req.file, "video", "None", 0).then(function (returnvalue) {
        switch (returnvalue) {
            case 1: res.redirect('mediacontents')
                break
            case 2: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
                break
            case 3: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
                break
        }
    })
});

//예약 비디오 파일 저장
router.route('/processbookingvideo').post(upload.array('photo', 1), function (req, res) {
    try {
        let savefunction = mirrorsave.savefile(req.file, "video", "reservation", 0, req.body.chooseimageday).then(function (returnvalue) {
            switch (returnvalue) {
                case 1: res.redirect('bookmedia')
                    break
                case 2: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='bookmedia';</script>");
                    break
                case 3: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='bookmedia';</script>");
                    break
            }
        })
    }
    catch (err) {
        console.log(err)
    }
});

//기본 이미지 파일 저장
router.route('/processimage').post(uploadimg.array('photo', 1), function (req, res) {
    try {
        let savefunction = mirrorsave.savefile(req.file, "image", "None", 0).then(function (returnvalue) {
            switch (returnvalue) {
                case 1: res.redirect('mediacontents')
                    break
                case 2: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
                    break
                case 3: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
                    break
            }
        })
    } catch (err) {
        console.dir(err.stack);
    }
});

//예약 이미지 파일 저장
router.route('/processbookingimage').post(uploadimg.array('photo', 1), function (req, res) {
    try {
        let savefunction = mirrorsave.savefile(req.file, "image", "reservation", 0).then(function (returnvalue) {
            switch (returnvalue) {
                case 1: res.redirect('mediacontents')
                    break
                case 2: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
                    break
                case 3: res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
                    break
            }
        })
    } catch (err) {
        console.dir(err.stack);
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
            mirrorsave.version++
        }
        else {
            console.log("Smartmirror.exe 구동파일이 아닙니다.")
            res.send("<script>alert('Smartmirror.exe 구동파일이 아닙니다.');location.href='smartmirrormanage';</script>");
        }
    } catch (err) {
        console.dir(err.stack);
    }
});

//매일 오전0시에 예약한 날짜가 되면 스마트미러에 예약한 이미지포스터로 교체, 새로운 일일 수전사용량 데이터생성
let changefilename
let j = schedule.scheduleJob("0 0 0 * * *", function () {
    let imagestate = false
    let videostate = false
    //새로운 데이터를 생성합니다.
    water.addDb(7)

    //오늘 예약되어 있는 파일이 있는지 확인하기전 스마트미러 미디어 데이터베이스들을 다 삭제합니다.
    //데이터베이스에는 이름만 저장되어있고 파일은 Smartmirror/ 폴더안에 모두 저장되어 있습니다.
    mongo.Smartmirrorimagefile.deleteMany(function (err, data) {
        //기존에 있던 smartmirror 데이터베이스를 모두 삭제
        if (err) console.log(err)
        console.log("스마트미러 이미지 데이터베이스 삭제")
    })

    mongo.Smartmirrorvideofile.deleteMany(function (err, data) {
        //기존에 있던 smartmirror 데이터베이스를 모두 삭제
        if (err) console.log(err)
        console.log("스마트미러 비디오 데이터베이스 삭제")
    })

    mirrorsave.ChangeFile("Imgfile")
    mirrorsave.ChangeFile("Videofilesave")
    mirrorsave.version++
});
let url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
let queryParams = '?' + encodeURIComponent('ServiceKey') + '=VHqmEJqAw45745GV0%2BkA3l6TePYLRpgPhuEYJMsNv69w%2F6NaV98Z6fOUZruSuV7xvSyOfSDEa941PCus5fUjzg%3D%3D'; /* Service Key*/
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1') /* */
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('20') /* */
queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('XML') /* */

let k = schedule.scheduleJob("*/20 * * * * *", function () {
    moment.tz.setDefault("Asia/Seoul")
    let nowhourtime = Days.Hour+"00"

    if (Days.min < 30) {
        nowhourtime = nowhourtime - 100
    }
   if (nowhourtime < 1000) {
        nowhourtime = "0" + nowhourtime
    }
    const hourtime = nowhourtime.toString()
    let locationdata

    mongo.Weather.find({}, imgProjection, function (err, data) {
        locationdata = data[0].name
        for (let index = 2; index < 3775; index++) {
            if (locationdata == firstSheet["B" + index].v) {
                currentlocationX = firstSheet["F" + index].v
                currentlocationY = firstSheet["G" + index].v
            }
        }
    })

    queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(Days.date) /* */
    queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(hourtime); /* */
    queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(currentlocationX) /* */
    queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(currentlocationY) /* */

    request({ url: url + queryParams, method: 'GET' }, function (error, response, body) {
        if (weatherdata != "") {
            weatherdata = new Array()
            weathername = new Array()
        }
        $ = cheerio.load(body);
        $('item').each(function (idx) {
            const time = $(this).find('baseTime').text();
            const weather = $(this).find('category').text()
            const wea_val = $(this).find('obsrValue').text()
            if (weather == 'PTY' || weather == 'T1H') {
                weathername.push(weather)
                weatherdata.push(wea_val)
            }
        });
    })
    /*
    없음(0), 비(1), 비/눈(2), 눈(3), 소나기(4), 빗방울(5), 빗방울/눈날림(6), 눈날림(7)
    */
    let currentimg
    switch (weatherdata[0]) {
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
    io.emit("currentimage", currentimg)
    io.emit("currentT1H", weatherdata[1])
})

let Y = schedule.scheduleJob("0 0 0 0 1 *", function () {
    water.addDb(12)
})

app.get('/dkatk', function (req, res) {
                res.render('dkatk', { layout: null})
})

let weathername = new Array()
let weatherdata = new Array()
let currentlocationX
let currentlocationY
let locationdata
//서버가 켜질때 x,y의 값을 불러와야 하므로 만든 코드입니다.
/*
Weather.find({}, imgProjection, function (err, data) {
        locationdata = data[0].name

    for (let index = 2; index < 3775; index++) {
        if (locationdata == firstSheet["B" + index].v) {
            currentlocationX = firstSheet["F" + index].v
            currentlocationY = firstSheet["G" + index].v
        }
    }
})
*/
const excelFile = xlsx.readFile("api/기상청41_단기예보 조회서비스_오픈API활용가이드_격자_위경도(20210401).xlsx")
const firstSheet = excelFile.Sheets[excelFile.SheetNames[0]]

let localselect
let cityselect
let villageselect
let cityname = new Array()
let villagename = new Array()
let codename = new Array()

//구역 선택 post
app.post('/weatherlista', function (req, res) {
    const name = req.body.name
    const city = req.body.city
    localselect = name
    cityselect = city
    cityname = new Array()
    for (let index = 2; index <= 3775; index++) {
        if (localselect != firstSheet["C" + index].v) continue
        let data = firstSheet["D" + index].v
        if (data == "") continue;
        let state = true;
        for (let i = 0; i < cityname.length; i++) {
            if (cityname[i] == data) {
                state = false;
                break
            }
        }
        if (state) cityname.push(data)
    }
    villagename = new Array()
    for (let index = 2; index <= 3775; index++) {
        if (localselect == firstSheet["C" + index].v && cityselect == firstSheet["D" + index].v) {
            let data = firstSheet["E" + index].v
            if (data != "") villagename.push(data)
        }
    }
    res.redirect('main')
})
let selectcityname
let selectvillagename

//최종 구역 선택
app.post('/weather', function (req, res) {
    const name = req.body.name
    const city = req.body.city
    const village = req.body.village
    localselect = name
    cityselect = city
    villageselect = village

    for (let index = 2; index <= 3775; index++) {
        if (localselect == firstSheet["C" + index].v && cityselect == firstSheet["D" + index].v && villageselect == firstSheet["E" + index].v) {
            let data = firstSheet["B" + index].v
            selectcityname = firstSheet["D" + index].v
            selectvillagename = firstSheet["E" + index].v
            currentlocationX = firstSheet["F" + index].v
            currentlocationY = firstSheet["G" + index].v
            if (data != "") {
                codename.push(data)
                locationcodename = codename[0]
                codename = new Array();
                if (data == "") {
                    data = "2824561400"
                }
                Weather.findOneAndUpdate({}, { $set: { 'name': data } }, (err, data) => {
                    if (err) console.log(err)
                    else console.log("저장완료")
                })
            }
        }
    }

    version++
    res.redirect('main')
})

let localname = new Array()
for (let index = 2; index <= 3775; index++) {
    let data = firstSheet["C" + index].v
    let state = true;
    for (let i = 0; i < localname.length; i++) {
        if (localname[i] == data) {
            state = false;
            break
        }
    }
    if (state) localname.push(data)
}

cityname = new Array()
villagename = new Array();


//관리자 로그인
app.post('/main', (req, res) => {
    User.findOne({ name: req.body.name, password: req.body.password }, (err, user) => {
        if (err) return res.status(500).send({ message: '에러!' });
        else if (user) {
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
});

app.use('/mediacontents', async function (req, res) {
    let wfunc = await mirrorsave.getFile("None")
    let vid = mirrorsave.VideoFile
    let img = mirrorsave.ImageFile
    if (req.session.logindata) {
        res.render('mediacontents', {
            videofile: vid, imgfile: img
        })
    }
    else {
        res.render('login', { layout: null })
    }
})

app.use('/bookmedia', async function (req, res) {
    let wfunc = await mirrorsave.getFile("None")
    let vid = mirrorsave.VideoFile
    let img = mirrorsave.ImageFile
    if (req.session.logindata) {
        res.render('bookmedia', {
            videofile: vid, imgfile: img
        })
    }
    else {
        res.render('login', { layout: null })
    }
})

app.get('/main', async function (req, res) {
    let cbDvalue = Math.max.apply(null, weekData.Valueobject[0])
    let cbYvalue = Math.max.apply(null, yearData.Valueobject[0])
    let wfunc = await mirrorsave.getFile("None")
    let video = mirrorsave.VideoFile
    let image = mirrorsave.ImageFile
    if (req.session.logindata) {
        res.render('sub', {
            weekData: weekData, yearData: yearData, videofile: video, imgfile: image,
            localname: localname, cityname: cityname, village: villagename, selectcityname: selectcityname, selectvillagename: selectvillagename,
            localselected: localselect, cityselected: cityselect
        })
    }
    else {
        res.render('login', { layout: null })
    }

})

app.get('/login', function (req, res) {
    res.render('login', { layout: null })
})

app.get('/', function (req, res) {
    res.render('login', { layout: null })
})

let testweather = ""
Weather.find({}, videoProjection, function (err, locationcode) {
    if (locationcode) {
        testweather = locationcode[0]
    }
    else {
        testweather = 1111053000
    }
    //{}""등 불필요한 문자 제거
    testweather = testweather.toString().replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\//name\ ]/g, "")

    for (let index = 2; index < 3775; index++) {
        if (testweather == firstSheet["B" + index].v) {
            selectcityname = firstSheet["D" + index].v
            selectvillagename = firstSheet["E" + index].v

        }
    }
})
app.get('/smartmirror/item', function (req, res) {
    res.render('item', { layout: null })
})

app.get('/smartmirror/image/info', function (req, res) {
    Smartmirrorimagefile.find({}, videoProjection, function (err, data) {
        if (err) return next(err)
        res.json(data)
    })

})

app.get('/smartmirror/video/info', function (req, res) {
    Smartmirrorvideofile.find({}, videoProjection, function (err, data) {
        if (err) return next(err)
        res.json(data)
    })

})

app.get('/smartmirror/item/info', function (req, res) {
    SmartmirrorExe.find({}, imgProjection, function (err, data) {
        if (err) return next(err)
        res.json(data)
    })
})

app.get('/smartmirror/weather', function (req, res) {
    Weather.find({}, imgProjection, function (err, weather) {
        res.render('weather', { contents: weather[0].name, layout: null })
    })
});

app.get('/smartmirror/model', function (req, res) {
    smartmirrormodel = req.query.id
    SmartModel.find(function (err, model) {
        res.render('dummy', { contents: model, layout: null })
    })
})

// 스마트미러의 현재 실행하고 있는 비디오파일와 이미지파일 출력
let refVideoArray = new Array()
let refImageArray = new Array()
app.get('/smartmirror/getcontents', function (req, res) {
    let model = req.query.model //스마트미러 모델명
    let contents = req.query.contents //스마트미러가 보여주는 미디어들
    let kinds = req.query.kinds //스마트미러가 보여주는 미디어들의 종류들 (이미지,비디오)

    let data = new Array()
    if (model != "") data.push(model) //model이 비어있지 않는다면 data변수에 저장
    if (contents != "") data.push(contents) //contents가 비어있지 않는다면 data변수에 저장

    let state = true;
    if (kinds == 0) // 비디오 데이터
    {
        for (let i = 0; i < refVideoArray.length; i++) {
            if (refVideoArray[i][0] == model) // 중복된 모델의 경우 덮어쓰기
            {
                data.push(new Date())
                refVideoArray[i] = data //data배열의 첫번째 데이터는 스마트미러 모델명이다.
                state = false
                break
            }
        }
        if (state) { //중복된 모델의 경우가 아닐경우
            data.push(new Date())
            refVideoArray.push(data)
        }
    }
    else // 이미지 데이터
    {
        for (let i = 0; i < refImageArray.length; i++) {
            if (refImageArray[i][0] == model) // 중복된 모델의 경우 덮어쓰기
            {
                data.push(new Date())
                refImageArray[i] = data //data배열의 첫번째 데이터는 스마트미러 모델명이다.
                state = false
                break
            }
        }
        if (state) { //중복된 모델이 아닐 경우
            data.push(new Date())
            refImageArray.push(data)
        }
    }


    res.render('dummy', { layout: null })
})

/*
매니저 페이지 : 최근 5분 내 재생중인 홍보물을 확인하는 페이지
*/
let numbervideo = 0
let numberimage = 0
let ComboVideo = new Array()

//스마트미러 관리 페이지
app.get('/smartmirrormanage', function (req, res) {
    const nowtime = new Date()
    for (let i = 0; i < refVideoArray.length; i++) {
        //현재시간에서 스마트미러의 비디오가 저장된 시간을 빼는 계산을 하여
        //현재 비디오가 몇분째 보여주고 있는지 계산한다.
        const elapsedMSec = nowtime - refVideoArray[i][2]
        const elapsedMin = elapsedMSec / 1000 / 60
        //만약 5분이상 보여주고 있다면 삭제를 하여 다음 비디오를 재생한다.
        if (elapsedMin > 5) refVideoArray.pop(i)
    }
    for (let i = 0; i < refImageArray.length; i++) {
        const elapsedMSec = nowtime - refImageArray[i][2]
        const elapsedMin = elapsedMSec / 1000 / 60
        if (elapsedMin > 5) refImageArray.pop(i)
    }
    // Combobox에 표시할 데이터
    // Combobox에 현재 실행되고 있는 스마트미러 모델명들을 보여준다.
    ComboVideo = new Array();
    for (let i = 0; i < refVideoArray.length; i++) {
        // if(refVideoArray[i][0] == 지정모델명)
        // 지정 모델명의 대체 이름 대입
        // 그 외의 경우 대입
        ComboVideo.push(refVideoArray[i][0])
    }
    res.render('smartmirrormanage', { videodata: refVideoArray, imgdata: refImageArray, combovideo: ComboVideo })
})

app.post('/smartmirrormanage', function (req, res) {
    const selectsmartmirror = req.body.name
    const selectimage = req.body.selectimage
    for (let i = 0; i < refVideoArray.length; i++) {
        if (refVideoArray[i][0] == selectsmartmirror) {
            numbervideo = refVideoArray[i][1]
            break
        }
    }

    for (let i = 0; i < refImageArray.length; i++) {
        if (refImageArray[i][0] == selectimage) {
            numberimage = refImageArray[i][1]
            break
        }
    }

    Videofilesave.find(function (err, users) {
        Imgfile.find(function (err, imgfile) {
            res.render('smartmirrormanage', { videodata: refVideoArray, imgdata: refImageArray, selectsmartmirror: selectsmartmirror, combovideo: ComboVideo, num: users[numbervideo].name, imgfile: imgfile[numberimage].name, selectimage: selectimage })
        }).sort({ name: 1 })
    }).sort({ name: 1 })
})

let version = 0
app.get('/smartmirror/version', function (req, res) {
    res.render('dummy', { layout: null, contents: version })
})

app.get('/dummy', function (req, res) {
        res.render('dummy', { data: data })
})

app.get('/testwater_recieve', function (req, res) {
    let watervalue = parseFloat(((req.query.id) / 1000).toFixed(3))

    weekData.Valueobject[0][6] = (parseFloat(weekData.Valueobject[0][6]) + watervalue).toFixed(3)
    water.getPercent(weekData)
    yearData.Valueobject[0][6] = (parseFloat(yearData.Valueobject[0][6]) + watervalue).toFixed(3)
    water.getPercent(yearData)
    io.emit('weekendwater', weekData.Valueobject[0][6])  //량
    io.emit('waterpercent', weekData.Percent) //일주일%
    io.emit('weekendTotalUseage', weekData.Valueobject[0]) //일주일 총%
    io.emit('yearTotalUseage', weekData.Valueobject[0]) //연총량
    io.emit('wateryearpercent', weekData.Percent) //연총%
    io.emit('yearWater', weekData.Valueobject[Days.month])
    res.render('dkatk', { layout: null })
})



app.get('/wateruseage', function (req, res) {
    res.render('wateruseage', {
        selectcityname: selectcityname, selectvillagename: selectvillagename,
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