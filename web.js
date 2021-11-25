
const express = require('express')
    , path = require('path')
const expressHandlebars = require('express-handlebars')
const app = express()
const bodyparser = require('body-parser')
    , static = require('serve-static')
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({
    extended: true
}))
require('moment-timezone');
const cheerio = require('cheerio');
const moment = require('moment');
const request = require('request');
const schedule = require('node-schedule')
var multer = require('multer');
const fs = require('fs');
const xlsx = require("xlsx")
var server = require('http').createServer(app);
var io = require('socket.io')(server)
const cors = require('cors')
const session = require('express-session')
const cookieParser = require('cookie-parser')
app.use(cors({
    origin: true,
    credentials: true
}))
var expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 hour
app.use(cookieParser())
app.use(
    session({
        key: "logindata",
        secret: "secretuser",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: expiryDate
        },
    })
)
process.setMaxListeners(15);
var Graphql = require('graphql')
const jwt = require('jsonwebtoken')
var GraphqlHttp = require('express-graphql').graphqlHTTP
//데이터베이스 초기설정
const mongoose = require('mongoose')
const { WSATYPE_NOT_FOUND } = require('constants')
const { response } = require('express')
const { next } = require('cheerio/lib/api/traversing')
//const { arrayParentSymbol } = require('mongose/lib/helpers/symbools')
mongoose.connect('mongodb+srv://upwoong:ehdrhd12@cluster0.ahlcp.mongodb.net/test', { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useCreateIndex', true)
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
    console.log("mongo db connection OK.");
})


//스키마생성
const adminuser = mongoose.Schema({
    name: String,
    password: String,
})
const usingwater = new mongoose.Schema({
    Useage: String,
    Year: String,
    Month: String,
    Day: String,
    Persent: String
})
const clients = new mongoose.Schema({
    name: String,
    Sex: String,
    password: String,
    username: String
})
const videofilesave = new mongoose.Schema({
    name: String,
    Date: String,
    type: String
})
const imgfile = new mongoose.Schema({
    name: String,
    Date: String,
    type: String
})
const smartmirrorimagefile = new mongoose.Schema({
    name: String,
    type: String,
    Date: String
})
const smartmirrorvideofile = new mongoose.Schema({
    name: String,
    type: String,
    Date: String
})
const weather = new mongoose.Schema({
    name: String
})
const smartmodel = new mongoose.Schema({
    name: String
})
const monthuseage = new mongoose.Schema({
    Data: String,
    Year: String,
    Month: String
})
const smartmirrorexe = new mongoose.Schema({
    name: String
})

const User = mongoose.model('users', adminuser)
const Water = mongoose.model('water', usingwater)
const Client = mongoose.model('client', clients)
const Videofilesave = mongoose.model('videofile', videofilesave)
const Imgfile = mongoose.model('imgfile', imgfile)
const Weather = mongoose.model('weather', weather)
const SmartModel = mongoose.model('smartmodel', smartmodel)
const Smartmirrorimagefile = mongoose.model('smartmirrorimagefile', smartmirrorimagefile)
const Smartmirrorvideofile = mongoose.model('smartmirrorvideofile', smartmirrorvideofile)
const MonthUseage = mongoose.model('monthuseage', monthuseage)
const SmartmirrorExe = mongoose.model('smartmirrorexe', smartmirrorexe)


var videoProjection = {
    __v: false,
    _id: false,
    locations: false
};

var imgProjection = {
    __v: false,
    _id: false,
};
app.use('/smartmirror', static(path.join(__dirname, 'smartmirror')));

let arraywater = []
const endpoint = 'http://localhost:8080/graphql/waterinput'
const schema = Graphql.buildSchema(`
type usingwater{
name : String,
password : String,
username : String,
sex : String
}
type Person {
_id : ID
name : String
username : String
Sex : String
}
input inputusingwater {
name : String,
password : String,
username : String,
sex : String
}
type Query {
getusingwater(name : String, password : String, username : String, sex : String) : usingwater
people(name : String) : [Person]
}

type Mutation {
addusingwater(name : String, password : String, username : String, Sex : String) : usingwater
createuser(input : inputusingwater) : usingwater
}


`)
/*
let selectdata
User.find(function(err,data){
let currentdata = {data}
selectdata = currentdata.data[0].name
console.log(currentdata.data[0].name)
})
return await selectdata
*/
const root = {
    //홈페이지에서 값을 입력하면 이곳에서 데이터 저장
    //http://localhost:8080/graphql?query={getusingwater(name:"이곳에 입력", username:"이곳에 입력", password:"이곳에 입력", sex : "이곳에 입력"){name}}
    async getusingwater(input) {
        const token = jwt.sign({
            name: input.name
        }, "secretKey", {
            expiresIn: '1m',
            issuer: 'tokenuser',
        })
        console.log(token)
        return input
    },

    async people(input) {
        let dataArray = new Array()
        const people = await Client.find(function (err, data) {
            for (let index = 0; index < data.length; index++) {
                if (data[index].name == input.name) {
                    dataArray.push(data[index])
                }
            }
        });
        return dataArray;
    },
    //graphql 페이지에서 값을 입력하면 페이지 저장
    addusingwater: (input) => {
        console.log(input)
        const saveusingwater = new Client({ 'name': input.name, 'password': input.password, 'username': input.username, 'Sex': input.sex })
        saveusingwater.save(function (err, slience) {
            if (err) {
                console.log(err)
                res.send('update error,adawaaaa')
                return
            }
        })
        return response.redirect('main')
    },
    async createwater({ input }) {
        console.log(arraywater)
        return arraywater.push(input.name)
    }
}

app.use('/graphql', GraphqlHttp({
    schema: schema,
    rootValue: root,
    graphiql: true,
}))

// 라우터 사용하여 라우팅 함수 등록
var router = express.Router()

var storagevideo = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, '/home/hosting_users/creativethon/apps/creativethon_wmsadmina/smartmirror/video')
    },
    filename: function (req, file, callback) {
        var extension = path.extname(file.originalname);
        var basename = path.basename(file.originalname, extension);
        basename = basename.replace(/(\s*)/g, "")
        callback(null, basename + extension);
    }
});


var upload = multer({
    storage: storagevideo, // storage 객체
    limits: {
        files: 10, // 한번에 업로드할 수 있는 파일 개수
        fileSize: 1024 * 1024 * 1024
    }
});
//기본 비디오 파일 저장
router.route('/processvideo').post(upload.array('photo', 1), function (req, res) {
    try {
        var files = req.files;

        version++

        if (files.length > 0) {
            console.dir(files[0]);

            // 현재의 파일 정보를 저장할 변수 선언
            var originalname = '',
                filename = '',
                mimetype = '',
                size = 0;

            if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)

                for (var i = 0; i < files.length; i++) {
                    originalname = files[i].originalname;
                    filename = files[i].filename;
                    mimetype = files[i].mimetype;
                    size = files[i].size;
                }
            }

            //만약 현재 보여주는 미디어들의 type 이 None일 경우 smartmirrorvideofile 데이터베이스가 비어있을 경우
            //Smartmirrorvideofile 데이터베이스에도 추가하여 바로 반영되도록 추가
            Smartmirrorvideofile.find(function (err, data) {
                if (data == "" || data[0].type == "None") {
                    const videofile = new Smartmirrorvideofile({ 'name': filename, 'Date': new Date(), 'type': "None" })
                    videofile.save(function (err, slience) {
                        if (err) {
                            console.log(err)
                            res.send('update error')
                            return
                        }
                        return
                    })
                }
            })

            const videofile = new Videofilesave({ 'name': filename, 'Date': new Date(), 'type': "None" })
            videofile.save(function (err, slience) {
                if (err) {
                    console.log(err)
                    res.send('update error')
                    return
                }
                return
            })
            res.redirect('mediacontents')
        } else {
            console.log('파일이 없습니다');
        }
    } catch (err) {
        console.dir(err.stack);
    }
});

router.route('/processbookingvideo').post(upload.array('photo', 1), function (req, res) {
    try {
        var files = req.files;
        var selectday = req.body.chooseimageday
        const strArr = selectday.split('-')
        const month = strArr[1]
        const day = strArr[2]
        const currentday = strArr[1] + strArr[2]
        console.log("month :" + month + "day :" + day)
        version++

        if (files.length > 0) {
            console.dir(files[0]);

            // 현재의 파일 정보를 저장할 변수 선언
            var originalname = '',
                filename = '',
                mimetype = '',
                size = 0;

            if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)

                for (var i = 0; i < files.length; i++) {
                    originalname = files[i].originalname;
                    filename = files[i].filename;
                    mimetype = files[i].mimetype;
                    size = files[i].size;
                }
            }

            //만약 현재 보여주는 미디어들의 type 이 reservation이고 날짜가 현재 날짜와 같다면 smartmirrorvideofile 데이터베이스에도 추가
            Smartmirrorvideofile.find(function (err, data) {
                if (data[0].type == "reservation" && data[0].Date == currentday) {
                    const videofile = new Smartmirrorvideofile({ 'name': filename, 'Date': currentday, 'type': "reservation" })
                    videofile.save(function (err, slience) {
                        if (err) {
                            console.log(err)
                            res.send('update error,aaaaa')
                            return
                        }
                        return
                    })
                }
            })

            const videofile = new Videofilesave({ 'name': filename, 'Date': currentday, 'type': "reservation" })
            videofile.save(function (err, slience) {
                if (err) {
                    console.log(err)
                    res.send('update error')
                    return
                }
                return
            })
            res.redirect('bookmedia')
        } else {
            console.log('파일이 없습니다');
        }
    } catch (err) {
        console.dir(err.stack);
    }
});

//이미지파일

var storageimg = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, '/home/hosting_users/creativethon/apps/creativethon_wmsadmina/smartmirror/image')
    },
    filename: function (req, file, callback) {
        var extension = path.extname(file.originalname);
        var basename = path.basename(file.originalname, extension);
        basename = basename.replace(/(\s*)/g, "")
        callback(null, basename + extension);
    }
});

var uploadimg = multer({
    storage: storageimg, // storage 객체
    limits: {
        files: 10, // 한번에 업로드할 수 있는 파일 개수
        fileSize: 1024 * 1024 * 1024
    }
});

//기본 이미지 파일 저장
router.route('/processimage').post(uploadimg.array('photo', 1), function (req, res) {
    try {
        var files = req.files;

        version++

        if (files.length > 0) {
            console.dir(files[0]);

            // 현재의 파일 정보를 저장할 변수 선언
            var originalname = '',
                filename = '',
                mimetype = '',
                size = 0;

            if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)


                for (var i = 0; i < files.length; i++) {
                    originalname = files[i].originalname;
                    filename = files[i].filename;
                    mimetype = files[i].mimetype;
                    size = files[i].size;
                }
            }


            // 클라이언트에 응답 전송

            //만약 현재 보여주는 미디어들의 type 이 None일 경우 또는 smartmirrorimagefile 데이터베이스가 비어있을경우
            //Smartmirror 데이터베이스에도 추가하여 바로 반영되도록 추가
            Smartmirrorimagefile.find(function (err, data) {
                if (data == "" || data[0].type == "None") {
                    const imgfile = new Smartmirrorimagefile({ 'name': filename, 'Date': new Date(), 'type': "None" })
                    imgfile.save(function (err, slience) {
                        if (err) {
                            console.log(err)
                            res.send('update error,aaaaa')
                            return
                        }
                        return
                    })
                }
            })

            const imgfile = new Imgfile({ 'name': filename, 'Date': new Date(), 'type': "None" })
            imgfile.save(function (err, slience) {
                if (err) {
                    console.log(err)
                    res.send('update error,aaaaa')
                    return
                }
                return
            })
            // 삭제 예정 2021-11-11 Imgfile.find({}, null, { sort: '-name' }, function (err, docs) { })
            res.redirect('mediacontents')
        } else {
            console.log('파일이 없습니다');
        }
    } catch (err) {
        console.dir(err.stack);
    }
});

//예약 이미지 파일 저장
router.route('/processbookingimage').post(uploadimg.array('photo', 1), function (req, res) {
    try {
        var files = req.files;
        var selectday = req.body.chooseimageday
        const strArr = selectday.split('-');
        const month = strArr[1]
        const day = strArr[2]
        const currentday = strArr[1] + strArr[2]
        console.log("month :" + month + "day :" + day)
        version++

        if (files.length > 0) {
            console.dir(files[0]);

            // 현재의 파일 정보를 저장할 변수 선언
            var originalname = '',
                filename = '',
                mimetype = '',
                size = 0;

            if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)


                for (var i = 0; i < files.length; i++) {
                    originalname = files[i].originalname;
                    filename = files[i].filename;
                    mimetype = files[i].mimetype;
                    size = files[i].size;
                }
            }


            // 클라이언트에 응답 전송
            //만약 현재 보여주는 미디어들의 type 이 reservation이고 날짜가 현재 날짜와 같다면 smartmirrorimagefile 데이터베이스에도 추가
            Smartmirrorimagefile.find(function (err, data) {
                if (data[0].type == "reservation" && data[0].Date == currentday) {
                    const imgfile = new Smartmirrorimagefile({ 'name': filename, 'Date': currentday, 'type': "reservation" })
                    imgfile.save(function (err, slience) {
                        if (err) {
                            console.log(err)
                            res.send('update error,aaaaa')
                            return
                        }
                        return
                    })
                }
            })

            const imgfile = new Imgfile({ 'name': filename, 'Date': currentday, 'type': "reservation" })
            imgfile.save(function (err, slience) {
                if (err) {
                    console.log(err)
                    res.send('update error')
                    return
                }
                return
            })
            Imgfile.find({}, null, { sort: '-name' }, function (err, docs) { })
            res.redirect('bookmedia')
        } else {
            console.log('파일이 없습니다');
        }
    } catch (err) {
        console.dir(err.stack);
    }
});


var storageSmartmirror = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, '/home/hosting_users/creativethon/apps/creativethon_wmsadmina/smartmirror/item')
    },
    filename: function (req, file, callback) {
        var extension = path.extname(file.originalname);
        var basename = path.basename(file.originalname, extension);
        basename = basename.replace(/(\s*)/g, "")
        callback(null, basename + extension);
    }
});


var uploadSmartmirror = multer({
    storage: storageSmartmirror, // storage 객체
    limits: {
        files: 10, // 한번에 업로드할 수 있는 파일 개수
        fileSize: 1024 * 1024 * 1024
    }
});
//기본 비디오 파일 저장
router.route('/processSmartmirror').post(uploadSmartmirror.array('photo', 1), function (req, res) {
    fs.unlink(`/home/hosting_users/creativethon/apps/creativethon_wmsadmina/smartmirror/item/Smartmirror.exe`, function (err) {
        if (err) console.log(err)
    })
    try {
        var files = req.files;

        version++

        if (files.length > 0) {
            console.dir(files[0]);

            // 현재의 파일 정보를 저장할 변수 선언
            var originalname = '',
                filename = '',
                mimetype = '',
                size = 0;

            if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)

                for (var i = 0; i < files.length; i++) {
                    originalname = files[i].originalname;
                    filename = files[i].filename;
                    mimetype = files[i].mimetype;
                    size = files[i].size;
                }
            }
            res.redirect('mediacontents')
        } else {
            console.log('파일이 없습니다');
        }
    } catch (err) {
        console.dir(err.stack);
    }
});




//매일 오전6시에 예약한 날짜가 되면 스마트미러에 예약한 이미지포스터로 교체, 수전사용량 어제자 교체
let changefilename
var j = schedule.scheduleJob("0 0 6 * * *", function () {
    let imagestate = false
    let videostate = false
    const year = moment().format('YY')
    const month = moment().format('MM')
    const day = moment().format('DD')
    const date = moment().format('MMDD')
    const Hour = moment().format('HH:mm:ss')
    const yesterdaydate = date - 100

    const newDaywateruseage = new Water({ 'Year': year, 'Month': month, 'Day': day, 'Percent': "", 'Useage': "" })
    newDaywateruseage.save(function (err, slience) {
        if (err) {
            console.log(err)
            res.status(500).send('update error')
            return
        }
        return console.log("새로운 수전사용 데이터 생성")
    })
    Smartmirrorimagefile.deleteMany(function (err, data) {
        //기존에 있던 smartmirror 데이터베이스를 모두 삭제
        if (err) console.log(err)
        console.log("스마트미러 이미지 데이터베이스 삭제")
    })

    Smartmirrorvideofile.deleteMany(function (err, data) {
        //기존에 있던 smartmirror 데이터베이스를 모두 삭제
        if (err) console.log(err)
        console.log("스마트미러 비디오 데이터베이스 삭제")
    })

    Imgfile.find(function (err, data) {
        //이미지의 예약날짜가 오늘이고 type이 reservation이면 스마트미러 이미지 데이터베이스에 추가
        for (let i = 0; i < data.length; i++) {
            if (data[i].Date == date && data[i].type == "reservation") {
                changefilename = data[i].name
                const changefile = new Smartmirrorimagefile({ 'name': changefilename, 'Date': date, 'type': "reservation" })
                changefile.save(function (err, slience) {
                    if (err) {
                        console.log(err)
                        res.status(500).send('update error')
                        return
                    }
                    return console.log("예약 이미지 파일 업데이트 완료")
                })
                imagestate = true
            }
        }
        if (!imagestate) //만약 smartmirror 데이터베이스안에 어떠한 파일도 못넣었을 경우 type이 None인 파일들을 추가
        {
            for (let i = 0; i < data.length; i++) {
                if (data[i].type == "None") {
                    changefilename = data[i].name
                    const changefile = new Smartmirrorimagefile({ 'name': changefilename, 'type': "None" })
                    changefile.save(function (err, slience) {
                        if (err) {
                            console.log(err)
                            res.status(500).send('update error')
                            return
                        }
                        return console.log("기본 이미지 파일 업데이트 완료")
                    })
                    console.log("이미지파일 저장 진행")
                }
            }
        }
    })

    Videofilesave.find(function (err, data) {
        //비디오의 예약날짜가 오늘이고 type이 reservation이면 스마트미러 비디오 데이터베이스에 추가
        for (let i = 0; i < data.length; i++) {
            if (data[i].Date == date && data[i].type == "reservation") {
                changefilename = data[i].name
                const changefile = new Smartmirrorvideofile({ 'name': changefilename, 'Date': date, 'type': "None" })
                changefile.save(function (err, slience) {
                    if (err) {
                        console.log(err)
                        res.status(500).send('update error')
                        return
                    }
                    return console.log("예약 비디오 파일 업데이트 완료")
                })
                videostate = true
            }
        }
        if (!videostate) //만약 smartmirror 데이터베이스안에 어떠한 파일도 못넣었을 경우 type이 None인 파일들을 추가
        {
            for (let i = 0; i < data.length; i++) {
                if (data[i].type == "None") {
                    changefilename = data[i].name
                    const changefile = new Smartmirrorimagefile({ 'name': changefilename, 'type': "None" })
                    changefile.save(function (err, slience) {
                        if (err) {
                            console.log(err)
                            res.status(500).send('update error')
                            return
                        }
                        return console.log("기본 비디오 파일 업데이트 완료")
                    })
                    console.log("비디오파일 저장 진행")
                }
            }
        }
    })
    console.log("날짜 : " + date + "시간 : " + Hour)
    version++
});


//10초 간격으로 함수 실행
var k = schedule.scheduleJob("*/10 * * * * *", function () {
    moment.tz.setDefault("Asia/Seoul")
    const date = moment().format('YYYYMMDD')
    var nowhourtime = moment().format('HH' + "00")
    if (moment().format('mm') < 30) {
        nowhourtime = nowhourtime - 100
    }
    if (nowhourtime < 1000) {
        nowhourtime = "0" + nowhourtime
    }
    const hourtime = nowhourtime.toString()
    let locationdata

    Weather.find({}, imgProjection, function (err, data) {
        locationdata = data[0].name
        for (let index = 2; index < 3775; index++) {
            if (locationdata == firstSheet["B" + index].v) {
                currentlocationX = firstSheet["F" + index].v
                currentlocationY = firstSheet["G" + index].v
            }
        }
    })
    var url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
    var queryParams = '?' + encodeURIComponent('ServiceKey') + '=VHqmEJqAw45745GV0%2BkA3l6TePYLRpgPhuEYJMsNv69w%2F6NaV98Z6fOUZruSuV7xvSyOfSDEa941PCus5fUjzg%3D%3D'; /* Service Key*/
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1') /* */
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('20') /* */
    queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('XML') /* */
    queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(date) /* */
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
            // 출력
            if (weather == 'PTY' || weather == 'T1H') {
                weathername.push(weather)
                weatherdata.push(wea_val)
            }
        });
    });
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

//매달 1일에 함수 실행
//1년치 데이터를 달마다 보여주기 위하여 실행
var m = schedule.scheduleJob("0 0 0 1 * *", function () {
    const todayYear = moment().format('YY')
    const todayMonth = moment().format('MM')
    let finallyuseage = 0
    Water.find({ 'Month': todayMonth }, function (err, data) {
        for (let index = 0; index < data.length; index++) {
            finallyuseage += data[index].Useage
        }
    })
    const monthdata = new MonthUseage({ 'Data': finallyuseage, 'Year': todayYear, 'Month': todayMonth })
    monthdata.save(function (err, slience) {
        if (err) {
            console.log(err)
            res.status(500).send('update error')
            return
        }
        return console.log("한달 단위 수전사용량 업데이트 완료")
    })
})

app.get('/dkatk', function (req, res) {
        MonthUseage.find(function (err, yeardata) {
            const currentYear = moment().format('YY')
            const currentMonth = moment().format('MM')
            for (let index = 0; index < yeardata.length; index++) {
                if (yeardata[index].Month == currentMonth && yeardata[index].Year == currentYear) {
                    yeardata[index].Persent = Math.floor(percent(yeardata[index].Useage, maxValue))
                }
            }
            res.render('wateruseage', { data: data, yeardata: yeardata, selectcityname: selectcityname, selectvillagename: selectvillagename })
        })
    console.log(percentArray)
})
//fs.unlink(`smartmirror/image/${name}`, function () { })
app.use('/', router)


//기상청api의 초기 x와 y값 불러오기
let weathername = new Array()
let weatherdata = new Array()
let currentlocationX
let currentlocationY
let locationdata
Weather.find({}, imgProjection, function (err, data) {
    locationdata = data[0].name
    console.log(locationdata)
    for (let index = 2; index < 3775; index++) {
        if (locationdata == firstSheet["B" + index].v) {
            currentlocationX = firstSheet["F" + index].v
            currentlocationY = firstSheet["G" + index].v
        }
    }
})

//실시간 날씨 상태와 온도 불러오기


//기상청 엑셀정보 불러오기
const excelFile = xlsx.readFile("/home/hosting_users/creativethon/apps/creativethon_wmsadmina/api/기상청41_단기예보 조회서비스_오픈API활용가이드_격자_위경도(20210401).xlsx")
const firstSheet = excelFile.Sheets[excelFile.SheetNames[0]]

var localselect
var cityselect
var villageselect
var cityname = new Array()
var villagename = new Array();
codename = new Array();

//기상청 구역코드 불러오기
/*
app.get('/weatherlista', function (req, res) {
res.render('weatherlista', { contents: localname, cityname: cityname, village: villagename, layout: null })
})
*/
//구역 선택 post
app.post('/weatherlista', function (req, res) {
    const name = req.body.name
    const city = req.body.city
    const village = req.body.village
    localselect = name
    cityselect = city
    villageselect = village
    // localselect의 값과 중복된 값을 cityname에 추가
    cityname = new Array()
    for (var index = 2; index <= 3775; index++) {
        if (localselect != firstSheet["C" + index].v) continue
        var data = firstSheet["D" + index].v
        if (data == "") continue;
        var state = true;
        // 중복검사
        for (var i = 0; i < cityname.length; i++) {
            if (cityname[i] == data) {
                state = false;
                break
            }
        }
        // 새 데이터 추가
        if (state) cityname.push(data)
    }
    villagename = new Array();
    for (var index = 2; index <= 3775; index++) {
        if (localselect == firstSheet["C" + index].v && cityselect == firstSheet["D" + index].v) {
            var data = firstSheet["E" + index].v
            if (data != "") villagename.push(data)
        }
    }
    return Water.find(function (err, water) {
        Smartmirrorvideofile.find(function (err, videofile) {
            Smartmirrorimagefile.find(function (err, imgfile) {
                res.render('sub', {
                    accessmanage: water, videofile: videofile, imgfile: imgfile, water: usewater, remainwater: remainwater,
                    contents: localname, cityname: cityname, village: villagename, localselected: localselect, cityselected: cityselect,
                    selectcityname: selectcityname, selectvillagename: selectvillagename
                })
            })
        })
    }).sort({ Date: -1 }).sort({ Hour: -1 }).limit(7)
})
let selectcityname;
let selectvillagename;

//최종 구역 선택 post
app.post('/weather', function (req, res) {
    const name = req.body.name
    const city = req.body.city
    const village = req.body.village
    localselect = name
    cityselect = city
    villageselect = village
    const deleteweather = Weather.find({ '__v': 0 })
    deleteweather.deleteOne(function (err) {
    })

    for (var index = 2; index <= 3775; index++) {
        if (localselect == firstSheet["C" + index].v && cityselect == firstSheet["D" + index].v && villageselect == firstSheet["E" + index].v) {
            var data = firstSheet["B" + index].v
            selectcityname = firstSheet["D" + index].v
            selectvillagename = firstSheet["E" + index].v
            currentlocationX = firstSheet["F" + index].v
            currentlocationY = firstSheet["G" + index].v
            if (data != "") {
                codename.push(data)
                locationcodename = codename[0]
                codename = new Array();

                const weather = new Weather({ 'name': data })
                weather.save(function (err, slience) {
                    if (err) {
                        console.log(err)
                        res.status(500).send('update error')
                        return
                    }
                    return console.log("지역 선택 업데이트 완룐")
                })
            }
        }
    }

    version++
    Water.find(function (err, water) {
        Smartmirrorvideofile.find(function (err, videofile) {
            Smartmirrorimagefile.find(function (err, imgfile) {
                res.render('sub', {
                    accessmanage: water, videofile: videofile, imgfile: imgfile, water: usewater, remainwater: remainwater,
                    contents: localname, cityname: cityname, village: villagename, localselected: localselect, cityselected: cityselect,
                    selectcityname: selectcityname, selectvillagename: selectvillagename
                })
            })
        })
    }).sort({ Date: -1 }).sort({ Hour: -1 }).limit(7)
})



var index = 2
var localname = new Array()
// localname 중복검사 및 추가
for (var index = 2; index <= 3775; index++) {
    var data = firstSheet["C" + index].v
    var state = true;
    // 중복검사
    for (var i = 0; i < localname.length; i++) {
        if (localname[i] == data) {
            state = false;
            break
        }
    }
    // 새 데이터 추가
    if (state) localname.push(data)
}
cityname = new Array()
// localselect의 값과 중복된 값을 cityname에 추가
for (var index = 2; index <= 3775; index++) {
    if (localselect != firstSheet["C" + index].v) continue
    var data = firstSheet["D" + index].v
    var state = true;
    // 중복검사
    for (var i = 0; i < cityname.length; i++) {
        if (cityname[i] == data) {
            state = false;
            break
        }
    }
    // 새 데이터 추가
    if (state) cityname.push(data)
}
villagename = new Array();
for (var index = 2; index <= 3775; index++) {
    if (localselect == firstSheet["C" + index].v && cityselect == firstSheet["D" + index].v) {
        var data = firstSheet["E" + index].v
        if (data != "") villagename.push(data)
    }
}


//회원가입
app.post('/insert', function (req, res, next) {
    const name = req.body.name
    const password = req.body.password
    const user = new User({ 'name': name, 'password': password })
    user.save(function (err, slience) {
        if (err) {
            console.log(err)
            res.status(500).send('update error')
            return
        }
        return console.log("complete")
    })
    Water.find(function (err, water) {
        Smartmirrorvideofile.find(function (err, videofile) {
            Smartmirrorimagefile.find(function (err, imgfile) {
                res.render('sub', {
                    accessmanage: water, videofile: videofile, imgfile: imgfile, water: usewater, remainwater: remainwater,
                    contents: localname, cityname: cityname, village: villagename, localselected: localselect, cityselected: cityselect,
                    selectcityname: selectcityname, selectvillagename: selectvillagename
                })
            })
        })
    }).sort({ Date: -1 }).sort({ Hour: -1 }).limit(7)
})

//로그인
app.post('/main', (req, res) => {
    User.findOne({ name: req.body.name, password: req.body.password }, (err, user) => {
        if (err) return res.status(500).send({ message: '에러!' });
        else if (user) {
            Water.find(function (err, water) {
                Smartmirrorvideofile.find(function (err, videofile) {
                    Smartmirrorimagefile.find(function (err, imgfile) {
                        req.session.logindata =
                        {
                            id: req.body.name,
                            password: req.body.password,
                            name: 'username',
                            authorized: true
                        }
                        res.render('sub', {
                            accessmanage: water, videofile: videofile, imgfile: imgfile, water: usewater, remainwater: remainwater,
                            contents: localname, cityname: cityname, village: villagename, selectcityname: selectcityname, selectvillagename: selectvillagename
                        })
                    })
                })
            }).sort({ Date: -1 }).sort({ Hour: -1 }).limit(7)
        }
        else return res.status(404).send({ message: '유저 없음!' });
    });
});

//관리자 아이디 수정 페이지
app.get('/modifyid', function (req, res) {
    res.render('modifyid', { layout: null })
})

//관리자 아이디 수정 post
app.post('/modifyid', function (req, res) {
    const name = req.body.name
    const password = req.body.password
    const repassword = req.body.repassword

    User.findOne({ name: name, password: password }, (err, users) => {
        if (users != null) {
            users.password = repassword
            console.log(users)
            users.save(function (err) {
                if (err) {
                    console.error(err);
                    res.json({ result: 0 });
                    return;
                }
            })
        }
        else {
            console.log('회원 정보가 맞지 않습니다.')
        }
    })
    res.render('sub')
})
//로그아웃
app.get('/logout', function (req, res) {
    if (req.session.logindata) {
        req.session.destroy(function (err) {
            if (err) console.log(err)
        })
    }
    res.render('login', { layout: null })
})

//수전사용량 데이터 입력
app.post('/insertwater', function (req, res, next) {
    const watername = req.body.watername
    const insertwaterday = moment().format('YYYY.MM.DD')
    const insertwaterhour = moment().format('HH : mm : ss')
    const user = new Water({ 'name': watername, 'Date': insertwaterday, 'Hour': insertwaterhour })
    user.save(function (err, slience) {
        if (err) {
            console.log(err)
            res.status(500).send('update error')
            return
        }
        Water.find(function (err, water) {
            Smartmirrorvideofile.find(function (err, videofile) {
                Smartmirrorimagefile.find(function (err, imgfile) {
                    res.render('sub', {
                        accessmanage: water, videofile: videofile, imgfile: imgfile, water: usewater, remainwater: remainwater,
                        contents: localname, cityname: cityname, village: villagename, localselected: localselect, cityselected: cityselect,
                        selectcityname: selectcityname, selectvillagename: selectvillagename
                    })
                })
            })
        }).sort({ Date: -1 }).sort({ Hour: -1 }).limit(7)

    })
})

//로그인정보 삭제
app.post('/deletedb', function (req, res, next) {
    const name = req.body.name
    const password = req.body.password
    const user = User.find({ 'name': name, 'password': password })
    user.remove(function (err) {
        if (err) {
            console.log(err)
            res.status(500).send('update error')
            return
        }
        res.status(200).send("Removed")
    })
})

let usewater
let remainwater
app.post('/usewater', function (req, res, next) {
    const water = req.body.water
    usewater = water
    remainwater = 100 - water
    Water.find(function (err, water) {
        Smartmirrorvideofile.find(function (err, videofile) {
            Smartmirrorimagefile.find(function (err, imgfile) {
                res.render('sub', {
                    accessmanage: water, videofile: videofile, imgfile: imgfile, water: usewater, remainwater: remainwater,
                    contents: localname, cityname: cityname, village: villagename, localselected: localselect, cityselected: cityselect,
                    selectcityname: selectcityname, selectvillagename: selectvillagename
                })
            })
        })
    }).sort({ Date: -1 }).sort({ Hour: -1 }).limit(7)
})

//비디오파일 삭제
app.post('/deletevideo', function (req, res, next) {
    const name = req.body.name
    const video = Videofilesave.find({ "name": name })
    version++
    fs.unlink(`smartmirror/video/${name}`, function (err) {
        if (err) console.log(err)
    })
    Smartmirrorvideofile.find(function (err, data) {
        for (let index = 0; index < data.length; index++) {
            if (data[index].name == name && data[index].type == "None") {
                const currentvideo = Smartmirrorvideofile.find({ "name": data[index].name, "type": "None" })
                currentvideo.remove(function (err) {
                    if (err) {
                        console.log(err)
                        res.status(500).send('update error')
                    }
                })
            }
        }
    })
    video.remove(function (err) {
        if (err) {
            console.log(err)
            res.status(500).send('update error')
            return
        }
    })
    res.redirect('mediacontents')
})

//이미지파일 삭제
app.post('/deleteimage', function (req, res, next) {
    const name = req.body.name
    const image = Imgfile.find({ "name": name })
    version++
    fs.unlink(`s/home/hosting_users/creativethon/apps/creativethon_wmsadmina/smartmirror/image/${name}`, function (err) {
        if (err) console.log(err)
    })
    Smartmirrorimagefile.find(function (err, data) {
        for (let index = 0; index < data.length; index++) {
            if (data[index].name == name && data[index].type == "None") {
                const currentimage = Smartmirrorimagefile.find({ "name": data[index].name, "type": "None" })
                currentimage.remove(function (err) {
                    if (err) {
                        console.log(err)
                        res.status(500).send('update error')
                    }
                })
            }
        }
    })
    image.remove(function (err) {
        if (err) {
            console.log(err)
            res.status(500).send('update error')
            return
        }
    })
    res.redirect('mediacontents')
})

//예약 비디오파일 삭제
app.post('/deletereservationvideo', function (req, res, next) {
    const name = req.body.name
    const video = Videofilesave.find({ "name": name })
    version++
    fs.unlink(`/home/hosting_users/creativethon/apps/creativethon_wmsadmina/smartmirror/video/${name}`, function (err) {
        if (err) console.log(err)
    })
    Smartmirrorvideofile.find(function (err, data) {
        for (let index = 0; index < data.length; index++) {
            if (data[index].name == name && data[index].type == "reservation") {
                const currentvideo = Smartmirrorvideofile.find({ "name": data[index].name, "type": "reservation" })
                currentvideo.remove(function (err) {
                    if (err) {
                        console.log(err)
                        res.status(500).send('update error')
                    }
                })
            }
        }
    })
    video.remove(function (err) {
        if (err) {
            console.log(err)
            res.status(500).send('update error')
            return
        }
        res.status(200).send("Removed")
    })
    res.redirect('bookmedia')
})
    /
    //예약 이미지파일 삭제

    app.post('/deletereservationimage', function (req, res, next) {
        const name = req.body.name
        const image = Imgfile.find({ "name": name })
        version++
        fs.unlink(`smartmirror/image/${name}`, function (err) {
            if (err) console.log(err)
        })
        Smartmirrorimagefile.find(function (err, data) {
            for (let index = 0; index < data.length; index++) {
                if (data[index].name == name && data[index].type == "reservation") {
                    const currentimage = Smartmirrorimagefile.find({ "name": data[index].name, "type": "reservation" })
                    currentimage.remove(function (err) {
                        if (err) {
                            console.log(err)
                            res.status(500).send('update error')
                        }
                    })
                }
            }
        })
        image.remove(function (err) {
            if (err) {
                console.log(err)
                res.status(500).send('update error')
            }
        })
        res.redirect('bookmedia')
    })

//미디어컨텐츠관리 창
app.use('/mediacontents', function (req, res) {
    let videoArray = new Array()
    let imageArray = new Array()
    Videofilesave.find(function (err, videofile) {
        for (let index = 0; index < videofile.length; index++) {
            if (videofile[index].type == "None") {
                videoArray.push(videofile[index])
            }
        }
        Imgfile.find(function (err, imgfile) {
            for (let index = 0; index < imgfile.length; index++) {
                if (imgfile[index].type == "None") {
                    imageArray.push(imgfile[index])
                }
            }
            res.render('mediacontents', { videofile: videoArray, imgfile: imageArray })
        })
    })
})

//예약미디어컨텐츠관리 창
app.use('/bookmedia', function (req, res) {
    let videoArray = new Array()
    let imageArray = new Array()
    Videofilesave.find(function (err, videofile) {
        for (let index = 0; index < videofile.length; index++) {
            if (videofile[index].type == "reservation") {
                videoArray.push(videofile[index])
            }
        }
        Imgfile.find(function (err, imgfile) {
            for (let index = 0; index < imgfile.length; index++) {
                if (imgfile[index].type == "reservation") {
                    imageArray.push(imgfile[index])
                }
            }
            res.render('bookmedia', { videofile: videoArray, imgfile: imageArray })
        })
    })
})

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
//메인페이지
app.get('/main', function (req, res) {
    Water.find(function (err, water) {
        Smartmirrorvideofile.find(function (err, videofile) {
            Smartmirrorimagefile.find(function (err, imgfile) {
                if (req.session.logindata) {
                    res.render('sub', {
                        accessmanage: water, videofile: videofile, imgfile: imgfile, water: usewater, remainwater: remainwater,
                        contents: localname, cityname: cityname, village: villagename, selectcityname: selectcityname, selectvillagename: selectvillagename
                    })
                }
                else {
                    res.render('login', { layout: null })
                }
            })
        })
    }).sort({ Date: -1 }).sort({ Hour: -1 }).limit(7)
})

/*
app.get('/person', function (req, res) {
if (req.session.logindata) {
    res.render('person')
}
else {
    res.render('login', { layout: null })
}
})
*/

//임시 모든 값 입력창
app.get('/login', function (req, res) {
    res.render('login', { layout: null })
})
//페이지 입장시 보이는 로그인페이지
app.get('/', function (req, res) {
    res.render('login', { layout: null })
})

let testweather = ""
//행정구역코드 초기 데이터 설정
Weather.find({}, imgProjection, function (err, locationcode) {
    if (locationcode) {
        testweather = locationcode[0]
    }
    else {
        testweather = 1111053000
    }
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

//스마트미러에 이미지파일 목록 보내기
app.get('/smartmirror/image/info', function (req, res) {
    Imgfile.find({}, imgProjection, function (err, data) {
        if (err) return next(err);
        res.json(data)
    })
    /*
    Smartmirrorimagefile.find({},videoProjection,function(err, date){
        if(err) return next(err)
        res.json(data)
    })
    */
})

//스마트미러에 비디오파일 목록 보내기
app.get('/smartmirror/video/info', function (req, res) {
    Videofilesave.find({}, videoProjection, function (err, data) {
        if (err) return next(err)
        res.json(data)
    })
    /*
    Smartmirrorvideofile.find({},videoProjection,function(err, date){
        if(err) return next(err)
        res.json(data)
    })
    */
})

app.get('/smartmirror/item/info', function (req, res) {
    SmartmirrorExe.find({}, imgProjection, function (err, data) {
        if (err) return next(err)
        console.log(data)
        res.json(data)
    })
})
//스마트미러에 기상청 행정구역코드 보내기
app.get('/smartmirror/weather', function (req, res) {
    Weather.find({}, imgProjection, function (err, weather) {
        console.log(weather[0].name)
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
var refVideoArray = new Array()
var refImageArray = new Array()
app.get('/smartmirror/getcontents', function (req, res) {
    let model = req.query.model
    let contents = req.query.contents
    let kinds = req.query.kinds

    var data = new Array()
    if (model != "") data.push(model)
    if (contents != "") data.push(contents)

    var state = true;
    if (kinds == 0) // 비디오 데이터
    {
        for (var i = 0; i < refVideoArray.length; i++) {
            if (refVideoArray[i][0] == model) // 중복된 모델의 경우 덮어쓰기
            {
                data.push(new Date())
                refVideoArray[i] = data
                state = false
                break
            }
        }
        if (state) {
            data.push(new Date())
            refVideoArray.push(data)
        }
    }
    else // 이미지 데이터
    {
        for (var i = 0; i < refImageArray.length; i++) {
            if (refImageArray[i][0] == model) // 중복된 모델의 경우 덮어쓰기
            {
                data.push(new Date())
                refImageArray[i] = data
                state = false
                break
            }
        }
        if (state) {
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
var ComboVideo = new Array()

//스마트미러 관리 페이지
app.get('/smartmirrormanage', function (req, res) {
    const nowtime = new Date()
    for (let i = 0; i < refVideoArray.length; i++) {
        const elapsedMSec = nowtime - refVideoArray[i][2]
        const elapsedMin = elapsedMSec / 1000 / 60;
        if (elapsedMin > 5) refVideoArray.pop(i)
    }
    for (let i = 0; i < refImageArray.length; i++) {
        const elapsedMSec = nowtime - refImageArray[i][2]
        const elapsedMin = elapsedMSec / 1000 / 60;
        if (elapsedMin > 5) refImageArray.pop(i)
    }
    // Combobox에 표시할 데이터
    ComboVideo = new Array();
    for (let i = 0; i < refVideoArray.length; i++) {
        // if(refVideoArray[i][0] == 지정모델명)
        // 지정 모델명의 대체 이름 대입
        // 그 외의 경우 대입
        ComboVideo.push(refVideoArray[i][0]);
    }
    res.render('smartmirrormanage', { videodata: refVideoArray, imgdata: refImageArray, combovideo: ComboVideo })
})



//스마트미러 관리자 페이지 선택버튼
app.post('/smartmirrormanage', function (req, res) {
    const selectsmartmirror = req.body.name
    const selectimage = req.body.selectimage
    for (var i = 0; i < refVideoArray.length; i++) {
        if (refVideoArray[i][0] == selectsmartmirror) {
            numbervideo = refVideoArray[i][1]
            break
        }
    }

    for (var i = 0; i < refImageArray.length; i++) {
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


//스마트미러의 버전을 표시하여 업데이트 하는 페이지
let version = 0
app.get('/smartmirror/version', function (req, res) {
    res.render('dummy', { layout: null, contents: version })
})

//esp32에서 서버로 값을 불러올때 리턴값을 보내기 위하여 만든 더미 페이지
app.get('/dummy', function (req, res) {
    res.render('dummy')
})

//핸드드라이어 공기필터 오염량 관리 페이지
app.use('/handdryermanage', function (req, res) {
    res.render('handdryermanage')
})

//서버에서 esp32 값을 받는 테스트 페이지
var led_state = 0;
app.get('/ledstate', (req, res) => {

    res.setHeader('Content-Type', 'text/plain');
    res.status(200);
    res.send(led_state.toString());
});

app.post('/updateled', (req, res) => {
    const led = req.body.name
    led_state = parseInt(led);

    res.status(200);
    res.send("LED State send successfully");
});

app.get('/ledtest', function (req, res) {
    res.render('esp32test', { layout: null, watervalue: watervalue, dlatlwatervalue: dlatlwatervalue })
})

let watervalue = 3
let plusvalue = 0
let percentArray = new Array()
let yearpercentArray = new Array()
app.get('/testwater_recieve', function (req, res) {
    watervalue = req.query.id
    console.log(plusvalue)
    //plusvalue = parseInt(plusvalue) + (parseInt(watervalue) / 1000)

    plusvalue = parseInt(plusvalue) + parseInt(watervalue)
    weekendWater[0] = weekendWater[0] + parseInt(watervalue)
    if (weekendWater[0] > maxValue) {
        maxValue = weekendWater[0]
    }

    for (let index = 0; index < weekendWater.length; index++) {
        //weekendWater.push(percent(data[index].Useage, maxValue))
        percentArray[index] = Math.floor(percent(weekendWater[index], maxValue))
    }

    //yearWater[0] = yearWater[0] + (parseInt(watervalue) / 1000)
    yearWater[0] = yearWater[0] + parseInt(watervalue)
    if (yearWater[0] > maxyearValue) {
        maxyearValue = yearWater[0]
    }
    for (let index = 0; index < yearWater.length; index++) {
        //weekendWater.push(percent(data[index].Useage, maxValue))
        yearpercentArray[index] = Math.floor(percent(yearWater[index], maxyearValue))
    }
    //연결이 들어오면 실행되는 이벤트
    io.emit('weekendwater', weekendWater[0])
    io.emit('waterpercent', percentArray)
    io.emit('wateryearpercent', yearpercentArray)
    res.render('dkatk', { layout: null, watervalue: watervalue, plusvalue: plusvalue })
})

//실시간 값 받아오는 영역
app.get('/testhanddryer_recieve', function (req, res) {
    handdryervalue = req.query.id
    if (handdryervalue == "0") {
        state = ""
    }
    else {
        state = "checked"
    }
    io.emit('messageled', state)
    res.render("dkatk", { layout: null })
})
let dlatlwatervalue = ""
app.get('/Water', function (req, res) {
    dlatlwatervalue = req.query.id
    io.emit('dlatlwatervalue', dlatlwatervalue)
    res.render('dkatk', { layout: null })
})
let gassensor = ""
app.get('/PM_2.5', function (req, res) {
    gassensor = req.query.two
    io.emit('gassensor', gassensor)
    res.render('dkatk', { layout: null })
})
let sensor = ""
app.get('/PM_1.0', function (req, res) {
    sensor = req.query.one
    io.emit('sensor', sensor)
    res.render('dkatk', { layout: null })
})
let ajswl = ""
app.get('/PM_10', function (req, res) {
    ajswl = req.query.three
    console.log(ajswl)
    io.emit('ajswl', ajswl)
    res.render('dkatk', { layout: null })
})
let getnfc = ""
app.get('/nfc_recieve', function (req, res) {
    getnfc = req.query.id
    console.log(getnfc)
    io.emit('getnfc', getnfc)
    res.render('dkatk', { layout: null })
})


app.get('/test_gassensor', function (req, res) {
    gassensor = req.query.id
    console.log(gassensor)
    io.emit('getgassensor', gassensor)
    res.render('dkatk', { layout: null })
})


app.get('/wateruseage', function (req, res) {
    Water.find(function (err, data) {
        MonthUseage.find(function (err, yeardata) {
            const currentYear = moment().format('YY')
            const currentMonth = moment().format('MM')
            for (let index = 0; index < data.length; index++) {
                //weekendWater.push(percent(data[index].Useage, maxValue))
                data[index].Persent = Math.floor(percent(data[index].Useage, maxValue))
            }

            for (let index = 0; index < yeardata.length; index++) {
                if (yeardata[index].Month == currentMonth && yeardata[index].Year == currentYear) {
                    yeardata[index].Persent = Math.floor(percent(yeardata[index].Useage, maxValue))
                }
            }
            res.render('wateruseage', { data: data, yeardata: yeardata, selectcityname: selectcityname, selectvillagename: selectvillagename })
        })
    })
    console.log(percentArray)
})
//const user = new Water({ 'name': "132", 'Date' : valuedata, 'Hour' : "18 : 10" })

// 퍼센트 구하는 함수 ex) percetn(50,100) = 50
function percent(par, total) {
    return (par / total) * 100
}

const todayYear = moment().format('YY')
const todayMonth = moment().format('MM')
//초기 7일간 데이터중 가장 높은 일자의 값 구하기 설정
let maxValue = 0
Water.find(function (err, data) {
    //maxValue = Math.max(...data.Date) //ES6 문법이기 때문에 안되면 const maxValue = Math.max.apply(null, data) 를 사용
    let Valuedata = new Array()
    for (let index = 0; index < data.length; index++) {
        Valuedata.push(data[index].Useage)
    }
    maxValue = Math.max.apply(null, Valuedata)
}).sort({ Year: -1 }).sort({ Month: -1 }).sort({ Day: -1 }).limit(7) //추후엔 Month 와 Day로 나누기 때문에 각각에 sort정렬을 해줘야 최신 데이터가 나옴


//초기 1년간 데이터중 가장 높은 달의 값 구하기 설정
let maxyearValue = 0
MonthUseage.find(function (err, data) {
    //maxValue = Math.max(...data.Date) //ES6 문법이기 때문에 안되면 const maxValue = Math.max.apply(null, data) 를 사용
    let Valueyeardata = new Array()
    for (let index = 0; index < data.length; index++) {
        if (data[index].Month == todayMonth && data[index].Year == todayYear)
            Valueyeardata.push(data[index].Useage)
    }
    maxyearValue = Math.max.apply(null, Valueyeardata)
}).sort({ Year: -1 }).sort({ Month: -1 }).sort({ Day: -1 }).limit(7) //추후엔 Month 와 Day로 나누기 때문에 각각에 sort정렬을 해줘야 최신 데이터가 나옴



// 수전데이터 받기전 일주일 데이터 기초 설정
let weekendWater = new Array()
Water.find(function (err, data) {
    for (let index = 0; index < data.length; index++) {
        //weekendWater.push(parseInt(percent(data[index].Useage, maxValue)))
        weekendWater.push(parseInt(data[index].Useage))
    }
    console.log(weekendWater)
}).sort({ Year: -1 }).sort({ Month: -1 }).sort({ Day: 1 }).limit(7)

//수전데이터 받기전 1년 데이터 기초 설정
let yearWater = new Array()
MonthUseage.find(function (err, data) {
    for (let index = 0; index < data.length; index++) {
        if (data[index].Month == todayMonth)
            yearWater.push(parseInt(data[index].Useage))
    }
})


//nfc 태그(임시)
let wateruseage = ""
app.get('/nfctagging', function (req, res) {
    let weekendWater = new Array()
    wateruseage = req.query.wateruseage
    const todayYear = moment().format('YY')
    const todayMonth = moment().format('MM')
    const todayDay = moment().format('DD')
    if (wateruseage > maxValue) {
        maxValue = wateruseage
    }
    const user = new Water({ 'Useage': wateruseage, 'Year': todayYear, 'Month': todayMonth, 'Day': todayDay })
    user.save(function (err, slience) {
        if (err) {
            console.log(err)
            res.status(500).send('update error')
            return
        }
        return console.log("complete")
    })

    //일주일 데이터
    Water.find(function (err, data) {
        for (let index = 0; index < data.length; index++) {
            weekendWater.push(percent(data[index].Useage, maxValue))
        }
    }).sort({ Year: -1 }).sort({ Month: -1 }).sort({ Day: 1 }).limit(7)

    io.emit(weekendWater) // 7일간 데이터를 배열로 보냄
    io.emit(Monthwater) // 1년간의 데이터중 이번달 데이터만 표시
    res.render('dkatk', { layout: null })
})

io.on('connection', (socket) => {   //연결이 들어오면 실행되는 이벤트
    // socket 변수에는 실행 시점에 연결한 상대와 연결된 소켓의 객체가 들어있다.


    // on 함수로 이벤트를 정의해 신호를 수신할 수 있다.
    socket.on('message', (msg) => {
        //msg에는 클라이언트에서 전송한 매개변수가 들어온다. 이러한 매개변수의 수에는 제한이 없다.
        led_state = msg
        // io.emit으로 연결된 모든 소켓들에 신호를 보낼 수 있다.
        io.emit('message', msg);
    });

    socket.on('messageh1', (msg) => {
        //msg에는 클라이언트에서 전송한 매개변수가 들어온다. 이러한 매개변수의 수에는 제한이 없다.

        // io.emit으로 연결된 모든 소켓들에 신호를 보낼 수 있다.
        io.emit('messageh1', msg);
    });

    socket.on('messageled', (msg) => {
        //msg에는 클라이언트에서 전송한 매개변수가 들어온다. 이러한 매개변수의 수에는 제한이 없다.

        // io.emit으로 연결된 모든 소켓들에 신호를 보낼 수 있다.
        io.emit('messageled', msg);
    });

    socket.on('dlatlwatervalue', (msg) => {
        //msg에는 클라이언트에서 전송한 매개변수가 들어온다. 이러한 매개변수의 수에는 제한이 없다.

        // io.emit으로 연결된 모든 소켓들에 신호를 보낼 수 있다.
        io.emit('dlatlwatervalue', msg);
    });

    socket.on('gassensor', (msg) => {
        //msg에는 클라이언트에서 전송한 매개변수가 들어온다. 이러한 매개변수의 수에는 제한이 없다.

        // io.emit으로 연결된 모든 소켓들에 신호를 보낼 수 있다.
        io.emit('gassensor', msg);
    });

    socket.on('sensor', (msg) => {
        //msg에는 클라이언트에서 전송한 매개변수가 들어온다. 이러한 매개변수의 수에는 제한이 없다.
        // io.emit으로 연결된 모든 소켓들에 신호를 보낼 수 있다.
        io.emit('sensor', msg);
    });

    socket.on('ajswl', (msg) => {
        //msg에는 클라이언트에서 전송한 매개변수가 들어온다. 이러한 매개변수의 수에는 제한이 없다.

        // io.emit으로 연결된 모든 소켓들에 신호를 보낼 수 있다.
        io.emit('ajswl', msg);
    });
    socket.on('currentimage', (msg) => {
        //msg에는 클라이언트에서 전송한 매개변수가 들어온다. 이러한 매개변수의 수에는 제한이 없다.

        // io.emit으로 연결된 모든 소켓들에 신호를 보낼 수 있다.
        io.emit('currentimage', msg);
    });

});

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
