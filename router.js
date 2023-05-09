
const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const mirrorSql = require('./script/mirrorSql')
const User = require('./script/User');

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
const server = require('./server.js')

const {WaterUsage} = require('./script/Water')
const {smartMirror} = require('./script/mirrorSql')
const {regionInfo} = require('./script/regionInfo')
const curImgFile = new smartMirror("curimgfile", "None")
const curVideoFile = new smartMirror("curvideofile", "None")
const regionWeatherData = new regionInfo()
const weekData = new WaterUsage('weekuseage', 7, ", Day DESC")
const yearData = new WaterUsage('monthuseage', 12, '')
const repoImgFile = new smartMirror("mirrorimgfile", "reservation")
const repoVideoFile = new smartMirror("mirrorvideofile", "reservation")
const getSmartmirroImgContents = new smartMirror()
const getSmartmirroVideoContents = new smartMirror()


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
router.route('/insertVideo').post(uploadVideo.array('photo', 1), async function (req, res) {
    try{
        let Extension = req.files[0].mimetype

        if (Extension == "video/mp4" || Extension == "video/avi" || Extension == "video/wmv") {
            await curVideoFile.SaveFile(req.files,0)
            await repoVideoFile.SaveFile(req.files,0)
            res.status(201).send('Created')
          }
          else {
            fs.unlink(`smartmirror/video/${req.files[0].filename}`, function (err) {
            })
            res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>")
          }
        await curVideoFile.GetFile()
          res.redirect('mediacontents')
    }catch(err){
        console.log(err)
    }
});

//예약 비디오 파일 저장
router.route('/insertBookingVideo').post(uploadVideo.array('photo', 1), async function (req, res) {
    try{
        let Extension = req.files[0].mimetype
        await repoVideoFile.SaveFile(req.files,req.body.chooseimageday)
    
        if (Extension == "video/mp4" || Extension == "video/avi" || Extension == "video/wmv") {
            await repoVideoFile.SaveFile(req.files,req.body.chooseimageday)
            res.status(201).send('Created')
          }
          else {
            fs.unlink(`smartmirror/video/${req.files[0].filename}`, function (err) {
            })
            res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='bookmedia';</script>")
          }
          res.redirect('bookmedia')
    }catch(err){
        console.log(err)
    }
});

//기본 이미지 파일 저장
router.route('/insertImage').post(uploadImg.array('photo', 1), async function (req, res) {
    try{
        let Extension = req.files[0].mimetype
        if (Extension == "image/jpg" || Extension == "image/png" || Extension == "image/gif" || Extension == "image/jpeg") {
            await curImgFile.SaveFile(req.files,0)
            await repoImgFile.SaveFile(req.files,0)
            res.status(201).send('Created')
          }
          else {
            fs.unlink(`smartmirror/image/${req.files[0].filename}`, function (err) {
            })
            res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>")
          }
          await curImgFile.GetFile()
          res.redirect('mediacontents')
    }catch(err){
        console.log(err)
    }  
});

//예약 이미지 파일 저장
router.route('/insertBookingImage').post(uploadImg.array('photo', 1), async function (req, res) {
    try{
        let Extension = req.files[0].mimetype
        if (Extension == "image/jpg" || Extension == "image/png" || Extension == "image/gif" || Extension == "image/jpeg") {
            await repoImgFile.SaveFile(req.files,req.body.chooseimageday)
            res.status(201).send('Created')
          }
          else {
            fs.unlink(`smartmirror/image/${req.files[0].filename}`, function (err) {
            })
            res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='bookmedia';</script>")
          }
          res.redirect('bookmedia')
    }catch(err){

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
router.delete('/deleteVideo', async function (req, res, next) {
    try {
        await curVideoFile.deletefile(req.files)
        await repoVideoFile.deletefile(req.files)
        res.status(201).send('Deleted')
    } catch (err) {
        console.dir(err.stack);
    }
    res.redirect('mediacontents')
})

//이미지파일 삭제
router.delete('/deleteImage', async function (req, res, next) {
    try {
        await curImgFile.deletefile(req.files)
        await repoImgFile.deletefile(req.files)
        res.status(201).send('Deleted')
    } catch (err) {
        console.dir(err.stack);
    }
    res.redirect('mediacontents')
})

//예약 비디오파일 삭제
router.delete('/deleteReservationVideo', async function (req, res, next) {
    try {
        await repoVideoFile.deletefile(req.files)
        res.status(201).send('Deleted')
    } catch (err) {
        console.dir(err.stack);
    }
    res.redirect('bookmedia')
})

//예약 이미지파일 삭제
router.delete('/deleteReservationImage', async function (req, res, next) {
    try {
        await repoImgFile.deletefile(req.files)
        res.status(201).send('Deleted')
    } catch (err) {
        console.dir(err.stack);
    }
    res.redirect('bookmedia')
})

//관리자 로그인
router.post('/main', async (req, res) => {
    try{
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
            res.status(200).send('Success')
            res.redirect('main')
        }
        else return res.status(404).send({ message: '유저 없음!' })
    }catch(err){
        console.log(err)
    }
});

router.get('/mediacontents', async function (req, res) {
    try {
        if (req.session.logindata) {
            res.render('mediacontents', {
                videoFile: curVideoFile.refContentsArray, imgFile: curImgFile.refContentsArray,
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
        await repoImgFile.GetFile()
        await repoVideoFile.GetFile()
        if (req.session.logindata) {
            res.render('bookmedia', {
                videofile: repoVideoFile.refContentsArray, imgfile: repoImgFile.refContentsArray
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
        if (req.session.logindata) {
            res.render('sub', {
                weekData: weekData, yearData: yearData, videoFile: curVideoFile.refContentsArray, imgFile: curImgFile.refContentsArray,
                localName: regionWeatherData.localName, cityName: regionWeatherData.cityName, villageName: regionWeatherData.villageName,
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
    res.json(curImgFile.refContentsArray)
})

router.get('/smartmirror/video/info', async function (req, res) {
    res.json(curVideoFile.refContentsArray)
})

router.get('/smartmirror/item/info', async function (req, res) {
    const MirrorExe = await mirrorSql.GetData("mirrorexe")
    res.json(MirrorExe)

})

router.get('/smartmirror/weather', async function (req, res) {
    const Weather = await mirrorSql.GetData("Weather")
    res.render('weather', { contents: Weather[0].name, layout: null })
});

router.get('/smartmirror/model', function (req, res) {
    let smartmirrormodel = req.query.id
        res.render('dummy', { contents: smartmirrormodel, layout: null })
})

/*
매니저 페이지 : 최근 5분 내 재생중인 홍보물을 확인하는 페이지
*/
router.get('/smartmirrormanage', function (req, res) {
    try{
        getSmartmirroImgContents.showContents()
        getSmartmirroVideoContents.showContents()
        console.log(getSmartmirroVideoContents.countOfSmartmirror)
        res.render('smartmirrormanage', { videodata: getSmartmirroVideoContents.refContentsArray, imgdata: getSmartmirroImgContents.refContentsArray
            , countOfSmartmirror: getSmartmirroImgContents.countOfSmartmirror })
    }catch(err){
        console.log(err)
    }
})

// 스마트미러의 현재 실행하고 있는 비디오파일와 이미지파일 출력
router.get('/smartmirror/getcontents', function (req, res) {
    try {
        let model = req.query.model //스마트미러 모델명
        let contents = req.query.contents //스마트미러가 보여주는 미디어들
        let kinds = req.query.kinds //스마트미러가 보여주는 미디어들의 종류들 (이미지,비디오)
        console.log(model,contents,kinds)
        if(kinds == 0){ //비디오 출력중
            getSmartmirroVideoContents.getContents(model,contents)
        }
        else { //이미지 출력중
            getSmartmirroImgContents.getContents(model,contents)
        }
        
        res.render('dummy', { layout: null })
    } catch (err) {
        console.log(err)
    }
})

router.post('/smartmirrormanage', function (req, res) {
    try {
        const selectSmartmirror = req.body.setSmartmirror
        getSmartmirroImgContents.getShowSmartmirror(selectSmartmirror)
        getSmartmirroVideoContents.getShowSmartmirror(selectSmartmirror)
        res.status(200).send('Success')
        res.render('smartmirrormanage', {
            selectSmartmirror: selectSmartmirror, countOfSmartmirror: getSmartmirroVideoContents.countOfSmartmirror,
            selectVideo: curVideoFile.refContentsArray[getSmartmirroVideoContents.numberContents].Name,
            selectImage: curImgFile.refContentsArray[getSmartmirroImgContents.numberContents].Name
        })
    } catch (err) {
        console.log(err)
    }
})

router.get('/smartmirror/version', function (req, res) {
    res.render('dummy', { layout: null, contents: mirrorSql.version })
})

router.get('/dummy', function (req, res) {
    res.render('dummy', { weekData: weekData })
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

router.post('/weatherListFinal', async function (req, res) {
    try {
        const name = req.body.name
        const city = req.body.city
        const village = req.body.village
        await regionWeatherData.setPlace(name, city, village)
        mirrorSql.version++
        res.status(200).send('Success')
        res.redirect('main')
    } catch (err) {
        console.log(err)
    }
})

router.post('/weatherList', async function (req, res) {
    try {
        const local = req.body.local
        const city = req.body.city
        await regionWeatherData.selectPlace(local, city)
        res.status(200).send('Success')
        res.redirect('main')
    } catch (err) {
        console.log(err)
    }
})

let io
  module.exports = {
    setIo: function (socketIo) {
      io = socketIo;
    },
    getRouter: function () {
        router.get('/water_useage/daily', async function (req, res) {
            try {
              let waterValue = parseFloat(((req.query.amount) / 1000).toFixed(3))
              weekData.values[0][0] = parseFloat((parseFloat(weekData.values[0][0]) + waterValue).toFixed(3))
              await weekData.getPercent()
              yearData.values[0][0] = parseFloat((parseFloat(yearData.values[0][0]) + waterValue).toFixed(3))
              await yearData.getPercent()
              console.log(yearData.values)
              io.emit('weekendwater', weekData.values[0][0])  //량
              io.emit('waterpercent', weekData.values[1]) //일주일%
              io.emit('weekendTotalUseage', weekData.values[0][0]) //일주일 총%
              io.emit('yearTotalUseage', yearData.values[0][0]) //연총량
              io.emit('MonthTotalUseage', yearData.values[1]) //연총%
              io.emit('yearWater', yearData.values[0][0])
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
      
      return router;
    },
    weekData,
    yearData,
    regionWeatherData,
    curImgFile,
    curVideoFile
  };