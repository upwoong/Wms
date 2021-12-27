
const express = require('express')
, path = require('path')
const expressHandlebars = require('express-handlebars')
const app = express()
const bodyparser = require('body-parser')
, static = require('serve-static')
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
const { constants } = require('http2')
//const { arrayParentSymbol } = require('mongose/lib/helpers/symbools')
mongoose.connect('mongodb+srv://upwoong:ehdrhd12@cluster0.ahlcp.mongodb.net/test', { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('useCreateIndex', true)
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback() {
console.log("mongo db connection OK.");
})
mongoose.set('useFindAndModify', false); //fineOneandupdate 사용하기 위한 구문

//스키마생성
const adminuser = mongoose.Schema({
name: String,
password: String,
})
const usingwater = new mongoose.Schema({
Useage: Number,
Year: String,
Month: String,
Day: String,
Percent: String
})
const clients = new mongoose.Schema({
name: String,
Sex: String,
password: String,
username: String,
comment: [{
    text: String,
    username : String,
    Date : String
}]
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
Data: Number,
Year: String,
Month: String,
Percent: String
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

//Make salt what they will add on hash code
const makeSalt = () =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(64, (err, buf) => {
      if (err) reject(err);
        resolve(buf.toString('base64'));
  });
});

//Make hash password
const createHashPassword = ( plainPassword ) => new Promise(async (resolve, reject) => {
const salt = await makeSalt();
crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
if(err) reject(err);
resolve(key.toString('base64'));
});
});


//Main Schema set
let MemberSchema;
let SupportSchema;
let NoticeSchema;
let CommentSchema;
let TagSchema;
let CalSchema;

//Main Schema Model set
let MemberModel;
let SupportModel;
let NoticeModel;
let CommentModel;
let TagModel;
let CalModel;


//Mongo Schema
//databaseEvent.on('error', console.error.bind(console, 'mongoose connection error'));
//databaseEvent.on('open', function(){
MemberSchema = mongoose.Schema({
id: {type:String, required:false, unique:true},
loginmember: String,
password: { type:String },
username: String,
sex: String,
nfcnumber: String,
syncTime: {type: Date, default: Date.now}
}, { collection: 'member' });

MemberModel = mongoose.model("member", MemberSchema);

SupportSchema = mongoose.Schema({
id: {type:String, required:true, unique:true},
title: String,
sentense: String,
username: String,
syncTime: {type: Date, default: Date.now},
checksum: {type: Boolean, default: false},
}, { collection: 'support' });

SupportModel = mongoose.model("support", SupportSchema);

NoticeSchema = mongoose.Schema({
id: {type:String, required:true, unique:true},
title: String,
image: String,
sentense: String,
username: String,
Number : Number,
syncTime: {type: Date, default: Date.now}
}, { collection: 'notice' });

NoticeModel = mongoose.model("notice", NoticeSchema);

CommentSchema = mongoose.Schema({
id: {type:String, required:true, unique:true},
title: String,
image: String,
from: String,
message: String,
syncTime: {type: Date, default: Date.now}
}, { collection: 'comment' });

CommentModel = mongoose.model("comment", CommentSchema);

TagSchema = mongoose.Schema({
id: {type:String, required:true, unique:true},
faucet: {type:String, required:true},
nfcnumber: String,
username: String,
syncTime: {type: Date, default: Date.now}
}, { collection: 'tag' });

TagModel = mongoose.model("tag", TagSchema);

CalSchema = mongoose.Schema({
syncTime: {type: Date, default: Date.now},
timezone: {type: Date, default: Date.now},
firstWeek: {type: Date, default: Date.now},
lastWeek: {type: Date, default: Date.now}
}, { collection: 'cal' });

CalModel = mongoose.model("cal", CalSchema);

//});


//수전 및 핸드드라이어 스키마, 달력데이터 스키마

//Main Schema
var schema = Graphql.buildSchema(`


scalar DateTime

type MemberList {
id: ID!,
loginmember: String!,
password: String!,
username: String!,
sex: String!,
nfcnumber: String!,
syncTime: DateTime!
}

input MemberJoin {
loginmember: String!,
password: String!,
username: String!,
sex: String!,
nfcnumber: String!
}


type WashiSupport {
id: ID!,
title: String!,
mainSentense: String!,
user: [MemberList]!,
syncTime: DateTime!
}

input WashiSupportRequest {
title: String!,
mainSentense: String!,
user: String!,
}

type WashiNotice {
id: ID!,
title: String,
image: String,
mainSentense: String,
user: [MemberList]!,
syncTime: DateTime!
}

input WashiNoticeInput {
title: String,
image: String,
mainSentense: String,
user: String!,
}

type WashiComment {
id: ID!,
title: String,
image: String,
from: [MemberList]!,
message: String,
syncTime: DateTime!
}

input WashiCommentInput {
title: String,
image: String,
from: String!,
message: String,
}

type WashiTagRead {
id: ID!,
faucet: String,
nfcnumber: [MemberList]!,
username: [MemberList],
syncTime: DateTime
}

input WashiTagWrite {
faucet: String,
nfcnumber: String!,
username: String,
syncTime: DateTime
}

type WashiCalendar {
getState: DateTime,
setState: DateTime,
firstweek: DateTime,
lastweek: DateTime
}



type Query {
getMember(id: ID!) : MemberList,
getSupport(id: ID!) : WashiSupport,
getNotice(id: ID!) : WashiNotice,
getComment(id: ID!) : WashiComment,
getTag(username: [MemberList]) : WashiTagRead,
getCalendar : WashiCalendar
}

type Mutation {
updateMember(id: ID!, input: MemberJoin) : MemberList,
createMember(input: MemberJoin) : MemberList,
deleteMember(id: ID!) : String,
updateSupport(id: ID!, input: WashiSupportRequest) : WashiSupport,
createSupport(input: WashiSupportRequest) : WashiSupport,
deleteSupport(id: ID!) : String,
updateNotice(id: ID!, input: WashiNoticeInput) : WashiNotice,
createNotice(input: WashiNoticeInput) : WashiNotice,
deleteNotice(id: ID!) : String,
updateComment(id: ID!, input: WashiCommentInput) : WashiComment,
createComment(input: WashiCommentInput) : WashiComment,
deleteComment(id: ID!) : String,
signInMember(id: ID!, input: MemberJoin): MemberList,
parsingTag(input: WashiTagWrite): WashiTagRead,
}


`);

//Custom Schema setup line
Object.assign(schema._typeMap.DateTime, {
name: "DateTime",
description: "DateTime type definition line",
serialize: (value) => {
const dateTime = new Date(value);
if(dateTime.toString()==="invalid Date")
{ 
  return null;
}
return dateTime;
}
}); //DateTime setup


// Main Resolver
var root = {
//Member
createMember: async ({ input }) => {
const plainPassword = await input.password.toString();
const salt = await makeSalt();
//Create crypto salt code
const ipassword = await createHashPassword(plainPassword);
//Create date.now(); == moment();
const momenta = moment();
//Main Collection
const Member = new MemberModel({
'id': salt.toString(),
'loginmember': input.loginmember,
'username': input.username,
'password': ipassword.toString(),
'sex': input.sex,
'nfcnumber': input.nfcnumber,
'syncTime': momenta,
});
//Data de-duplication. Key set : id(hash), loginmember: loginID
const memName = await MemberModel.findOne({'loginmember': input.loginmember});
const memID = await MemberModel.findOne({'id': salt});
if(!memName)
{
  if(!memID)
  {
    const Members = await Member.save();
     
    return {
      ...Members._doc,
      id: Members.id.toString(), 
    }
  }
  else if(memID) {
    throw new Error("Already member existed");
  }
} else if(memName) {
    if(memID)
    {
      throw new Error("Already member existed");
    }
    else {
      throw new Error("Already member existed");
    }
    
}
 
},
getMember: async function ({ id }) {
//Find id(hash) key set
const Members = await MemberModel.findOne({id});
if(!Members) {
  throw new Error("No items");
}
return {
  ...Members._doc,
  id: Members.id.toString(), 
}
},
updateMember: async function ({ id, input }) {
//Find id(hash) key set
const Members = await MemberModel.findOne({id});
if(!Members) {
  throw new Error("No items");
}
//Update method
Members.loginmember = input.loginmember;
Members.username = input.username;
Members.password = input.password;
Members.sex = input.sex;
Members.nfcnumber = input.nfcnumber;
const upMembers = await MemberModel.save();
return {
  ...upMembers._doc,
  id: upMembers.id.toString(),
};
},
deleteMember: async function ({ id }) {
//Find id(hash) key set
const Members = await MemberModel.findOne({id});
if(!Members) {
  throw new Error("No items");
}

await MemberModel.findOneAndDelete({id});
return {
  ...MemberModel._doc,
  id: MemberModel.id,
  
}, "delete Complete";
},
//Support
createSupport: async ({ input }) => {
//Create crypto hash code
const id = require('crypto').randomBytes(2).toString('hex');
//MemberList Connection => go to 'user' data set
const Members = await MemberModel.findOne({'username': input.username});
//Create date.now(); == moment();
const momenta = moment();
//Main Collection
const Support = new SupportModel({
'id': id,
'title': input.title,
'mainSentense': input.mainSentense,
'user': Members.username,
'syncTime': momenta,
});
//Data de-duplication. Key set : id(hash)
const supID = await MemberModel.findOne({'id': id});
if(!supID)
{
const Supporter = await Support.save();
return {
...Supporter._doc,
id: Supporter.id.toString(), 
}

} else if(supID) {
throw new Error("Already registered");
}

},
getSupport: async function ({ id }) {
//Find id(hash) key set
const Supporter = await SupportModel.findOne({id});
if(!Supporter) {
throw new Error("No records");
}
return {
...Supporter._doc,
id: Supporter.id.toString(), 
}
},
updateSupport: async function ({ id, input }) {
//Find id(hash) key set
const Supporter = await SupportModel.findOne({id});
if(!Supporter) {
throw new Error("No records");
}
//Update method
Supporter.title = input.title;
Supporter.mainSentense = input.mainSentense;
const upSupport = await SupportModel.save();
return {
...upSupport._doc,
id: upSupport.id.toString(),
};
},
deleteSupport: async function ({ id }) {
//Find id(hash) key set
const Supporter = await SupportModel.findOne({id});
if(!Supporter) {
throw new Error("No records");
}

await SupportModel.findOneAndDelete({id});
return {
...SupportModel._doc,
id: SupportModel.id,

}, "delete Complete";
},
//Notice
createNotice: async ({ input }) => {
//Create crypto hash code
const id = require('crypto').randomBytes(2).toString('hex'); 
//Find MemberList Connection => go to 'user' data set
const Members = await MemberModel.findOne({'username': input.username});
//Create date.now(); == moment();
const momenta = moment();
if(!Members){
  throw new Error("No member");
}

//Main Collection
const Notice = new NoticeModel({
'id': id,
'title': input.title,
'image': input.image,
'mainSentense': input.mainSentense,
'user': Members.username,
'syncTime': momenta,
});
//Data de-duplication. Key set : id(hash)
const notID = await NoticeModel.findOne({'id': id});
if(!notID)  {
  const Notices = await Notice.save();
return {
  ...Notices._doc,
  id: Notices.id.toString(), 
}
  
} else if(notID) {
  throw new Error("Already registered");
}

},
getNotice: async function ({ id }) {
//Find id(hash) key set
const Notices = await NoticeModel.findOne({id});
if(!Notices) {
  throw new Error("No records");
}
return {
  ...Notices._doc,
  id: Notices.id.toString(), 
}
},
updateNotice: async function ({ id, input }) {
//Find id(hash) key set
const Notices = await NoticeModel.findOne({id});
if(!Notices) {
  throw new Error("No records");
}
//Update method
Notices.title = input.title;
Notices.image = input.image;
Notices.mainSentense = input.mainSentense;
const upNotices = await NoticeModel.save();
return {
  ...upNotices._doc,
  id: upNotices.id.toString(),
};
},
deleteNotice: async function ({ id }) {
//Find id(hash) key set
const Notices = await NoticeModel.findOne({id});
if(!Notices) {
  throw new Error("No records");
}

await NoticeModel.findOneAndDelete({id});
return {
  ...NoticeModel._doc,
  id: NoticeModel.id,
  
}, "delete Complete";
},
//Comment
createComment: async ({ input }) => {
  //Create crypto hash code
const id = require('crypto').randomBytes(2).toString('hex');
//Find MemberList Connection => go to 'from' data set
const Members = await MemberModel.findOne({'username': input.username});
//Create date.now(); == moment();
const momenta = moment();
if(!Members){
  throw new Error("No member");
}

//Main Collection
const Comment = new CommentModel({
'id': id,
'title': input.title,
'image': input.image,
'from': Members.username,
'message': input.message,
'syncTime': momenta,
});
//Data de-duplication. Key set : id(hash)
const comID = await CommentModel.findOne({'id': id});
if(!comID)  {
  const Comments = await Comment.save();
return {
  ...Comments._doc,
  id: Comments.id.toString(), 
}
} else if(comID) {
  throw new Error("Already registered");
}

},
getComment: async function ({ id }) {
//Find id(hash) key set
const Comments = await CommentModel.findOne({id});
if(!Comments) {
  throw new Error("No records");
}
return {
  ...Comments._doc,
  id: Comments.id.toString(), 
}
},
updateComment: async function ({ id, input }) {
//Find id(hash) key set
const Comments = await CommentModel.findOne({id});
if(!Comments) {
  throw new Error("No records");
}
//Update method
Comments.title = input.title;
Comments.image = input.image;
Comments.message = input.message;
const upComments = await CommentModel.save();
return {
  ...upComments._doc,
  id: upComments.id.toString(),
};
},
deleteComment: async function ({ id }) {
//Find id(hash) key set
const Comments = await CommentModel.findOne({id});
if(!Comments) {
  throw new Error("No records");
}

await CommentModel.findOneAndDelete({id});
return {
  ...CommentModel._doc,
  id: CommentModel.id,
  
}, "delete Complete";
},
//Tag
getTag: async ({ username }) => {
//Find id(hash) key set
const Tags = await MemberModel.findOne({'username': username.username});
if(!Tags) {
  throw new Error("No records");
}
return {
  ...Comments._doc,
  id: Comments.id.toString(),
}
},
//Calendar
getCalendar: () => {
const getState = moment();
const setState = getState;
const firstWeek = today.clone().startOf('month').week();
const lastWeek = today.clone().endOf('month').week() === 1 ? 53 : today.clone().endOf('month').week();

CalModel.syncTime = setState;
CalModel.timezone = getState;
CalModel.firstWeek = firstWeek;
CalModel.lastWeek = lastWeek;
return {
...CalModel._doc,
syncTime: CalModel.syncTime.toString(), 
}
},
//Login
signInMember: async ({ id, input }) => {
const MemberName = await MemberModel.findOne({'username': input.username});

const makeLoginPassword = (id, plainPassword) =>
new Promise(async (resolve, reject) => {
    const salt = await MemberModel.findOne({})
        .then((result) => result.salt);
    crypto.pbkdf2(plainPassword, salt, 9999, 64, 'sha512', (err, key) => {
        if (err) reject(err);
        resolve(key.toString('base64'));
    });
});


},
/*
//Calendar pasing
parsingTag: ({ input }) => {
const
},*/
};

app.use('/graphql', GraphqlHttp({
schema: schema,
rootValue: root,
graphiql: true,
}))

// 라우터 사용하여 라우팅 함수 등록
var router = express.Router()

var storagevideo = multer.diskStorage({
destination: function (req, file, callback) {
    //변경
    callback(null, '/home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/video')
    //callback(null, 'smartmirror/video')
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
    var files = req.files;
    if (files[0].mimetype == "video/mp4" || files[0].mimetype == "video/avi" || files[0].mimetype == "video/wmv") {
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
    }
    else {
        console.log("옳바른 확장자가 아닙니다.")
        fs.unlink(`smartmirror/video/${files[0].filename}`, function (err) {
            console.log(files[0].filename)
        })
        res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
    }
});

router.route('/processbookingvideo').post(upload.array('photo', 1), function (req, res) {
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
    }
});

//이미지파일

var storageimg = multer.diskStorage({
destination: function (req, file, callback) {
    //변경
    callback(null, '/home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/image')
    //callback(null, 'smartmirror/image')
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
    if (files[0].mimetype == "image/jpg" || files[0].mimetype == "image/png" || files[0].mimetype == "image/gif" || files[0].mimetype == "image/jpeg") {

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
    }
    else {
        console.log("옳바른 확장자가 아닙니다.")
        fs.unlink(`smartmirror/image/${files[0].filename}`, function (err) {
            console.log(files[0].filename)
        })
        res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
    }
} catch (err) {
    console.dir(err.stack);
}
});

//예약 이미지 파일 저장
router.route('/processbookingimage').post(uploadimg.array('photo', 1), function (req, res) {
try {
    var files = req.files;
    if (files[0].mimetype == "image/jpg" || files[0].mimetype == "image/png" || files[0].mimetype == "image/gif" || files[0].mimetype == "image/jpeg") {
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
    }
    else {
        console.log("옳바른 확장자가 아닙니다.")
        fs.unlink(`smartmirror/image/${files[0].filename}`, function (err) {
            console.log(files[0].filename)
        })
        res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
    }
} catch (err) {
    console.dir(err.stack);
}
});


var storageSmartmirror = multer.diskStorage({
destination: function (req, file, callback) {
    //변경
    callback(null, '/home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/item')
    //callback(null, 'smartmirror/item')
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
//스마트 미러 구동파일 교체
router.route('/processSmartmirror').post(uploadSmartmirror.array('photo', 1), function (req, res) {
//변경
///home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/item/Smartmirror.exe
try {
    var files = req.files;
    if (files[0].filename == "SmartMirror.exe") {


        fs.unlink(`/home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/item/Smartmirror.exe`, function (err) {
            if (err) console.log(err)
        })


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
    }
    else {
        console.log("Smartmirror.exe 구동파일이 아닙니다.")
        res.send("<script>alert('Smartmirror.exe 구동파일이 아닙니다.');location.href='smartmirrormanage';</script>");
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

//수전 데이터 초기화
weekendWater[0] = 0

const newDaywateruseage = new Water({ 'Year': year, 'Month': month, 'Day': day, 'Percent': "", 'Useage': 0 })
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
            const changefile = new Smartmirrorvideofile({ 'name': changefilename, 'Date': date, 'type': "reservation" })
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
                const changefile = new Smartmirrorvideofile({ 'name': changefilename, 'type': "None" })
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
const todayDay = moment().format('DD')

const monthdata = new MonthUseage({ 'Data': yearWater, 'Year': todayYear, 'Month': todayMonth })
monthdata.save(function (err, slience) {
    if (err) {
        console.log(err)
        res.status(500).send('update error')
        return
    }
    return console.log("한달 단위 수전사용량 업데이트 완료")
})

console.log("현재 날짜 : " + todayYear + " " + todayMonth + " " + todayDay)
})

//매년 1월에 발생하는 이벤트
var Y = schedule.scheduleJob("0 0 0 0 1 *", function () {
yearWater = new Array() // 올해 총 사용량 초기화

const todayYear = moment().format('YY')
const todayMonth = moment().format('MM')
const todayDay = moment().format('DD')

for (let index = 0; index < 11; index++) {
    const newDaywateruseage = new MonthUseage({ 'Year': todayYear, 'Month': index+1, 'Day': todayDay, 'Percent': "", 'Data': "" })
    newDaywateruseage.save(function (err, slience) {
        if (err) {
            console.log(err)
            res.status(500).send('update error')
            return
        }
        return console.log(index+1 + "월 데이터 생성")
    })
}

console.log("현재 날짜 : " + todayYear + " " + todayMonth + " " + todayDay)
})

app.get('/dkatk', function (req, res) {
let commentarray = new Array()
Client.find(function (err, data) {
    for (let index = 0; index < data.length; index++) {
        if (data[index].name == "박찬종") {
            for (let i = 0; i < data[index].comment.length; i++) {
                let object = new Object()
                object.name = data[index].comment[i].username
                object.text = data[index].comment[i].text
                object.Date = data[index].comment[i].Date
                commentarray.push(object)
            }
            console.log(commentarray)
            res.render('dkatk', { layout: null, commentarray: commentarray })
        }
    }
})
})

app.post('/addcomment', (req, res) => {
const todayDay = moment().format("DD")
const todayMonth = moment().format("MM")
Client.updateOne({'name' : '박찬종'}, {$push :{comment:{'text' : req.body.commentText , 'username' : "coolpaper" , "Date" : todayMonth + todayDay}}}, function(err){
    if(err){
        console.log('댓글 추가 중 에러 발생 : ' +err.stack);

        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>게시판 댓글 추가 중 에러 발생</h2>');
        res.end();
        
        return;           
    }
    
    console.log('댓글 추가 완료 ');
    res.redirect('dkatk')
});
});

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
//변경
///home/hosting_users/creativethon/apps/creativethon_wmsapp/api/기상청41_단기예보 조회서비스_오픈API활용가이드_격자_위경도(20210401).xlsx
const excelFile = xlsx.readFile("/home/hosting_users/creativethon/apps/creativethon_wmsapp/api/기상청41_단기예보 조회서비스_오픈API활용가이드_격자_위경도(20210401).xlsx")
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
}).sort({ Year: -1 }).sort({ Month: -1 }).sort({ Day: -1 }).limit(7)
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
            if(data == "")
            {
                data = "2824561400"
            }
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
                    req.session.save(err => {if(err) console.log(err)})
                    console.log("관리자 로그인 성공")
                    res.redirect('main')
                })
            })
        }).sort({ Date: -1 }).sort({ Hour: -1 }).limit(7)
    }
    else return res.status(404).send({ message: '유저 없음!' });
});
});

router.route('/dlatlinsert').post(upload.array('photo', 1), function (req, res) {
try {
    var files = req.files;
    let name = req.body.name
    let password = req.body.password
    version++
    console.log(files)
    console.log(name)
    console.log(password)

} catch (err) {
    console.dir(err.stack);
}
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
//변경
///home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/video/${name}
fs.unlink(`/home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/video/${name}`, function (err) {
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
//변경
///home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/image/${name}
fs.unlink(`/home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/image/${name}`, function (err) {
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
//변경
///home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/video/${name}
fs.unlink(`/home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/video/${name}`, function (err) {
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
    //변경
    ///home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/image/${name}
    fs.unlink(`/home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/image/${name}`, function (err) {
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
        if (req.session.logindata) {
            res.render('bookmedia', {
                videofile: videoArray, imgfile: imageArray
            })
        }
        else {
            res.render('login', { layout: null })
        }
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
    let Valuedata = new Array()
    for (let index = 0; index < water.length; index++) {
        Valuedata.push(water[index].Useage)
    }
    maxValue = Math.max.apply(null, Valuedata)

    if (weekendWater[0] > maxValue) {
        maxValue = weekendWater[0]
    }
    for (let index = 0; index < weekendWater.length; index++) {
        //weekendWater.push(percent(data[index].Useage, maxValue))
        percentArray[index] = Math.floor(percent(weekendWater[index], maxValue))
    }
    Smartmirrorvideofile.find(function (err, videofile) {
        Smartmirrorimagefile.find(function (err, imgfile) {
            if (req.session.logindata) {
                res.render('sub', {
                    accessmanage: water, percentArray: percentArray, weekendWater: weekendWater, videofile: videofile, imgfile: imgfile, water: usewater, remainwater: remainwater,
                    contents: localname, cityname: cityname, village: villagename, selectcityname: selectcityname, selectvillagename: selectvillagename
                })
            }
            else {
                res.render('login', { layout: null })
            }
        })
    })
}).sort({ Year: -1 }).sort({ Month: -1 }).sort({ Day: -1 }).limit(7)
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
/*
Imgfile.find({}, imgProjection, function (err, data) {
    if (err) return next(err);
    res.json(data)
})*/

Smartmirrorimagefile.find({}, videoProjection, function (err, data) {
    if (err) return next(err)
    res.json(data)
})

})

//스마트미러에 비디오파일 목록 보내기
app.get('/smartmirror/video/info', function (req, res) {
/*
Videofilesave.find({}, videoProjection, function (err, data) {
    if (err) return next(err)
    res.json(data)
})*/

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
//스마트미러에 기상청 행정구역코드 보내기
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
console.log(receivehand)
console.log(receivegas)
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
const todayDay = moment().format('DD')
const todayYear = moment().format('YY')
const todayMonth = moment().format('MM')
let watervalue = 3
let pushwatervalue = 0
let plusdayvalue = 0
let percentArray = new Array()
let yearpercentArray = new Array()
app.get('/testwater_recieve', function (req, res) {
watervalue = req.query.id
const todayYear = moment().format('YY')
const todayMonth = moment().format('MM')
const todayDay = moment().format('DD')
pushwatervalue = parseFloat(watervalue)
plusdayvalue = parseFloat(plusdayvalue) + (parseFloat(watervalue) / 1000)

weekendWater[0] = plusdayvalue.toFixed(3)
if (weekendWater[0] > maxValue) {
    maxValue = weekendWater[0]
}
for (let index = 0; index < weekendWater.length; index++) {
    //weekendWater.push(percent(data[index].Useage, maxValue))
    percentArray[index] = Math.floor(percent(weekendWater[index], maxValue))
}
console.log("현재 수전 사용 수치 : " + watervalue + "mL")
console.log("누적 수전 사용 수치 : " + weekendWater[0])
Water.findOneAndUpdate({ 'Year': todayYear, 'Month': todayMonth, 'Day': todayDay},{$set:{'Useage' : weekendWater[0]}}, (err, data) => {
    if(err) console.log(err)
    else console.log("저장완료")
})
//yearWater[0] = yearWater[0] + (parseInt(watervalue) / 1000)
yearWater[todayMonth - 1] = (parseFloat(yearWater[todayMonth - 1]) + (parseFloat(watervalue) / 1000)).toFixed(3)
if (yearWater[todayMonth-1] > maxyearValue) {
    maxyearValue = yearWater[todayMonth-1]
}
for (let index = 0; index < yearWater.length; index++) {
    //weekendWater.push(percent(data[index].Useage, maxValue))
    yearpercentArray[index] = Math.floor(percent(yearWater[index], maxyearValue))
}
//연결이 들어오면 실행되는 이벤트
io.emit('weekendwater', weekendWater[0])
io.emit('waterpercent', percentArray)
io.emit('wateryearpercent', yearpercentArray)
io.emit('yearWater', yearWater[todayMonth-1])
res.render('dkatk', { layout: null, watervalue: watervalue })
})

let getnfc = ""
let count = 0
let testvalue = ""
app.get('/nfc_recieve', function (req, res) {
getnfc = req.query.id
console.log(console.log(moment().format('MMDD:hh:mm:ss')) + "adwwad")
if (testvalue) {
    count++
    testvalue = ""
}
io.emit('testcount', count)
io.emit('getnfc', getnfc)
res.render('dkatk', { layout: null })
})

let gassensor = "2"
let receivegas = "2"
app.get('/test_gassensor', function (req, res) {
gassensor = req.query.id
receivegas = parseInt(gassensor)
if (pushwatervalue) {


    pushwatervalue = ""
}
console.log(gassensor)
io.emit('getgassensor', gassensor)
res.render('dkatk', { layout: null })
})

let hand = "2"
let receivehand = "2"
app.get('/test_remain', function (req, res) {
hand = req.query.id
receivehand = parseInt(hand)
console.log(moment().format('MMDD:hh:mm')+hand)
io.emit('remain', hand)
res.render('dkatk', { layout: null })
})
app.get('/wateruseage', function (req, res) {
Water.find(function (err, data) {
    MonthUseage.find(function (err, yeardata) {
        const todayYear = moment().format('YY')
        const currentmonth = moment().format('MM')
        let lastMonth = ""
        let currentMonth = ""
        let Valuedata = new Array()
        for (let index = 0; index < data.length; index++) {
            Valuedata.push(data[index].Useage)
        }
        maxValue = Math.max.apply(null, Valuedata)
        let Valueyeardata = new Array()
        for (let index = 0; index < yeardata.length; index++) {
            if (yeardata[index].Year == todayYear)
                Valueyeardata.push(yeardata[index].Data)
        }
        maxyearValue = Math.max.apply(null, Valueyeardata)

        //저번달 총,이번달 총 사용량 구하기
        for (let index = 0; index < yeardata.length; index++) {
            if (yeardata[index].Month == currentmonth-1)
            {
                lastMonth = yeardata[index].Data
                currentMonth = yeardata[index+1].Data
                
            }
        }
        if (weekendWater[0] > maxValue) {
            maxValue = weekendWater[0]
        }

        if (yearWater[currentmonth] > maxyearValue) {
            maxyearValue = yearWater[currentmonth]
        }

        for (let index = 0; index < weekendWater.length; index++) {
            //weekendWater.push(percent(data[index].Useage, maxValue))
            percentArray[index] = Math.floor(percent(weekendWater[index], maxValue))
        }

        for (let index = 0; index < yearWater.length; index++) {
            //weekendWater.push(percent(data[index].Useage, maxValue))
            yearpercentArray[index] = Math.floor(percent(yearWater[index], maxyearValue))
        }
        
        res.render('wateruseage', {
            data: data, yeardata: yeardata, selectcityname: selectcityname, selectvillagename: selectvillagename, weekendWater: weekendWater,
            percentArray: percentArray, yearWater: yearWater, yearpercentArray: yearpercentArray, lastMonth : lastMonth, currentMonth : currentMonth
        })

    }).sort({ Year: 1 }).sort({ Month: 1 }).limit(12)
}).sort({ Year: -1 }).sort({ Month: -1 }).sort({ Day: -1 }).limit(7)

testvalue = "aaaa"
})
//const user = new Water({ 'name': "132", 'Date' : valuedata, 'Hour' : "18 : 10" })

// 퍼센트 구하는 함수 ex) percetn(50,100) = 50
function percent(par, total) {
return (par / total) * 100
}

//초기 7일간 데이터중 가장 높은 일자의 값 구하기 설정
let maxValue = 0
Water.find(function (err, data) {
//maxValue = Math.max(...data.Date) //ES6 문법이기 때문에 안되면 const maxValue = Math.max.apply(null, data) 를 사용
let Valuedata = new Array()
for (let index = 0; index < data.length; index++) {
    Valuedata.push(data[index].Useage)
}
maxValue = Math.max.apply(null, Valuedata)
}).sort({ Year: 1 }).sort({ Month: -1 }).sort({ Day: -1 }).limit(7) //추후엔 Month 와 Day로 나누기 때문에 각각에 sort정렬을 해줘야 최신 데이터가 나옴


//초기 1년간 데이터중 가장 높은 달의 값 구하기 설정
let maxyearValue = 0
MonthUseage.find(function (err, data) {
//maxValue = Math.max(...data.Date) //ES6 문법이기 때문에 안되면 const maxValue = Math.max.apply(null, data) 를 사용
let Valueyeardata = new Array()
for (let index = 0; index < data.length; index++) {
    if (data[index].Year == todayYear)
        Valueyeardata.push(data[index].Data)
}
maxyearValue = Math.max.apply(null, Valueyeardata)
}).sort({ Year: 1 }).sort({ Month: 1 }).sort({ Day: 1 }).limit(12) //추후엔 Month 와 Day로 나누기 때문에 각각에 sort정렬을 해줘야 최신 데이터가 나옴



// 수전데이터 받기전 일주일 데이터 기초 설정
let weekendWater = new Array()
Water.find(function (err, data) {
for (let index = 0; index < data.length; index++) {
    //weekendWater.push(parseInt(percent(data[index].Useage, maxValue)))
    weekendWater.push(parseInt(data[index].Useage))
}
}).sort({ Year: 1 }).sort({ Month: -1 }).sort({ Day: -1 }).limit(7)

//수전데이터 받기전 1년 데이터 기초 설정
let yearWater = new Array()
MonthUseage.find(function (err, data) {
for (let index = 0; index < data.length; index++) {
    if (data[index].Year == todayYear)
        yearWater.push(parseInt(data[index].Data))
}
}).sort({ Year: 1 }).sort({ Month: 1 }).limit(12)


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

for (let index = 0; index < weekendWater.length; index++) {
//weekendWater.push(percent(data[index].Useage, maxValue))
percentArray[index] = Math.floor(percent(weekendWater[index], maxValue))
}

for (let index = 0; index < yearWater.length; index++) {
//weekendWater.push(percent(data[index].Useage, maxValue))
yearpercentArray[index] = Math.floor(percent(yearWater[index], maxyearValue))
}
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
});


let listint = []
let clientpage
app.get('/clientlist/:page', function (req, res) {
clientpage = req.params.page
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
        res.render('clientlist', { contents: pageContents, pagination: pagenum, count: listint })
    })
})
})

app.post('/clientlist', function (req, res) {
let divisionpage = clientpage / 5

})

app.get('/notice',function(req,res){
let commentarray = new Array()
Client.find(function (err, data) {
    for (let index = 0; index < data.length; index++) {
        if (data[index].name == "박찬종") {
            for (let i = 0; i < data[index].comment.length; i++) {
                let object = new Object()
                object.name = data[index].comment[i].username
                object.text = data[index].comment[i].text
                object.Date = data[index].comment[i].Date
                commentarray.push(object)
            }
            res.render('notice', { commentarray: commentarray })
        }
    }
})
})
app.get('/noticecreate',function(req,res){
res.render('noticecreate')
})
app.get('/noticelist',function(req,res){
clientpage = req.params.page
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
        res.render('noticelist', {layout : null, contents: pageContents, pagination: pagenum, count: listint })
    })
})
})
app.get('/inquirylist',function(req,res){
res.render('inquirylist',{layout : null})
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