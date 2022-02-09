const express = require('express')
    , path = require('path')
const expressHandlebars = require('express-handlebars')
const app = express()
const bodyparser = require('body-parser')
    , static = require('serve-static')
    app.use(express.json());
    app.use(express.urlencoded({extended:true}));
    const crypto = require('crypto')
require('moment-timezone');
const cheerio = require('cheerio');
const moment = require('moment');
const request = require('request');
const schedule = require('node-schedule')
let multer = require('multer');
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
//데이터베이스 초기설정
const mongoose = require('mongoose')
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
            maxAge : (3.6e+6)*24
        },
    })
)
    

mongoose.connect('mongodb+srv://upwoong:ehdrhd12@cluster0.ahlcp.mongodb.net/test?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
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
        username: String,
        Date: String
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
    Month: Number,
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

let videoProjection = {
    __v: false,
    _id: false,
    locations: false
};

let imgProjection = {
    __v: false,
    _id: false,
};
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


function getCurrentDate(){
    const dateNow = new Date();
    var year = dateNow.getFullYear();
    var month = dateNow.getMonth();
    var today = dateNow.getDate();
    var hours = dateNow.getHours();
    var minutes = dateNow.getMinutes();
    var seconds = dateNow.getSeconds();
    var milliseconds = dateNow.getMilliseconds();
    return new Date(Date.UTC(year, month, today, hours, minutes, seconds, milliseconds));
  }
  
  function getToday(){
    const dateNow = new Date();
    var year = dateNow.getFullYear();
    var month = dateNow.getMonth();
    var today = dateNow.getDate();
    return new Date(Date.UTC(year, month, today));
  }
  
  function getTomorrow(){
    const dateNow = new Date();
    var year = dateNow.getFullYear();
    var month = dateNow.getMonth();
    var today = dateNow.getDate() + 1;
    return new Date(Date.UTC(year, month, today));
  }



  let MemberSchema;
let SupportSchema;
let NoticeSchema;
let CommentSchema;
let TagSchema;
let CalSchema;
let HWSchema;
let FindSchema;

//Main Schema Model set
let MemberModel;
let SupportModel;
let NoticeModel;
let CommentModel;
let CalModel;
let HWModel;
let FindModel;


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
  admin: {type:Number, required:true},
  todayTag: Number,
  syncTime: {type: Date, default: Date.now}
}, { collection: 'member' });

MemberModel = mongoose.model("member", MemberSchema);

SupportSchema = mongoose.Schema({
  id: {type:String, required:true},
  title: String,
  sentense: String,
  username: String,
  syncTime: {type: Date, default: Date.now},
  checksum: Number,
}, { collection: 'support' });

SupportModel = mongoose.model("support", SupportSchema);

NoticeSchema = mongoose.Schema({
  id: {type:String, required:true, unique:true},
  title: String,
  image: String,
  mainSentense: String,
  user: String,
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
  connectHW: String,
  faucet: Number,
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

HWSchema = mongoose.Schema({
  registryHW: {type:String, unique:true},
  syncTime: {type: Date, default: Date.now}
}, { collection: 'HW' });

HWModel = mongoose.model("HW", HWSchema);

FindSchema = mongoose.Schema({
  connectHW: String,
  faucet: Number,
  nfcnumber: String,
  username: String,
  syncTime: {type: Date, default: Date.now},
  firstTime: {type: Date, default: Date.now},
  lastTime: {type: Date, default: Date.now}
}, { collection: 'find' });

FindModel = mongoose.model("find", FindSchema);

//});


//수전 및 핸드드라이어 스키마, 달력데이터 스키마

//Main Schema
var schema = Graphql.buildSchema(`


scalar DateTime

type MemberList {
  id: ID!,
  loginmember: String!,
  password: String,
  username: String!,
  sex: String!,
  nfcnumber: String!,
  admin: Int!,
  todayTag: Int,
  syncTime: DateTime!
}

input MemberJoin {
  loginmember: String!,
  password: String,
  username: String!,
  sex: String!,
  nfcnumber: String!,
  admin: Int!
}

input signInMember {
  username: String!,
  password: String,
}

type WashiSupport {
  id: ID!,
  title: String,
  sentense: String,
  username: String,
  checksum: Int!,
  syncTime: DateTime!
}

type SupportData {
  products: [WashiSupport]
}

input WashiSupportRequest {
  title: String,
  sentense: String,
  username: String!,
  checksum: Int,
}

type WashiNotice {
  id: ID!,
  title: String,
  image: String,
  mainSentense: String,
  user: String,
  syncTime: DateTime!
}

type NoticeData {
  products: [WashiNotice]
}

input WashiNoticeInput {
  title: String,
  image: String,
  mainSentense: String,
  user: String,
}

type WashiComment {
  id: ID!,
  title: String,
  image: String,
  from: String,
  message: String,
  syncTime: DateTime!
}

type CommentData {
  products: [WashiComment]
}

input WashiCommentInput {
  title: String,
  image: String,
  from: String,
  message: String,
}

type WashiTagRead {
  connectHW: String,
  faucet: Int,
  nfcnumber: String,
  username: String,
  syncTime: DateTime
}

type TagData {
  products: [WashiTagRead]
}

input WashiTagWrite {
  connectHW: String,
  faucet: String,
  nfcnumber: String,
  username: String,
  syncTime: DateTime
}

type WashiCalendar {
  getState: DateTime,
  setState: DateTime,
  firsttime: DateTime,
  lasttime: DateTime
}

type WashiFindRead {
  connectHW: String,
  faucet: Int,
  nfcnumber: String,
  username: String,
  syncTime: DateTime,
  firstTime: DateTime,
  lastTime: DateTime
}

type FindData {
  products: [WashiFindRead]
}

input WashiTimeSet {
  username: String,
  syncTime: DateTime,
  firstT: DateTime,
  lastTime: DateTime
}

type WashiHW {
  registryHW: String,
  syncTime: DateTime
}

type HWData {
  products: [WashiHW]
}


  type Query {
    getMember(loginmember: String!) : MemberList,
    getSupport(username: String) : SupportData,
    getNotice(user: String): NoticeData,
    getComment(from: String) : CommentData,
    getTag(username: String) : TagData,
    
  }

  type Mutation {
    updateMember(loginmember: String, input: MemberJoin) : MemberList,
    createMember(input: MemberJoin) : MemberList,
    deleteMember(loginmember: String!) : String,
    updateSupport(id: ID!, input: WashiSupportRequest) : WashiSupport,
    createSupport(input: WashiSupportRequest) : WashiSupport,
    deleteSupport(id: ID!) : String,
    updateNotice(user: String!, input: WashiNoticeInput) : WashiNotice,
    createNotice(input: WashiNoticeInput) : WashiNotice,
    deleteNotice(user: String!) : String,
    updateComment(id: ID!, input: WashiCommentInput) : WashiComment,
    createComment(input: WashiCommentInput) : WashiComment,
    deleteComment(id: ID!) : String,
    signInMember( input: signInMember): MemberList,
    parsingTag(input: WashiTagWrite): WashiTagRead,
    findDate(input: WashiTimeSet): FindData,
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
        //Make salt what they will add on hash code
        const memberSalt = require('crypto').randomBytes(32).toString('hex');
        //Make hash password
        const ipassword = crypto.pbkdf2Sync(plainPassword, memberSalt, 65536, 32, 'sha512').toString('hex');
        //Make Date()
         const momenta = getCurrentDate();
    //Main Collection
    const Member = new MemberModel({
    'id': memberSalt.toString(),
    'loginmember': input.loginmember,
    'username': input.username,
    'password': ipassword.toString(),
    'sex': input.sex,
    'nfcnumber': input.nfcnumber,
    'admin': input.admin,
    'syncTime': momenta,
    });
    //Data de-duplication. Key set : id(hash), loginmember: loginID
    const memName = await MemberModel.findOne({'loginmember': input.loginmember});
    const memID = await MemberModel.findOne({'id': memberSalt});
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
  getMember: async function ({ loginmember }) {
    //Find id(hash) key set
    const Members = await MemberModel.findOne({loginmember});
    if(!Members) {
      throw new Error("No items");
    }

    const firstTime = getToday();
    const lastTime = getTomorrow();
    const tagCount = await TagModel.find({
      'username': Members.username,
      'syncTime': {
        "$gte": firstTime,
        "$lt": lastTime,
      },
    }).count();

    Members.todayTag = tagCount;
    return {
      ...Members._doc,
      loginmember: Members.loginmember.toString(),
    } 
  },
  updateMember: async function ({ loginmember, input }) {
    //Find id(hash) key set
    const Members = await MemberModel.findOne({loginmember});
    if(!Members) {
      throw new Error("No items");
    }
      // Find salt and washipassword
      const isalt2 = await Members.id.toString();
      // Insert New password
      const updatePassword = await input.password.toString();
      const makeUpdatePassword = crypto.pbkdf2Sync(updatePassword, isalt2, 65536, 32, 'sha512').toString('hex');
    //Update method
    Members.username = input.username;
    Members.password = makeUpdatePassword;
    Members.sex = input.sex;
    Members.nfcnumber = input.nfcnumber;
    Members.admin = input.admin;
    const upMembers = await Members.save();
    return {
      ...upMembers._doc,
      loginmember: upMembers.loginmember.toString(),
    };
  },
  deleteMember: async function ({ loginmember }) {
    //Find id(hash) key set
    const Members = await MemberModel.findOne({loginmember});
    if(!Members) {
      throw new Error("No items");
    }

    await MemberModel.findOneAndDelete({loginmember});
    return {
      ...MemberModel._doc,
      loginmember: MemberModel.loginmember,
      
    }, "delete Complete";
  },
//Support
createSupport: async ({ input }) => {
  //Create crypto hash code
  const id = await SupportModel.count() + 1; 
  //MemberList Connection => go to 'user' data set
  const Members = await MemberModel.findOne({'username': input.username});
  if(!Members){
    throw new Error("No member");
  }
  //Create date.now(); == moment();
  const momenta = getCurrentDate();
  let chksum = 0;
  //Main Collection
  const Support = new SupportModel({
  'id': id,
  'title': input.title,
  'sentense': input.sentense,
  'username': input.username,
  'checksum': chksum,
  'syncTime': momenta,
  });
    const Supporter = await Support.save();
  return {
    ...Supporter._doc,
    id: Supporter.id.toString(),
  }
    
   
  
},
getSupport: async function ({ username }) {
  //Find id(hash) key set
  const Supporter = await SupportModel.find({username});
  if(!Supporter) {
    throw new Error("No records");
  }
  return {
    products: Supporter.map((q) => {
      return {
        ...q._doc,
    username: q.username.toString(), 
      };
    })
  };
},
updateSupport: async function ({ id, input }) {
  //Find id(hash) key set
  const Supporter = await SupportModel.findOne({id});
  if(!Supporter) {
    throw new Error("No records");
  }
  //Update method
  Supporter.title = input.title;
  Supporter.sentense = input.sentense;
  Supporter.username = input.username;
  Supporter.checksum = input.checksum;
  const upSupport = await Supporter.save();
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
    const id = await NoticeModel.count() + 1; 
  //Find MemberList Connection => go to 'user' data set
    const Members = await MemberModel.findOne({'username': input.user});
  //Create date.now(); == moment();
  const momenta = getCurrentDate();
    if(!Members){
      throw new Error("No member");
    }

  //Main Collection
    const Notice = new NoticeModel({
    'id': id,
    'title': input.title,
    'image': input.image,
    'mainSentense': input.mainSentense,
    'user': input.user,
    'syncTime': momenta,
    });
      const Notices = await Notice.save();
    return {
      ...Notices._doc,
      user: Notices.user.toString(), 
    }
      
    
  },
  getNotice: async function ({user}) {
    //Find id(hash) key set
    const Notices = await NoticeModel.find({user});
    if(!Notices) {
      throw new Error("No records");
    }
        return {
          products: Notices.map((q) => {
            return {
              ...q._doc,
              user: q.user.toString(), 
            };
          })
         
        };
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
    const id = await CommentModel.count() + 1;
    //Find MemberList Connection => go to 'from' data set
    const Members = await MemberModel.findOne({'username': input.from});
    //Create date.now(); == moment();
    const momenta = getCurrentDate();
    if(!Members){
      throw new Error("No member");
    }

  //Main Collection
    const Comment = new CommentModel({
    'id': id,
    'title': input.title,
    'image': input.image,
    'from': input.from,
    'message': input.message,
    'syncTime': momenta,
    });

      const Comments = await Comment.save();
    return {
      ...Comments._doc,
      id: Comments.id.toString(), 
    }

  },
  getComment: async function ({ from }) {
    //Find id(hash) key set
    const Comments = await CommentModel.find({from});
    if(!Comments) {
      throw new Error("No records");
    }
    return {
      products: Comments.map((q) => {
        return {
          ...q._doc,
      from: q.from.toString(), 
        };
      })
    };
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
    const upComments = await Comments.save();
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
    const Tags = await TagModel.find({username});
    if(!Tags) {
      throw new Error("No records");
    }
    return {
      products: Tags.map((q) => {
        return {
          ...q._doc,
      _id: q._id.toString(), 
        };
      })
    };
  },

  parsingTag: async ({ input }) => {
    //Find HW
    const findHW = await HWModel.findOne({'registryHW': input.connectHW});
    const timeNow = getCurrentDate();
    const counter = 1;
    if(!findHW) {
      throw new Error("Can't find HW");
    }

  //Main Collection
  const ConnectModel = new TagModel({
    'connectHW': input.connectHW,
    'faucet': counter,
    'nfcnumber': input.nfcnumber,
    'username': input.username,
    'syncTime': timeNow,
    });
    const HWset = await ConnectModel.save();
    return {
      ...HWset._doc,
      connectHW: HWset.connectHW.toString(), 
    }
  },
  //Calendar
  getCalendar: async () => {
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
  signInMember: async ({ input }) => {
    // Find username
      const memberName = await MemberModel.findOne({ 'loginmember': input.username });
      //Find user
      if (!memberName) {
          if (input.username == "") {
              throw new Error("Please insert your id first");
          }
          else {
              throw new Error("No users");
          }
      }
      // Make salt and washipassword
      const isalt = await memberName.id.toString();
      const memberPassword = await memberName.password.toString();
      // Insert New password
      const plainPassword2 = await input.password.toString();
      const makeLoginPassword = crypto.pbkdf2Sync(plainPassword2, isalt, 65536, 32, 'sha512').toString('hex')
      //Get tag list
     const firstTime = getToday();
     const lastTime = getTomorrow();
     const tagCount = await TagModel.find({
      'username': memberName.username,
      'syncTime': {
        "$gte": firstTime,
        "$lt": lastTime,
       },
     }).count();

     memberName.todayTag = tagCount;
      //If you don't write Password, throw this error.
      if (plainPassword2 == "") {
          throw new Error("Please Insert your password");
      }
      //비밀번호가 맞는지 판단 후 콘솔로그로 정보 전달. 이후에 DB에 토큰 값 저장 진행 -> 판단 확인 요청
      if (makeLoginPassword == memberPassword) {
      console.log("sign in");
          return {
              ...memberName._doc,
              loginmember: memberName.loginmember.toString(),
          }
      }
      else if (makeLoginPassword != memberPassword) {
        throw new Error("Password doesn't match.");
    }
    

  },

  //Find Date
  findDate: async function({ input }) {
    //시작 날짜와 끝 날짜를 입력하여 사이의 값 추출
    const firsto = input.firstT;
    const lasto = input.lastTime;
    const memberDate = await TagModel.find({
      where: {
        username: input.username,
        syncTime: {
          $gte: firsto,
          $lt: lasto,
        }
      },
     });
    if(!memberDate) {
      throw new Error("No users");
    }

    return {
      products: memberDate.map((q) => {
        return {
          ...q._doc,
      username: q.username.toString(), 
        };
      })
    };

  },
 
};


app.use('/graphql', GraphqlHttp({
    schema: schema,
    rootValue: root,
    graphiql: true,
}))

const todayDay = moment().format('DD')
const todayYear = moment().format('YY')
const todayMonth = moment().format('MM')

//비디오파일 저장 위치
//비디오를 저장할때 필요한 코드입니다.
//로컬서버로 돌릴때와 카페24 서버에서 돌릴때의 파일 저장위치가 다르기때문에 계속 바꾸어줘야 합니다.
let storagevideo = multer.diskStorage({
    destination: function (req, file, callback) {
        //변경
        callback(null, '/home/hosting_users/creativethon/apps/creativethon_wmswebsite/smartmirror/video')
        //callback(null, 'smartmirror/video')
    },
    filename: function (req, file, callback) {
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        basename = basename.replace(/(\s*)/g, "")
        callback(null, basename + extension);
    }
});

let upload = multer({
    storage: storagevideo, // storage 객체
    limits: {
        files: 10, // 한번에 업로드할 수 있는 파일 개수
        fileSize: 1024 * 1024 * 1024
    }
});
//기본 비디오 파일 저장
router.route('/processvideo').post(upload.array('photo', 1), function (req, res) {
    let files = req.files; //업로드 버튼을 누르면 files[0] 에 추가가 됩니다.
    if (files[0].mimetype == "video/mp4" || files[0].mimetype == "video/avi" || files[0].mimetype == "video/wmv") {
        //files[0].mimetype 는 업로드한 파일의 파일 형식입니다. mp4,avi,wmv 형식이 아닌 파일이 추가되면 경고문이 뜨며 추가가 안됩니다.
        version++ 
        //version++은 스마트미러의 버전 상태를 나타내줍니다. version의 값이 올라가면 스마트미러가 올라간 version값을 읽으며
        //모든 스마트미러를 새로고침합니다.
        //스마트미러는 10초 주기로 version의 값을 체크하며 version의 값이 변경되면 스스로 새로고침을 수행합니다.

        if (files.length > 0) {
            console.dir(files[0]);

            // 현재의 파일 정보를 저장할 변수 선언
            let originalname = '',
                filename = '',
                mimetype = '',
                size = 0;

            if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)

                for (let i = 0; i < files.length; i++) {
                    originalname = files[i].originalname;
                    filename = files[i].filename;
                    mimetype = files[i].mimetype;
                    size = files[i].size;
                }
            }

            //Smartmirrorvideofile 컬렉션은 현재 스마트미러에 보여주는 미디어들을 저장하고 보여주는 컬렉션입니다.
            //이 코드는 만약 Smartmirrorvideofile 컬렉션이 비어있어 아무파일도 없거나 type이 None일 경우에 
            //바로 Smartmirrorvideofile에 추가하여 바로 반영할수 있도록 합니다.
            Smartmirrorvideofile.find(function (err, data) {
                if (data == "" || data[0].type == "None") { //컬렉션이 비어있거나 type이 None일 경우를 판별합니다
                    //비디오파일을 추가하는 코드입니다.
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

            //기본적으로 Videofilesave 컬렉션에 tpye이 None인 파일과 reservation인 파일을 모두 저장합니다.
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
        //만약 정해진 파일형식이 아닌 다른 형식의 파일을 추가했을 경우 이 코드에서 파일을 삭제해주는 역할을 합니다.
        fs.unlink(`smartmirror/video/${files[0].filename}`, function (err) {
            console.log(files[0].filename)
        })
        //alert경고문을 출력해주고 페이지를 새로고침합니다.
        res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
    }
});

//예약 비디오파일 저장
//방식은 위에있은 기본 비디오파일 저장과 똑같습니다. 다만 이 코드에서는 달력에있는 날짜를 체크하기 때문에 이 날짜를 selectday 변수에 추가하고
//Videofilesave 컬렉션에 Date 부분에 추가가 됩니다.
router.route('/processbookingvideo').post(upload.array('photo', 1), function (req, res) {
    let files = req.files;
    if (files[0].mimetype == "video/mp4" || files[0].mimetype == "video/avi" || files[0].mimetype == "video/wmv") {
        let selectday = req.body.chooseimageday
        const strArr = selectday.split('-')
        const month = strArr[1]
        const day = strArr[2]
        const currentday = strArr[1] + strArr[2]
        console.log("month :" + month + "day :" + day)
        version++

        if (files.length > 0) {
            console.dir(files[0]);

            // 현재의 파일 정보를 저장할 변수 선언
            let originalname = '',
                filename = '',
                mimetype = '',
                size = 0;

            if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)

                for (let i = 0; i < files.length; i++) {
                    originalname = files[i].originalname;
                    filename = files[i].filename;
                    mimetype = files[i].mimetype;
                    size = files[i].size;
                }
            }

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
    else {
        console.log("옳바른 확장자가 아닙니다.")
        fs.unlink(`smartmirror/video/${files[0].filename}`, function (err) {
            console.log(files[0].filename)
        })
        res.send("<script>alert('옳바른 확장자가 아닙니다.');location.href='mediacontents';</script>");
    }

});

//이미지파일 저장 위치
//비디오파일과 형식이 같습니다.
let storageimg = multer.diskStorage({
    destination: function (req, file, callback) {
        //변경
        callback(null, '/home/hosting_users/creativethon/apps/creativethon_wmswebsite/smartmirror/image')
        //callback(null, 'smartmirror/image')
    },
    filename: function (req, file, callback) {
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        basename = basename.replace(/(\s*)/g, "")
        callback(null, basename + extension);
    }
});

let uploadimg = multer({
    storage: storageimg, // storage 객체
    limits: {
        files: 10, // 한번에 업로드할 수 있는 파일 개수
        fileSize: 1024 * 1024 * 1024
    }
});

//기본 이미지 파일 저장
router.route('/processimage').post(uploadimg.array('photo', 1), function (req, res) {
    try {
        let files = req.files;
        if (files[0].mimetype == "image/jpg" || files[0].mimetype == "image/png" || files[0].mimetype == "image/gif" || files[0].mimetype == "image/jpeg") {

            version++

            if (files.length > 0) {
                console.dir(files[0]);

                // 현재의 파일 정보를 저장할 변수 선언
                let originalname = '',
                    filename = '',
                    mimetype = '',
                    size = 0;

                if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)


                    for (let i = 0; i < files.length; i++) {
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
        let files = req.files;
        if (files[0].mimetype == "image/jpg" || files[0].mimetype == "image/png" || files[0].mimetype == "image/gif" || files[0].mimetype == "image/jpeg") {
            let selectday = req.body.chooseimageday
            const strArr = selectday.split('-');
            const month = strArr[1]
            const day = strArr[2]
            const currentday = strArr[1] + strArr[2]
            console.log("month :" + month + "day :" + day)
            version++

            if (files.length > 0) {
                console.dir(files[0]);

                // 현재의 파일 정보를 저장할 변수 선언
                let originalname = '',
                    filename = '',
                    mimetype = '',
                    size = 0;

                if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)


                    for (let i = 0; i < files.length; i++) {
                        originalname = files[i].originalname;
                        filename = files[i].filename;
                        mimetype = files[i].mimetype;
                        size = files[i].size;
                    }
                }


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

//스마트미러 구동파일 위치 저장
//비디오파일과 형식이 같습니다.
let storageSmartmirror = multer.diskStorage({
    destination: function (req, file, callback) {
        //변경
        callback(null, '/home/hosting_users/creativethon/apps/creativethon_wmswebsite/smartmirror/item')
        //callback(null, 'smartmirror/item')
    },
    filename: function (req, file, callback) {
        let extension = path.extname(file.originalname);
        let basename = path.basename(file.originalname, extension);
        basename = basename.replace(/(\s*)/g, "")
        callback(null, basename + extension);
    }
});


let uploadSmartmirror = multer({
    storage: storageSmartmirror, // storage 객체
    limits: {
        files: 10, // 한번에 업로드할 수 있는 파일 개수
        fileSize: 1024 * 1024 * 1024
    }
});
//스마트 미러 구동파일 교체
router.route('/processSmartmirror').post(uploadSmartmirror.array('photo', 1), function (req, res) {

    try {
        let files = req.files;
        if (files[0].filename == "SmartMirror.exe") {
            //변경
            ///home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/item/Smartmirror.exe

            fs.unlink(`/home/hosting_users/creativethon/apps/creativethon_wmswebsite/smartmirror/item/Smartmirror.exe`, function (err) {
                if (err) console.log(err)
            })


            version++

            if (files.length > 0) {
                console.dir(files[0]);

                // 현재의 파일 정보를 저장할 변수 선언
                let originalname = '',
                    filename = '',
                    mimetype = '',
                    size = 0;

                if (Array.isArray(files)) {   // 배열에 들어가 있는 경우 (설정에서 1개의 파일도 배열에 넣게 했음)

                    for (let i = 0; i < files.length; i++) {
                        originalname = files[i].originalname;
                        filename = files[i].filename;
                        mimetype = files[i].mimetype;
                        size = files[i].size;
                    }
                }
                res.redirect('smartmirrormanage')
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




//매일 오전0시에 예약한 날짜가 되면 스마트미러에 예약한 이미지포스터로 교체, 새로운 일일 수전사용량 데이터생성
let changefilename
let j = schedule.scheduleJob("0 0 0 * * *", function () {
    let imagestate = false
    let videostate = false
    const year = moment().format('YY')
    const month = moment().format('MM')
    const day = moment().format('DD')
    const date = moment().format('MMDD')
    const Hour = moment().format('HH:mm:ss')

    //수전 데이터 초기화
    weekendWater[0] = 0

    Water.find(function(err,data){
        for(let index = 0; index < data.length; index++){
            weekendTotalUseage += data[index].Useage
        }
    }).sort({ Year: -1 }).sort({ Month: -1 }).sort({ Day: -1 }).limit(7)
    //새로운 데이터를 생성합니다.
    const newDaywateruseage = new Water({ 'Year': year, 'Month': month, 'Day': day, 'Percent': "", 'Useage': 0 })
    newDaywateruseage.save(function (err, slience) {
        if (err) {
            console.log(err)
            res.status(500).send('update error')
            return
        }
        return console.log("새로운 수전사용 데이터 생성")
    })

    //오늘 예약되어 있는 파일이 있는지 확인하기전 스마트미러 미디어 데이터베이스들을 다 삭제합니다.
    //데이터베이스에는 이름만 저장되어있고 파일은 Smartmirror/ 폴더안에 모두 저장되어 있습니다.
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


//10초 간격으로 함수 실행, 현재 날씨현황과 기온 보여주는 함수
let k = schedule.scheduleJob("*/10 * * * * *", function () {
    moment.tz.setDefault("Asia/Seoul")
    const date = moment().format('YYYYMMDD')
    let nowhourtime = moment().format('HH' + "00")
    //api가 30분이 넘어야 그 시간대의 예보를 불러오기 때문에
    //30분 이하라면 1시간 전의 데이터를 불러옵니다.
    if (moment().format('mm') < 30) {
        nowhourtime = nowhourtime - 100
    }

    //moment.format()은 시간을 저장할때 앞에 무의미한 숫자는 빼버리기 때문에 10시 이전에 있는 시간들은 앞에 0을 붙여줘야 합니다.
    //ex) 9시는 900으로 저장되고 api는 0900으로 표현이 되어야 정상적으로 작동이 되기 때문에 일부러 붙여주었습니다.
    if (nowhourtime < 1000) {
        nowhourtime = "0" + nowhourtime
    }
    const hourtime = nowhourtime.toString()
    let locationdata

    //엑셀에서 현재 선택한 구역의 x,y의 값을 받아와서 api정보에 사용합니다.
    Weather.find({}, imgProjection, function (err, data) {
        locationdata = data[0].name
        for (let index = 2; index < 3775; index++) {
            if (locationdata == firstSheet["B" + index].v) {
                currentlocationX = firstSheet["F" + index].v
                currentlocationY = firstSheet["G" + index].v
            }
        }
    })
    //data.go.kr에서 제 아이디로 기상청 api받아온거입니다. 만약 시간이 지나서 제 api 사용기간이 지나면 직접 가입하셔서 api신청해야합니다.
    //기상청_단기예보 ((구)_동네예보) 조회서비스
    let url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
    let queryParams = '?' + encodeURIComponent('ServiceKey') + '=VHqmEJqAw45745GV0%2BkA3l6TePYLRpgPhuEYJMsNv69w%2F6NaV98Z6fOUZruSuV7xvSyOfSDEa941PCus5fUjzg%3D%3D'; /* Service Key*/
    queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1') /* */
    queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('20') /* */
    queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('XML') /* */
    queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent(date) /* */
    queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent(hourtime); /* */
    queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent(currentlocationX) /* */
    queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent(currentlocationY) /* */


    //api를 받아와서 현재 페이지에서 쓰이고 있는 기온와 날씨 상태를 불러와 저장합니다.
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
   //받아온 api에서 해당되는 날씨 현황을 이미지로 보여주기 위한 코드입니다.
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
    //socket.io 모듈을 사용하여 실시간으로 값을 보냅니다.
    //io.emit을 사용하여 값을 보냅니다. io.emit("이름", 보낼 변수)
    io.emit("currentimage", currentimg)
    io.emit("currentT1H", weatherdata[1])
})

//매년 1월에 발생하는 이벤트
let Y = schedule.scheduleJob("0 0 0 0 1 *", function () {
    yearWater = new Array() // 올해 총 사용량 초기화

    const todayYear = moment().format('YY')
    const todayMonth = moment().format('MM')
    const todayDay = moment().format('DD')

    //보여줄 1년치 데이터 12개를 미리 생성합니다.
    for (let index = 0; index < 12; index++) {
        const newDaywateruseage = new MonthUseage({ 'Year': todayYear, 'Month': index + 1, 'Day': todayDay, 'Percent': "", 'Data': 0 })
        newDaywateruseage.save(function (err, slience) {
            if (err) {
                console.log(err)
                res.status(500).send('update error')
                return
            }
            return console.log(index + 1 + "월 데이터 생성")
        })
    }

    console.log("현재 날짜 : " + todayYear + " " + todayMonth + " " + todayDay)
})

//더미 데이터 삭제x
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

//댓글 작성 함수 테스트용
//만약 인수인계 전까지 앱이 완성이 안되서 이게 아직까지 살아있다면 이걸 사용해서 댓글 만드시면 됩니다. 만약 완성되면 제가 지웠을거에요.
app.post('/addcomment', (req, res) => {
    const todayDay = moment().format("DD")
    const todayMonth = moment().format("MM")
    Client.updateOne({ 'name': '박찬종' }, { $push: { comment: { 'text': req.body.commentText, 'username': "관리자", "Date": todayMonth + todayDay } } }, function (err) {
        if (err) {
            console.log(err)
            return;
        }

        console.log('댓글 추가 완료 ');
        res.redirect('dkatk')
    });
});



//기상청api의 초기 x와 y값 불러오기
let weathername = new Array()
let weatherdata = new Array()
let currentlocationX
let currentlocationY
let locationdata
//서버가 켜질때 x,y의 값을 불러와야 하므로 만든 코드입니다.
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


//기상청 엑셀정보 불러오기
//변경
///home/hosting_users/creativethon/apps/creativethon_wmswebsite/api/기상청41_단기예보 조회서비스_오픈API활용가이드_격자_위경도(20210401).xlsx
const excelFile = xlsx.readFile("/home/hosting_users/creativethon/apps/creativethon_wmswebsite/api/기상청41_단기예보 조회서비스_오픈API활용가이드_격자_위경도(20210401).xlsx")
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
    // localselect의 값과 중복된 값을 cityname에 추가
    cityname = new Array()
    for (let index = 2; index <= 3775; index++) {
        //선택한 지역을 3775개의 구역코드중 c열의 문자열이 같은 것을 찾습니다.
        if (localselect != firstSheet["C" + index].v) continue
        //옳바른 c열의 문자열을 찾으면 해당하는 행의 d열의 문자열을 data변수에 저장합니다.
        let data = firstSheet["D" + index].v
        if (data == "") continue;
        let state = true;
        // 중복검사
        for (let i = 0; i < cityname.length; i++) {
            //cityname 배열안에 값이 있으면 state를 false로 변경합니다.
            if (cityname[i] == data) {
                state = false;
                break
            }
        }
        // 새 데이터 추가
        //cityname 배열안에 값이 없으면 state가 true이기 때문에 배열에 data변수를 추가합니다.
        if (state) cityname.push(data)
    }
    villagename = new Array()
    for (let index = 2; index <= 3775; index++) {
        //3775개의 데이터중 선택한 구역의 E열의 문자열을 data변수안에 저장하여 villagename 배열에 추가한다.
        if (localselect == firstSheet["C" + index].v && cityselect == firstSheet["D" + index].v) {
            let data = firstSheet["E" + index].v
            if (data != "") villagename.push(data)
        }
    }
    return Water.find(function (err, water) {
        Smartmirrorvideofile.find(function (err, videofile) {
            Smartmirrorimagefile.find(function (err, imgfile) {
                res.render('sub', {
                    accessmanage: water, videofile: videofile, imgfile: imgfile,
                    cityname: cityname, village: villagename, localselected: localselect, cityselected: cityselect,
                    selectcityname: selectcityname, selectvillagename: selectvillagename, percentArray: percentArray,
                })
            })
        })
    }).sort({ Date: -1 }).sort({ Hour: -1 }).limit(7)
})
let selectcityname
let selectvillagename

//최종 구역 선택 post
app.post('/weather', function (req, res) {
    const name = req.body.name
    const city = req.body.city
    const village = req.body.village
    localselect = name
    cityselect = city
    villageselect = village

    for (let index = 2; index <= 3775; index++) {
        //3775개의 데이터중 선택한 구역의 B열의 문자열을 data변수안에 저장한다
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
                //실수로 선택하지 않고 버튼을 눌렀을 경우 임의의 값을 data로 넣어 오류를 방지합니다.
                if (data == "") {
                    data = "2824561400"
                }
                //Weather 컬렉션에 있는 데이터를 data변수로 바꾼다.
                Weather.findOneAndUpdate({}, { $set: { 'name': data } }, (err, data) => {
                    if (err) console.log(err)
                    else console.log("저장완료")
                })
            }
        }
    }

    version++
    Water.find(function (err, water) {
        Smartmirrorvideofile.find(function (err, videofile) {
            Smartmirrorimagefile.find(function (err, imgfile) {
                res.render('sub', {
                    accessmanage: water, videofile: videofile, imgfile: imgfile,
                    contents: localname, cityname: cityname, village: villagename, localselected: localselect, cityselected: cityselect,
                    selectcityname: selectcityname, selectvillagename: selectvillagename, percentArray: percentArray,
                })
            })
        })
    }).sort({ Date: -1 }).sort({ Hour: -1 }).limit(7)
})



let index = 2
let localname = new Array()
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
// localselect의 값과 중복된 값을 cityname에 추가
//서버 실행시 구역을 선택하기 위하여 콤보박스에 목록을 추가하는 코드입니다.
for (let index = 2; index <= 3775; index++) {
    if (localselect != firstSheet["C" + index].v) continue
    let data = firstSheet["D" + index].v
    let state = true;
    // 중복검사
    for (let i = 0; i < cityname.length; i++) {
        if (cityname[i] == data) {
            state = false;
            break
        }
    }
    // 새 데이터 추가
    if (state) cityname.push(data)
}

//서버 실행시 초기 설정되었던 행정구역 코드 설정
villagename = new Array();
for (let index = 2; index <= 3775; index++) {
    if (localselect == firstSheet["C" + index].v && cityselect == firstSheet["D" + index].v) {
        let data = firstSheet["E" + index].v
        if (data != "") villagename.push(data)
    }
}

//관리자 로그인
app.post('/main', (req, res) => {
    //User 컬렉션에서 입력한 아이디와 패스워드를 찾아서 있으면 로그인하고 없으면 에러를 표시한다.
    User.findOne({ name: req.body.name, password: req.body.password }, (err, user) => {
        if (err) return res.status(500).send({ message: '에러!' });
        else if (user) {
            Water.find(function (err, water) {
                Smartmirrorvideofile.find(function (err, videofile) {
                    Smartmirrorimagefile.find(function (err, imgfile) {
                        //세션을 생성한다.
                        req.session.logindata =
                        {
                            id: req.body.name,
                            password: req.body.password,
                            name: 'username',
                            authorized: true
                        }
                        //세션을 저장한다.
                        req.session.save(err => {
                            if (err) console.log(err)
                            else console.log(req.session)
                        })
                        console.log("관리자 로그인 성공")
                        res.redirect('main')
                    })
                })
            }).sort({ Date: -1 }).sort({ Hour: -1 }).limit(7)
        }
        else return res.status(404).send({ message: '유저 없음!' })
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

    //User컬렉션에서 입력한 아이디와 패스워드를 찾는다.
    User.findOne({ name: name, password: password }, (err, users) => {
        //아이디가 있다면 패스워드를 새로 바꿀 패스워드로 변경한다.
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
    //세션이 있다면 세션을 없애며 로그아웃을 한다.
    if (req.session.logindata) {
        req.session.destroy(function (err) {
            if (err) console.log(err)
        })
    }
    res.render('login', { layout: null })
})


//비디오파일 삭제
app.post('/deletevideo', function (req, res, next) {
    const name = req.body.name
    //데이터베이스에 선택한 파일의 정보를 불러옵니다.
    const video = Videofilesave.find({ "name": name })
    version++
    //변경
    ///home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/video/${name}
    //파일을 없애는 함수입니다.
    fs.unlink(`/home/hosting_users/creativethon/apps/creativethon_wmswebsite/smartmirror/video/${name}`, function (err) {
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
    //데이터베이스에서 파일을 삭제하는 함수입니다.
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
    fs.unlink(`/home/hosting_users/creativethon/apps/creativethon_wmswebsite/smartmirror/image/${name}`, function (err) {
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
    fs.unlink(`/home/hosting_users/creativethon/apps/creativethon_wmswebsite/smartmirror/video/${name}`, function (err) {
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
        }
    })
    res.redirect('bookmedia')
})

//예약 이미지파일 삭제

app.post('/deletereservationimage', function (req, res, next) {
    const name = req.body.name
    const image = Imgfile.find({ "name": name })
    version++
    //변경
    ///home/hosting_users/creativethon/apps/creativethon_wmsapp/smartmirror/image/${name}
    fs.unlink(`/home/hosting_users/creativethon/apps/creativethon_wmswebsite/smartmirror/image/${name}`, function (err) {
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
    //데이터베이스에 있는 비디오파일중 type이 none인 파일만 불러온다.
    Videofilesave.find(function (err, videofile) {
        for (let index = 0; index < videofile.length; index++) {
            if (videofile[index].type == "None") {
                videoArray.push(videofile[index])
            }
        }

        //데이터베이스에 있는 비디오파일중 type이 none인 파일만 불러온다.
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
    //데이터베이스에 있는 비디오파일중 type이 reservation인 파일만 불러온다.
    Videofilesave.find(function (err, videofile) {
        for (let index = 0; index < videofile.length; index++) {
            if (videofile[index].type == "reservation") {
                videoArray.push(videofile[index])
            }
        }
        //데이터베이스에 있는 이미지파일중 type이 reservation인 파일만 불러온다.
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

//메인페이지
app.get('/main', function (req, res) {
    Water.find(function (err, water) {

        //수전 데이터중 일주일 데이터의 수치를 보여준다.
        let Valuedata = new Array()
        for (let index = 0; index < water.length; index++) {
            Valuedata.push(water[index].Useage)
        }

        //수전 데이터중 일주일 데이터 가운데 가장 큰 수치를 maxValue에 저장한다.
        maxValue = Math.max.apply(null, Valuedata)
        if (weekendWater[0] > maxValue) {
            maxValue = weekendWater[0]
        }

        //구한 maxValue를 100%로 기준을 놓고 나머지 데이터의 percent를 구하여 막대그래프로 표시한다.
        for (let index = 0; index < weekendWater.length; index++) {
            //weekendWater.push(percent(data[index].Useage, maxValue))
            percentArray[index] = Math.floor(percent(weekendWater[index], maxValue))
        }
        Smartmirrorvideofile.find(function (err, videofile) {
            Smartmirrorimagefile.find(function (err, imgfile) {
                if (req.session.logindata) {
                    res.render('sub', {
                        accessmanage: water, percentArray: percentArray, weekendWater: weekendWater, videofile: videofile, imgfile: imgfile,
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

    //weather 데이터베이스 안에 데이터가 있으면 testweather 변수에 저장을 하고
    //없으면 임의의 변수를 testweather안에 저장을하여 공백을 저장하지 않게 한다.
    if (locationcode) {
        testweather = locationcode[0]
    }
    else {
        testweather = 1111053000
    }
    //testweather변수에 있는 {}""등 불필요한 문자들을 제거한다.
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
//wmsadmin.co.kr/smartmirror/image/info 페이지에 데이터베이에 있는 파일이름들을 보내면
//스마트미러가 이 페이지를 감지하여 10초 단위로 새로고침합니다.
app.get('/smartmirror/image/info', function (req, res) {
    Smartmirrorimagefile.find({}, videoProjection, function (err, data) {
        if (err) return next(err)
        res.json(data)
    })

})

//스마트미러에 비디오파일 목록 보내기
//wmsadmin.co.kr/smartmirror/video/info 페이지에 데이터베이에 있는 파일이름들을 보내면
//스마트미러가 이 페이지를 감지하여 10초 단위로 새로고침합니다.
app.get('/smartmirror/video/info', function (req, res) {
    Smartmirrorvideofile.find({}, videoProjection, function (err, data) {
        if (err) return next(err)
        res.json(data)
    })

})

//wmsadmin.co.kr/smartmirror/item/info 페이지에 데이터베이에 있는 파일이름들을 보내면
//스마트미러가 이 페이지를 감지하여 10초 단위로 새로고침합니다.
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



//스마트미러 관리자 페이지 선택버튼

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


//스마트미러의 버전을 표시하여 업데이트 하는 페이지
//version변수의 값이 올라가면 스마트미러가 version 값의 변경을 감지하여 새로고침한다.
let version = 0
app.get('/smartmirror/version', function (req, res) {
    res.render('dummy', { layout: null, contents: version })
})

//esp32에서 서버로 값을 불러올때 리턴값을 보내기 위하여 만든 더미 페이지
app.get('/dummy', function (req, res) {
    let dataarray = new Array()
    Water.find(function(err,data){
        res.render('dummy',{data : data})
    }).sort({ Year: -1 }).sort({ Month: -1 }).sort({ Day: -1 }).limit(7)
})

//핸드드라이어 공기필터 오염량 관리 페이지
app.use('/handdryermanage', function (req, res) {
    console.log(receivehand)
    console.log(receivegas)
    res.render('handdryermanage',{hand : hand})
})



// 수전데이터 받기전 일주일 데이터 기초 설정
let weekendWater = new Array()
let weekendTotalUseage = 0
let yearTotalUseage = 0
let plustotaldayvalue = 0
let plustotalyearvalue = 0
Water.find(function (err, data) {
    //데이터베이스에 있는 일일 수전데이터 7개를 weekendWater 배열에 저장한다.
    for (let index = 0; index < data.length; index++) {
        weekendWater.push(parseFloat(data[index].Useage))
    }
    //weekendWater[0]에 있는 데이터를 plusdayvalue에 저장한다.
    //plusdayvalue는 esp32에서 보내는 수전데이터를 계속 더해주는 역할을 한다.
    //weekendWater배열은 데이터중 가장 최신의 7개의 데이터를 받아오기 때문에 [0]은 현재날짜를 의미한다.
    plusdayvalue = weekendWater[0]

    //weekendWater배열에 있는 모든 데이터를 더하여 일주일 사용량을 계산한다.
    for(let index = 0; index < weekendWater.length; index++)
    {
        plustotaldayvalue += weekendWater[index]
    }
    console.log(data)
}).sort({ Year: -1 }).sort({ Month: -1 }).sort({ Day: -1 }).limit(7)

//수전데이터 받기전 1년 데이터 기초 설정
let yearWater = new Array()
MonthUseage.find(function (err, data) {
    //데이터베이스에 있는 1달 수전데이터 12개를 yearWater 배열에 저장한다.
    for (let index = 0; index < data.length; index++) {
        if (data[index].Year == todayYear) //데이터가 해당 연도가 맞다면 저장을 한다.
        {
            yearWater.push(parseFloat(data[index].Data))
            //해당 연도의 1~12월까지의 데이터를 모두 누적한다.
            plustotalyearvalue += data[index].Data
        }
    }
}).sort({ Year: -1 }).sort({ Month: 1 }).limit(12)



let dlatlaaa= 0
let watervalue = 3
let receivewater = ""
let tolletnumber =0 
let plusdayvalue = 0
let percentArray = new Array()
let yearpercentArray = new Array()
//esp32 수전에서 보내온 값을 받는 함수
app.get('/testa',function(req,res){
    dlatlaaa = req.query.id
    const strArr = dlatlaaa.split(',')
    console.log(strArr[0])
    console.log(strArr[1])
    res.render('dkatk',{layout : null})
})
/*
2층 여자1 : 1
2층 여자2 : 2
2층 남자 : 3
3층 여자1 : 4
3층 여자2 : 5
3층 남자 : 6
*/
app.get('/testwater_recieve', function (req, res) {
    receivewater = req.query.id
    const strArr = receivewater.split(',')
    watervalue = strArr[0] // 수전 사용량
    tolletnumber = strArr[1] // 사용한 화장실
    watervalue = req.query.id


    const todayYear = moment().format('YY')
    const todayMonth = moment().format('MM')
    const todayDay = moment().format('DD')
    const todayHour = moment().format('hh:mm:ss')
    //esp32 수전에서 보내는 값은 ml단위이기 때문에 plusdayvalue에 누적하면서 L단위로 변환한다.
    plusdayvalue = parseFloat(plusdayvalue) + (parseFloat(watervalue) / 1000)
    //weekendWater[0]에 다시 넣으면서 toFixed(3)을 사용한다. toFixed는 소수점3자리까지 나타내게 해준다.
    //사용을 안할시 데이터가 너무 길어진다.
    weekendWater[0] = plusdayvalue.toFixed(3)

    //일주일 사용량도 L단위로 변환한다.
    plustotaldayvalue = parseFloat(plustotaldayvalue) + (parseFloat(watervalue) / 1000)
    weekendTotalUseage = plustotaldayvalue.toFixed(3)

    //1년 단위도 L단위로 변환한다.
    plustotalyearvalue = parseFloat(plustotalyearvalue) + (parseFloat(watervalue) / 1000)
    yearTotalUseage = plustotalyearvalue.toFixed(3)

    //1주일 데이터중 가장 큰 수치를 maxValue에 저장한다.
    if (weekendWater[0] > maxValue) {
        maxValue = weekendWater[0]
    }
    for (let index = 0; index < weekendWater.length; index++) {
        //weekendWater.push(percent(data[index].Useage, maxValue))
        percentArray[index] = Math.floor(percent(weekendWater[index], maxValue))
    }

     //yearWater[0] = yearWater[0] + (parseInt(watervalue) / 1000)
     yearWater[todayMonth - 1] = (parseFloat(yearWater[todayMonth - 1]) + (parseFloat(watervalue) / 1000)).toFixed(3)
     if (yearWater[todayMonth - 1] > maxyearValue) {
         maxyearValue = yearWater[todayMonth - 1]
     }


    console.log("현재 수전 사용 수치 : " + watervalue + "mL")
    console.log("누적 수전 사용 수치 : " + weekendWater[0])
    console.log("사용시간 : " + todayDay + " : " + todayHour)

    //esp32에서 받아온 데이터를 데이터베이스에 넣는다
    Water.findOneAndUpdate({ 'Year': todayYear, 'Month': todayMonth, 'Day': todayDay }, { $set: { 'Useage': weekendWater[0] } }, (err, data) => {
        if (err) console.log(err)
        else console.log("저장완료")
    })

   
    MonthUseage.findOneAndUpdate({ 'Year': todayYear, 'Month': todayMonth }, { $set: { 'Data': yearWater[todayMonth - 1] } }, (err, data) => {
        if (err) console.log(err)
    })
    for (let index = 0; index < yearWater.length; index++) {
        //weekendWater.push(percent(data[index].Useage, maxValue))
        yearpercentArray[index] = Math.floor(percent(yearWater[index], maxyearValue))
    }
    //연결이 들어오면 실행되는 이벤트
    //io.emit을 사용하여 실시간으로 값을 넣는다.
    io.emit('weekendwater', weekendWater[0])
    io.emit('waterpercent', percentArray)
    io.emit('weekendTotalUseage', weekendTotalUseage)
    io.emit('yearTotalUseage', yearTotalUseage)
    io.emit('wateryearpercent', yearpercentArray)
    io.emit('yearWater', yearWater[todayMonth - 1])
    res.render('dkatk', { layout: null, watervalue: watervalue })
})

let getnfc = ""
//핸드드라이어에서 nfc값을 받는 함수
app.get('/nfc_recieve', function (req, res) {
    getnfc = req.query.id
    console.log(moment().format('MMDD:hh:mm:ss') + "adwwad")
    console.log(getnfc)
    io.emit('getnfc', getnfc)
    res.render('dkatk', { layout: null })
})

let gassensor = "2"
let receivegas = "2"
//핸드드라이어에서 가스센서 값을 받는 함수
app.get('/test_gassensor', function (req, res) {
    gassensor = req.query.id
    receivegas = parseInt(gassensor)
    console.log(gassensor)
    io.emit('getgassensor', gassensor)
    res.render('dkatk', { layout: null })
})

let hand = "2"
let saveremainhand = ""
let receivehand = "2"
//핸드드라이어에서 남은 휴지출지량 값을 받는 함수
app.get('/test_remain', function (req, res) {
    hand = req.query.id
    receivehand = parseInt(hand)
    console.log(moment().format('MMDD:hh:mm') + hand)
    io.emit('remain', hand)
    res.render('dkatk', { layout: null })
})


app.get('/wateruseage', function (req, res) {
    Water.find(function (err, data) {
        MonthUseage.find(function (err, yeardata) {
            const todayYear = moment().format('YY')
            const currentmonth = moment().format('MM')
            let lastMonth = 0
            let currentMonth = 0
            let Valuedata = new Array()
            //Valuedata에 1주일치 데이터를 저장한다.
            for (let index = 0; index < data.length; index++) {
                Valuedata.push(data[index].Useage)
            }
            //Valueyeardata에 1년치 데이터를 저장한다.
            let Valueyeardata = new Array()
            for (let index = 0; index < yeardata.length; index++) {
                if (yeardata[index].Year == todayYear)
                    Valueyeardata.push(yeardata[index].Data)
            }
            maxyearValue = Math.max.apply(null, Valueyeardata)

            //저번달 총,이번달 총 사용량 구하기
            //이번달이 1월이면 저번달 총사용량은 0으로 초기화
            if ((currentmonth - 2) < 0) {
                lastMonth = 0
            }
            else {
                lastMonth = yeardata[currentmonth - 2].Data
            }
            currentMonth = yeardata[currentmonth - 1].Data

            //페이지를 불러올때 현재 받고있는 일일 수전 누적데이터가 maxValue보다 커졌다면
            //현재 받고있는 누적데이터를 maxValue에 넣는다.
            if (weekendWater[0] > maxValue) {
                maxValue = weekendWater[0]
            }

            //페이지를 불러올때 현재 받고있는 1년 수전 누적데이터가 maxyearValue보다 커졌다면
            //현재 받고있는 누적데이터를 maxyearValue에 넣는다.
            if (yearWater[currentmonth] > maxyearValue) {
                maxyearValue = yearWater[currentmonth]
            }

            //maxValue를 기준으로 일주일치 데이터의 percent를 구한다.
            for (let index = 0; index < weekendWater.length; index++) {
                percentArray[index] = Math.floor(percent(weekendWater[index], maxValue))
            }
            //maxyearValue를 기준으로 1년치 데이터의 percent를 구한다.
            for (let index = 0; index < yearWater.length; index++) {
                yearpercentArray[index] = Math.floor(percent(yearWater[index], maxyearValue))
            }

            res.render('wateruseage', {
                data: data, yeardata: yeardata, selectcityname: selectcityname, selectvillagename: selectvillagename, weekendWater: weekendWater,
                percentArray: percentArray, yearWater: yearWater, yearpercentArray: yearpercentArray, lastMonth: lastMonth, currentMonth: currentMonth,
                plustotaldayvalue : plustotaldayvalue.toFixed(3), plustotalyearvalue : plustotalyearvalue.toFixed(3)
            })

        }).sort({ Year: -1 }).sort({ Month: 1 }).limit(12)
    }).sort({ Year: -1 }).sort({ Month: -1 }).sort({ Day: -1 }).limit(7)
})

// 퍼센트 구하는 함수 ex) percetn(50,100) = 50
function percent(par, total) {
    return (par / total) * 100
}

//초기 7일간 데이터중 가장 높은 일자의 값 구하기 설정
let maxValue = 0
Water.find(function (err, data) {
    let Valuedata = new Array()
    if(data == "")
    {
        for(let index = 0; index < 7; index++)
        {
            Valuedata.push(index)
        }
    }
    else
    {
        for (let index = 0; index < data.length; index++) {
            Valuedata.push(data[index].Useage)
        }
    }
    maxValue = Math.max.apply(null, Valuedata)
}).sort({ Year: -1 }).sort({ Month: -1 }).sort({ Day: -1 }).limit(7) //추후엔 Month 와 Day로 나누기 때문에 각각에 sort정렬을 해줘야 최신 데이터가 나옴


//초기 1년간 데이터중 가장 높은 달의 값 구하기 설정
let maxyearValue = 0
MonthUseage.find(function (err, data) {
    let Valueyeardata = new Array()
    if(data == "")
    {
        for(let index = 0; index < 12; index++)
        {
            data[index].Data = index
        }
    }
    else
    {
        for (let index = 0; index < data.length; index++) {
            if (data[index].Year == todayYear)
                Valueyeardata.push(data[index].Data)
        }
    }
    maxyearValue = Math.max.apply(null, Valueyeardata)
}).sort({ Year: -1 }).sort({ Month: 1 }).sort({ Day: 1 }).limit(12) //추후엔 Month 와 Day로 나누기 때문에 각각에 sort정렬을 해줘야 최신 데이터가 나옴

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


let listint = []
let clientpage
app.get('/clientlist/:page', function (req, res) {
    clientpage = req.params.page //페이지번호를 받습니다. ex)페이지가 clientlist/1 이면 clientpage는 1
    if (clientpage == null) { clientpage = 1 } //페이지가 한개도 없다면 1페이지로 넘어옵니다.
    let skipsize = (clientpage - 1) * 14 //데이터베이스에서 14개 단위로 보여줍니다.
    let limitsize = 14 //한 페이지에 14개의 데이터만 보여줍니다.
    let pagenum = 1

    Water.countDocuments(function (err, water) { //데이터의 갯수를 가져오는 함수
        if (err) throw err

        pagenum = Math.ceil(water / limitsize) //math.ceil() : 소수점을 올림한다.
        for (let i = 1; i <= pagenum; i++) {
            listint[i] = i
        }
        Water.find({}).sort({ Year: -1 }).sort({ Month: -1 }).sort({ Day: 1 }).skip(skipsize).limit(limitsize).exec(function (err, pageContents) {
            if (err) throw err
            res.render('clientlist', { contents: pageContents, pagination: pagenum, count: listint })
        })
    })
})

app.post('/clientlist', function (req, res) {
    let divisionpage = clientpage / 5

})

app.get('/notice', function (req, res) {
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
app.get('/noticecreate', function (req, res) {
    res.render('noticecreate',{layout:null})
})
app.get('/noticelist', function (req, res) {
    clientpage = req.params.page
    if (clientpage == null) { clientpage = 1 }
    let skipsize = (clientpage - 1) * 14
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
            res.render('noticelist', { layout: null, contents: pageContents, pagination: pagenum, count: listint })
        })
    })
})
app.get('/inquirylist', function (req, res) {
    res.render('inquirylist', { layout: null })
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