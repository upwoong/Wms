
const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const xlsx = require("xlsx")

const mirrorSql = require('./script/mirrorSql')
const User = require('./script/User');
const Water = require('./script/Water')

let storageImg = multer.diskStorage({
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

let uploadImg = multer({
    storage: storageImg,
    limits: {
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
})


let storageVideo = multer.diskStorage({
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
let uploadVideo = multer({
    storage: storageVideo,
    limits: {
        files: 10,
        fileSize: 1024 * 1024 * 1024
    }
});
const io = require('./server').io



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
router.route('/processvideo').post(uploadVideo.array('photo', 1), async function (req, res) {
    let Extension = req.files[0].filename

    if (Extension == "video/mp4" || Extension == "video/avi" || Extension == "video/wmv") {
        await curVideoFile.SaveFile(req.files,0)
        await repoVideoFile.SaveFile(req.files,0)
      }
      else {
        fs.unlink(`smartmirror/video/${req.files[0].filename}`, function (err) {
        })
        res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>")
      }
      res.redirect('mediacontents')
});

//예약 비디오 파일 저장
router.route('/processbookingvideo').post(uploadVideo.array('photo', 1), async function (req, res) {
    let Extension = req.files[0].filename
    await repoVideoFile.SaveFile(req.files,req.body.chooseimageday)

    if (Extension == "video/mp4" || Extension == "video/avi" || Extension == "video/wmv") {
        await repoVideoFile.SaveFile(req.files,req.body.chooseimageday)
      }
      else {
        fs.unlink(`smartmirror/video/${req.files[0].filename}`, function (err) {
        })
        res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='bookmedia';</script>")
      }
      res.redirect('bookmedia')
});

//기본 이미지 파일 저장
router.route('/processimage').post(uploadImg.array('photo', 1), async function (req, res) {
    let Extension = req.files[0].filename

    if (Extension == "image/jpg" || Extension == "image/png" || Extension == "image/gif" || Extension == "image/jpeg") {
        await curImgFile.SaveFile(req.files,0)
        await repoImgFile.SaveFile(req.files,0)
      }
      else {
        fs.unlink(`smartmirror/image/${req.files[0].filename}`, function (err) {
        })
        res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>")
      }
      res.redirect('mediacontents')
});

//예약 이미지 파일 저장
router.route('/processbookingimage').post(uploadImg.array('photo', 1), async function (req, res) {
    let Extension = req.files[0].filename
    if (Extension == "image/jpg" || Extension == "image/png" || Extension == "image/gif" || Extension == "image/jpeg") {
        await repoImgFile.SaveFile(req.files,req.body.chooseimageday)
      }
      else {
        fs.unlink(`smartmirror/image/${req.files[0].filename}`, function (err) {
        })
        res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='bookmedia';</script>")
      }
      res.redirect('bookmedia')
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
            mirrorSql.version++
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
router.post('/deletevideo', async function (req, res, next) {
    try {
        await curVideoFile.deletefile(req.files)
        await repoVideoFile.deletefile(req.files)
    } catch (err) {
        console.dir(err.stack);
    }
    res.redirect('mediacontents')
})

//이미지파일 삭제
router.post('/deleteimage', async function (req, res, next) {
    try {
        await curImgFile.deletefile(req.files)
        await repoImgFile.deletefile(req.files)
    } catch (err) {
        console.dir(err.stack);
    }
    res.redirect('mediacontents')
})

//예약 비디오파일 삭제
router.post('/deletereservationvideo', async function (req, res, next) {
    try {
        await repoVideoFile.deletefile(req.files)
    } catch (err) {
        console.dir(err.stack);
    }
    res.redirect('bookmedia')
})

//예약 이미지파일 삭제

router.post('/deletereservationimage', async function (req, res, next) {
    try {
        await repoImgFile.deletefile(req.files)
    } catch (err) {
        console.dir(err.stack);
    }
    res.redirect('bookmedia')
})

//구역 선택 post
router.post('/weatherList', function (req, res) {
    const local = req.body.local
    const city = req.body.city
    regionWeatherData.localSelect = local
    regionWeatherData.citySelect = city
    regionWeatherData.cityName = []
    for (let index = 2; index <= 3775; index++) {
        if (regionWeatherData.localSelect != firstSheet["C" + index].v) continue
        let data = firstSheet["D" + index].v
        if (data == "") continue;
        let state = true;
        for (let i = 0; i < regionWeatherData.cityName.length; i++) {
            if (regionWeatherData.cityName[i] == data) {
                state = false;
                break
            }
        }
        if (state) regionWeatherData.cityName.push(data)
    }
    regionWeatherData.villageName = new Array()
    for (let index = 2; index <= 3775; index++) {
        if (regionWeatherData.localSelect == firstSheet["C" + index].v && regionWeatherData.citySelect == firstSheet["D" + index].v) {
            let data = firstSheet["E" + index].v
            if (data != "") regionWeatherData.villageName.push(data)
        }
    }
    res.redirect('main')
})
//최종 구역 선택
router.post('/weatherFinal', async function (req, res) {
    try {
        const local = req.body.local
        const city = req.body.city
        const village = req.body.village
        regionWeatherData.localSelect = local
        regionWeatherData.citySelect = city
        regionWeatherData.villageSelect = village

        for (let index = 2; index <= 3775; index++) {
            if (regionWeatherData.localSelect == firstSheet["C" + index].v && regionWeatherData.citySelect == firstSheet["D" + index].v && regionWeatherData.villageSelect == firstSheet["E" + index].v) {
                let data = firstSheet["B" + index].v
                regionWeatherData.selectCityName = firstSheet["D" + index].v
                regionWeatherData.selectVillageName = firstSheet["E" + index].v
                regionWeatherData.currentLocationX = firstSheet["F" + index].v
                regionWeatherData.currentLocationY = firstSheet["G" + index].v

                    await regionWeatherData.updateData(data)

            }
        }

        mirrorSql.version++
        res.redirect('main')
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'server error' })
    }
})

router.post('/smartmirrormanage', function (req, res) {
    try {
        const selectSmartmirror = req.body.setSmartmirror
        const selectImage = req.body.selectImage
        for (let i = 0; i < smartMirror.refVideoArray.length; i++) {
            if (smartMirror.refVideoArray[i][0] == selectSmartmirror) {
                smartMirror.numberVideo = smartMirror.refVideoArray[i][1]
                break
            }
        }

        for (let i = 0; i < smartMirror.refImageArray.length; i++) {
            if (smartMirror.refImageArray[i][0] == selectImage) {
                smartMirror.numberImage = smartMirror.refImageArray[i][1]
                break
            }
        }

        const ImgFile = curImgFile.GetData()
        const VideoFile = curVideoFile.GetData()

        res.render('smartmirrormanage', {
            selectSmartmirror: selectSmartmirror, ComboVideo: smartMirror.ComboVideo,
            selectVideo: VideoFile[smartMirror.numberVideo].name, selectImage: ImgFile[smartMirror.numberImage].name
        })
    } catch (err) {
        console.log(err)
    }
})

//관리자 로그인
router.post('/main', async (req, res) => {
    const findUser = await User.findUser(req.body.name, req.body.password)
    if (findUser) {
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

router.get('/mediacontents', async function (req, res) {
    try {
        const Video = await mirrorSql.GetFile("curvideofile", "None")
        const Img = await mirrorSql.GetFile("curimgfile", "None")
        if (req.session.logindata) {
            res.render('mediacontents', {
                videofile: Video, imgfile: Img
            })
        }
        else {
            res.render('login', { layout: null })
        }
    } catch (err) {
        console.log(err)
    }
})

router.get('/bookmedia', async function (req, res) {
    try {
        const Video = mirrorSql.GetFile("VideoFile", "reservation")
        const Img = mirrorSql.GetFile("ImgFile", "reservation")
        if (req.session.logindata) {
            res.render('bookmedia', {
                videofile: Video, imgfile: Img
            })
        }
        else {
            res.render('login', { layout: null })
        }
    } catch (err) {
        console.log(err)
    }

})

router.get('/main', async function (req, res) {
    try {
        const Video = await mirrorSql.GetFile("curvideofile", "None")
        const Img = await mirrorSql.GetFile("curimgfile", "None")
        if (req.session.logindata) {
            res.render('subcopy', {
                weekData: weekData, yearData: yearData, videoFile: Video, imgFile: Img,
                localName: regionWeatherData.localName, cityName: regionWeatherData.cityName, village: regionWeatherData.villageName,
                selectCityName: regionWeatherData.selectCityName, selectVillageName: regionWeatherData.selectVillageName,
                localSelected: regionWeatherData.localSelect, citySelected: regionWeatherData.citySelect
            })
        }
        else {
            res.render('login', { layout: null })
        }
    } catch (err) {
        console.log(err)
    }
})

router.get('/login', function (req, res) {
    res.render('login', { layout: null })
})

router.get('/smartmirror/item', function (req, res) {
    res.render('item', { layout: null })
})

router.get('/smartmirror/image/info', async function (req, res) {
    const SmartMirrorImgFile = await mirrorSql.GetData("ImgFile")
    res.json(SmartMirrorImgFile)
})

router.get('/smartmirror/video/info', async function (req, res) {
    const SmartMirrorVideoFIle = await mirrorSql.GetData("VideoFIle")
    res.json(SmartMirrorVideoFIle)
})

router.get('/smartmirror/item/info', async function (req, res) {
    const MirrorExe = await mirrorSql.GetData("MirrorExe")
    res.json(MirrorExe)

})

router.get('/smartmirror/weather', async function (req, res) {
    const Weather = await mirrorSql.GetData("Weather")
    res.render('weather', { contents: Weather[0].name, layout: null })
});

router.get('/smartmirror/model', async function (req, res) {
    const MirrorModel = await mirrorSql.GetData("MirrorModel")
    res.render('dummy', { contents: MirrorModel, layout: null })
})

// 스마트미러의 현재 실행하고 있는 비디오파일와 이미지파일 출력
router.get('/smartmirror/getcontents', function (req, res) {
    try {
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
    } catch (err) {
        console.log(err)
    }
})

/*
매니저 페이지 : 최근 5분 내 재생중인 홍보물을 확인하는 페이지
*/
//스마트미러 관리 페이지

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


router.get('/smartmirror/version', function (req, res) {
    res.render('dummy', { layout: null, contents: mirrorSql.version })
})

router.get('/dummy', function (req, res) {
    res.render('dummy', { weekData: weekData })
})
const testa = require('./script/watertest')

router.get('/water_useage/daily', async function (req, res) {
    try {
        let waterValue = parseFloat(((req.query.amount) / 1000).toFixed(3))
        weekData.values[0][0] = parseFloat((parseFloat(weekData.values[0][0]) + waterValue).toFixed(3))
        await weekData.getPercent()
        yearData.values[0][0] = parseFloat((parseFloat(yearData.values[0][0]) + waterValue).toFixed(3))
        await yearData.getPercent()
        console.log(weekData)
        io.emit('weekendwater', weekData.valueObject[0][0])  //량
        io.emit('waterpercent', weekData.valueObject[1]) //일주일%
        io.emit('weekendTotalUseage', weekData.valueObject[0][0]) //일주일 총%
        io.emit('yearTotalUseage', yearData.valueObject[0][0]) //연총량
        io.emit('MonthTotalUseage', weekData.valueObject[1]) //연총%
        io.emit('yearWater', yearData.valueObject[0][0])
        res.render('dummy', { layout: null })
    } catch (err) {
        console.log(err)
    }
})

//핸드드라이어에서 남은 휴지출지량 값을 받는 함수
router.get('/toilet-paper-quantity', function (req, res) {
    try {
        let number = req.query.number
        let hand = req.query.remain
        //let receivehand = parseInt(hand)
        console.log(moment().format('MMDD:hh:mm') + hand)
        console.log(number)
        io.emit('remain', [number, hand])
        res.render('dummy', { layout: null })
    }
    catch (err) {
    }
})

router.get('/wateruseage', function (req, res) {
    try {
        res.render('wateruseage', {
            selectCityName: regionWeatherData.selectCityName, selectVillageName: regionWeatherData.selectVillageName,
            weekData: weekData, yearData: yearData
        })
    } catch (err) {
        console.log(err)
    }
})

router.put('/weatherFinal', async function (req, res) {
    try {
        const name = req.body.name
        const city = req.body.city
        const village = req.body.village
        await regionWeatherData.setPlace(name, city, village)
        sqlmirror.version++
        res.redirect('main')
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'server error' })
    }
})

router.post('/weatherList', async function (req, res) {
    try {
        const local = req.body.local
        const city = req.body.city
        await regionWeatherData.selectPlace(local, city)
        res.redirect('main')
    } catch (err) {
        console.log(err)
    }
})

router.get('/smartmirrormanage', function (req, res) {
    smartmirror.showContents()
    res.render('smartmirrormanage', { videodata: smartMirror.refVideoArray, imgdata: smartMirror.refImageArray, ComboVideo: smartMirror.ComboVideo })
})

// 스마트미러의 현재 실행하고 있는 비디오파일와 이미지파일 출력
router.get('/smartmirror/getcontents', function (req, res) {
    try {
        let model = req.query.model //스마트미러 모델명
        let contents = req.query.contents //스마트미러가 보여주는 미디어들
        let kinds = req.query.kinds //스마트미러가 보여주는 미디어들의 종류들 (이미지,비디오)

        smartmirror.getContents(model,contents,kinds)
        res.render('dummy', { layout: null })
    } catch (err) {
        console.log(err)
    }
})

router.post('/smartmirrormanage', function (req, res) {
    try {
        const selectSmartmirror = req.body.setSmartmirror
        const selectImage = req.body.selectImage
        smartmirror.getShowSmartmirror(selectSmartmirror,selectImage)

        res.render('smartmirrormanage', {
            selectSmartmirror: selectSmartmirror, ComboVideo: smartmirror.ComboVideo,
            selectVideo: smartmirror.allVideofile[smartmirror.numberVideo].name, selectImage: smartmirror.allImgfile[smartmirror.numberImage].name
        })
    } catch (err) {
        console.log(err)
    }
})



module.exports = {
    router: router
};

//스마트미러 수정 예정
// getData를 캐시로 전환
// init해서 맨처음 데이터베이스에 있는 파일불러오기
// saveFile할때 cash수정