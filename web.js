
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
app.use(cookieParser())
app.use(
    session({
        key: "logindata",
        secret: "secretuser",
        resave: false,
        saveUninitialized: false,
        cookie: {
            expires: 60 * 60 * 24 * 24,
        },
    })
)
process.setMaxListeners(15);
var Graphql = require('graphql')
var GraphqlHttp = require('express-graphql').graphqlHTTP
//데이터베이스 초기설정
const mongoose = require('mongoose')
const { WSATYPE_NOT_FOUND } = require('constants')
const { response } = require('express')
const cookieSession = require('cookie-session')
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
    name: String,
    Date: String,
    Hour: String
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
    name: String
})
const smartmirrorvideofile = new mongoose.Schema({
    name: String
})
const weather = new mongoose.Schema({
    name: String
})
const smartmodel = new mongoose.Schema({
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
const endpoint = 'http://localhost:8001/graphql/waterinput'
const schema = Graphql.buildSchema(`
type usingwater{
    name : String,
    password : String,
    username : String,
    sex : String
}
input inputusingwater {
    name : String,
    password : String,
    username : String,
    sex : String
    }

    type Query {
    getusingwater(name : String, password : String, username : String, sex : String) : usingwater
}

type Mutation {
    addusingwater(name : String, Date : String, Hour : String) : usingwater
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
        console.log(input.name)
        return await input.name
    },
    //graphql 페이지에서 값을 입력하면 페이지 저장
    addusingwater: (input) => {
        console.log(input)
        const saveusingwater = new Client({ 'name': input.name, 'Date': input.password, 'Hour': input.username, 'Sex': input.sex })
        saveusingwater.save(function (err, slience) {
            if (err) {
                console.log(err)
                res.send('update error,adawaaaa')
                return
            }
        })
        return saveusingwater
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
var router = express.Router();


var storagevideo = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'smartmirror/video')
    },
    filename: function (req, file, callback) {
        var extension = path.extname(file.originalname);
        var basename = path.basename(file.originalname, extension);
        basename = basename.replace(/(\s*)/g, "")
        callback(null, basename + Date.now() + extension);
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

            // 클라이언트에 응답 전송
            res.redirect('main')

            const videofile = new Videofilesave({ 'name': filename, 'Date': new Date(), 'type': "None" })
            videofile.save(function (err, slience) {
                if (err) {
                    console.log(err)
                    res.send('update error')
                    return
                }
                return
            })
            res.end();
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
        const strArr = selectday.split('-');
        const month = strArr[1]
        const day = strArr[2]
        const currentday = strArr[1] + "-" + strArr[2]
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
            res.redirect('main')

            const videofile = new Videofilesave({ 'name': filename, 'Date': currentday, 'type': "reservation" })
            videofile.save(function (err, slience) {
                if (err) {
                    console.log(err)
                    res.send('update error')
                    return
                }
                return
            })
            res.end();
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
        callback(null, 'smartmirror/image')
    },
    filename: function (req, file, callback) {
        var extension = path.extname(file.originalname);
        var basename = path.basename(file.originalname, extension);
        basename = basename.replace(/(\s*)/g, "")
        callback(null, basename + Date.now() + extension);
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
            res.redirect('mediacontents')


            const imgfile = new Imgfile({ 'name': filename, 'Date': new Date(), 'type': "None" })
            imgfile.save(function (err, slience) {
                if (err) {
                    console.log(err)
                    res.send('update error,aaaaa')
                    return
                }
                return
            })
            Imgfile.find({}, null, { sort: '-name' }, function (err, docs) { })
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
        const currentday = strArr[1] + "-" + strArr[2]
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
            res.redirect('main')

            const date = moment().format('MMDD')
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
            res.end();
        } else {
            console.log('파일이 없습니다');
        }
    } catch (err) {
        console.dir(err.stack);
    }
});


//매일 오전6시에 예약한 날짜가 되면 스마트미러에 예약한 이미지포스터로 교체
let changefilename
var j = schedule.scheduleJob("* * 6 * * *", function () {
    let imagestate = false
    let videostate = false
    const date = moment().format('MMDD')
    const yesterdaydate = date - 100
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
                const changefile = new Smartmirrorimagefile({ 'name': changefilename })
                changefile.save(function (err, slience) {
                    if (err) {
                        console.log(err)
                        res.status(500).send('update error')
                        return
                    }
                    return console.log("complete")
                })
                imagestate = true
            }
        }
        if (!imagestate) //만약 smartmirror 데이터베이스안에 어떠한 파일도 못넣었을 경우 type이 None인 파일들을 추가
        {
            for (let i = 0; i < data.length; i++) {
                if (data[i].type == "None") {
                    changefilename = data[i].name
                    const changefile = new Smartmirrorimagefile({ 'name': changefilename })
                    changefile.save(function (err, slience) {
                        if (err) {
                            console.log(err)
                            res.status(500).send('update error')
                            return
                        }
                        return console.log("complete")
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
                const changefile = new Smartmirrorimagefile({ 'name': changefilename })
                changefile.save(function (err, slience) {
                    if (err) {
                        console.log(err)
                        res.status(500).send('update error')
                        return
                    }
                    return console.log("complete")
                })
                videostate = true
            }
        }
        if (!videostate) //만약 smartmirror 데이터베이스안에 어떠한 파일도 못넣었을 경우 type이 None인 파일들을 추가
        {
            for (let i = 0; i < data.length; i++) {
                if (data[i].type == "None") {
                    changefilename = data[i].name
                    const changefile = new Smartmirrorimagefile({ 'name': changefilename })
                    changefile.save(function (err, slience) {
                        if (err) {
                            console.log(err)
                            res.status(500).send('update error')
                            return
                        }
                        return console.log("complete")
                    })
                    console.log("비디오파일 저장 진행")
                }
            }
        }
    })

    version++
    console.log("매분 5초마다 등장");
});


app.get('/dkatk', function (req, res) {
    Water.find(function (err, data) {

        for (let i = 0; i < data.length; i++) {
            console.log(data[i].Date)
        }
        res.render('dkatk', { layout: null, data: data })
    }).sort({ Date: 1 })
})
//fs.unlink(`smartmirror/image/${name}`, function () { })
app.use('/', router);





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
    res.redirect('main')
})

//로그인
app.post('/main', (req, res) => {
    User.findOne({ name: req.body.name, password: req.body.password }, (err, user) => {
        if (err) return res.status(500).send({ message: '에러!' });
        else if (user) {
            Water.find(function (err, water) {
                Videofilesave.find(function (err, videofile) {
                    Imgfile.find(function (err, imgfile) {
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
        res.redirect('main')

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
    res.redirect('main')
})

//비디오파일 삭제
app.post('/deletevideo', function (req, res, next) {
    const name = req.body.name
    const video = Videofilesave.find({ "name": name })
    version++
    fs.unlink(`smartmirror/video/${name}`, function () {
    })
    video.remove(function (err) {
        if (err) {
            console.log(err)
            res.status(500).send('update error')
            return
        }
        res.redirect('main')
    })
})

//이미지파일 삭제
app.post('/deleteimage', function (req, res, next) {
    const name = req.body.name
    const image = Imgfile.find({ "name": name })
    version++
    fs.unlink(`smartmirror/image/${name}`, function () {
    })
    image.remove(function (err) {
        if (err) {
            console.log(err)
            res.status(500).send('update error')
            return
        }
        res.redirect('main')
    })
})

//미디어컨텐츠관리 창
app.use('/mediacontents', function (req, res) {
    Videofilesave.find(function (err, videofile) {
        Imgfile.find(function (err, imgfile) {
            res.render('mediacontents', { videofile: videofile, imgfile: imgfile })
        })
    })
})

//예약미디어컨텐츠관리 창
app.use('/bookmedia', function (req, res) {
    Videofilesave.find(function (err, videofile) {
        Imgfile.find(function (err, imgfile) {
            res.render('bookmedia', { videofile: videofile, imgfile: imgfile })
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

//메인페이지
app.get('/main', function (req, res) {
    Water.find(function (err, water) {
        Videofilesave.find(function (err, videofile) {
            Imgfile.find(function (err, imgfile) {
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

//스마트미러에 기상청 행정구역코드 보내기
app.get('/smartmirror/weather', function (req, res) {
    Weather.find(function (err, weather) {
        res.render('weather', { contents: weather, layout: null })
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


//페이징
//회원목록 페이지
let countint = []
app.get('/personlist/:page', function (req, res) {
    let page = req.params.page
    if (page == null) { page = 1 }
    let skipsize = (page - 1) * 10
    let limitsize = 14
    let pagenum = 1

    Water.countDocuments(function (err, water) {
        if (err) throw err

        pagenum = Math.ceil(water / limitsize)
        for (let i = 1; i <= pagenum; i++) {
            countint[i] = i
        }
        Water.find({}).sort({ Date: -1 }).skip(skipsize).limit(limitsize).exec(function (err, pageContents) {
            if (err) throw err
            res.render('personlist', { contents: pageContents, pagination: pagenum, count: countint })
        })
    })
})

let listint = []
let clientpage
app.get('/clientlist/:page', function (req, res) {
    clientpage = req.params.page
    console.log(clientpage)
    if (clientpage == null) { clientpage = 1 }
    let skipsize = (clientpage - 1) * 10
    let limitsize = 14
    let pagenum = 1

    Water.countDocuments(function (err, water) {
        if (err) throw err

        pagenum = Math.ceil(water / limitsize)
        for (let i = 1; i <= pagenum; i++) {
            listint[i] = i
        }
        Water.find({}).sort({ Date: -1 }).skip(skipsize).limit(limitsize).exec(function (err, pageContents) {
            if (err) throw err
            res.render('clientlist', { contents: pageContents, pagination: pagenum, count: listint, layout: "main" })
        })
    })
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

var watervalue = 3
app.get('/testwater_recieve', function (req, res) {
    watervalue = req.query.id
    //연결이 들어오면 실행되는 이벤트
    io.emit('messageh1', watervalue)
    res.render('dkatk', { layout: null, watervalue: watervalue })
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
    io.emit('ajswl', ajswl)
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
    socket.on('currentT1H', (msg) => {
        //msg에는 클라이언트에서 전송한 매개변수가 들어온다. 이러한 매개변수의 수에는 제한이 없다.

        // io.emit으로 연결된 모든 소켓들에 신호를 보낼 수 있다.
        io.emit('currentT1H', msg);
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
