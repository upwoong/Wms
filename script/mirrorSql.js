const mysql = require('./mySql');
const getDays = require('./getDays')
require('dotenv').config();
let version = 0

class smartMirror {
  constructor(dbTable,kind) {
    this.refVideoArray = []
    this.refImageArray = []
    this.ComboVideo = []

    this.numberImage = 0
    this.numberVideo = 0

    this.allImgfile = []
    this.allVideofile = []

    this.dbTable = dbTable
    this.kind = kind
    this.selectDay = ''
  }
  async init() {
  }
  async getShowSmartmirror(setSmartmirror, selectImage) {
    for (let i = 0; i < this.refVideoArray.length; i++) {
      if (this.refVideoArray[i][0] == setSmartmirror) {
        this.numberVideo = this.refVideoArray[i][1]
        break
      }
    }
    for (let i = 0; i < this.refImageArray.length; i++) {
      if (this.refImageArray[i][0] == selectImage) {
        this.numberImage = this.refImageArray[i][1]
        break
      }
    }
  }

  async getContents(model, contents, kinds) {
    let data = new Array()
    if (model != "") data.push(model) //model이 비어있지 않는다면 data변수에 저장
    if (contents != "") data.push(contents) //contents가 비어있지 않는다면 data변수에 저장

    let state = true;
    if (kinds == 0) // 비디오 데이터
    {
      for (let i = 0; i < this.refVideoArray.length; i++) {
        if (this.refVideoArray[i][0] == model) // 중복된 모델의 경우 덮어쓰기
        {
          data.push(new Date())
          this.refVideoArray[i] = data //data배열의 첫번째 데이터는 스마트미러 모델명이다.
          state = false
          break
        }
      }
      if (state) { //중복된 모델의 경우가 아닐경우
        data.push(new Date())
        this.refVideoArray.push(data)
      }
    }
    else // 이미지 데이터
    {
      for (let i = 0; i < this.refImageArray.length; i++) {
        if (this.refImageArray[i][0] == model) // 중복된 모델의 경우 덮어쓰기
        {
          data.push(new Date())
          this.refImageArray[i] = data //data배열의 첫번째 데이터는 스마트미러 모델명이다.
          state = false
          break
        }
      }
      if (state) { //중복된 모델이 아닐 경우
        data.push(new Date())
        this.refImageArray.push(data)
      }
    }
  }
  async showContents() {
    const nowtime = new Date()
    this.ComboVideo = new Array();
    for (let i = 0; i < this.refVideoArray.length; i++) {
      //현재시간에서 스마트미러의 비디오가 저장된 시간을 빼는 계산을 하여
      //현재 비디오가 몇분째 보여주고 있는지 계산한다.
      const elapsedMSec = nowtime - this.refVideoArray[i][2]
      const elapsedMin = elapsedMSec / 1000 / 60
      //만약 5분이상 보여주고 있다면 삭제를 하여 다음 비디오를 재생한다.
      if (elapsedMin > 5) this.refVideoArray.pop(i)
      this.ComboVideo.push(this.refVideoArray[i][0])
    }
    for (let i = 0; i < this.refImageArray.length; i++) {
      const elapsedMSec = nowtime - this.refImageArray[i][2]
      const elapsedMin = elapsedMSec / 1000 / 60
      if (elapsedMin > 5) this.refImageArray.pop(i)
    }
  }

  async getAllData() {
    this.allImgfile = mirrorSql.getData("ImgFile")
    this.allVideofile = mirrorSql.getData("VideoFile")
  }

  async SaveFile(Files, Days) {
    let sql = `INSERT INTO ${this.dbTable} (Name, Type, Date) VALUES (?, ?, ?)`;

    if (Days == 0) this.selectDay = getDays.Date
    else this.selectDay = Days

    const DayArr = this.selectDay.split('-')
    const currentday = DayArr[1] + DayArr[2]
    this.version++
    if (Files.length > 0) {

      // 현재의 파일 정보를 저장할 변수 선언
      let filename = ''


      if (Array.isArray(Files)) {
        for (let i = 0; i < Files.length; i++) {
          filename = Files[i].filename;
        }
      }
      const params = [filename, this.kind, currentday];
      await mysql.runQuery(sql, params);
    }
  }


  async deletefile(Files) {

    let sql = `DELETE FROM ${this.dbTable} WHERE FileName = '${Files}'`;

    this.version++
    fs.unlink(`smartmirror/${this.kind}/${Files}`, function (err) {
      if (err) console.log(err)
    })

    await mysql.runQuery(sql)
    return "Complete"
  }

  /**
 * 
 * @param {"ImgFile,VidoeFile"} Type 
 * @param {"None,reservation"} Kind 
 * @returns 
 */
async GetFile() {
  const sql = `SELECT * FROM ${this.dbTable} WHERE Type = '${this.kind}'`;
  const result = await mysql.runQuery(sql, null);
  return result;
}

async ChangeFile() {
  const selectQuery = `SELECT * FROM ${this.dbTable} WHERE (Date = '${Days.month + Days.day}' AND Type = 'reservation') OR Type = 'None'`;
  const insertQuery = `INSERT INTO update (col1, col2, col3) VALUES ?`;

  const result = await mysql.runQuery(selectQuery)

  const dataToInsert = result.map(result => [result.col1, result.col2, result.col3]);
  mysql.runQuery(insertQuery, [dataToInsert])

}

async DeleteAll() {
  const DelQuery = `DELETE FROM ${this.dbTable} ORDER BY Name ASC`;

  const result = await mysql.runQuery(DelQuery, null)
  return result
}


async GetData() {
  const GetData = `SELECT * FROM ${this.dbTable}`;
  const result = await mysql.runQuery(GetData, null)
  return result
}

async UpdateData(data) {
  const Updatesql = `UPDATE weather SET Code=${data} WHERE id=1`;
  const result = await mysql.runQuery(Updatesql, null)
  return result
}
}


const SaveFile = async function (Files, Kind, Type, Days) {
  let Reposql
  let Cursql
  let selectday
  if (Files[0].mimetype == "image/jpg" || Files[0].mimetype == "image/png" || Files[0].mimetype == "image/gif" || Files[0].mimetype == "image/jpeg") {
    Reposql = 'INSERT INTO mirrorimgfile (Name, Type, Date) VALUES (?, ?, ?)';
    Cursql = 'INSERT INTO curimgfile (Name, Type, Date) VALUES (?, ?, ?)';
  }
  else if (Files[0].mimetype == "video/mp4" || Files[0].mimetype == "video/avi" || files[0].mimetype == "video/wmv") {
    Reposql = 'INSERT INTO mirrorvideofile (Name, Type, Date) VALUES (?, ?, ?)';
    Cursql = 'INSERT INTO curvideofile (Name, Type, Date) VALUES (?, ?, ?)';
  }
  else {
    fs.unlink(`smartmirror/${Kind}/${Files[0].filename}`, function (err) {
      console.log(Files[0].filename)
    })
    return 3 //지원되지 않는 파일 종류
  }
  if (Days == 0) selectday = getDays.Date
  else selectday = Days

  const strArr = selectday.split('-')
  const currentday = strArr[1] + strArr[2]
  this.version++
  if (Files.length > 0) {

    // 현재의 파일 정보를 저장할 변수 선언
    let originalname = '',
      filename = '',
      mimetype = '',
      size = 0;

    if (Array.isArray(Files)) {
      for (let i = 0; i < Files.length; i++) {
        originalname = Files[i].originalname;
        filename = Files[i].filename;
        mimetype = Files[i].mimetype;
        size = Files[i].size;
      }
    }
    if (Type == "None") {
      const params = [filename, "None", currentday];
      await mysql.runQuery(Cursql, params);
    }
    const paramsa = [filename, "None", currentday];
    await mysql.runQuery(Reposql, paramsa);
    return 1 //정상적인 완료
  } else {
    return 2 //파일이 없음
  }
}

const deletefile = async function (Files, Kind, Type) {
  let Reposql
  let Cursql
  if (Kind == "image") {
    Reposql = `DELETE FROM imgfile WHERE FileName = '${Files}'`;
    Cursql = `DELETE FROM curimgfile WHERE FileNmae = '${Files}'`;
  }
  else if (Kind == "video") {
    Reposql = `DELETE FROM videofile WHERE FileName = '${Files}'`;
    Cursql = `DELETE FROM curvideofile WHERE FileNmae = '${Files}'`;
  }
  this.version++
  fs.unlink(`smartmirror/${Kind}/${Files}`, function (err) {
    if (err) console.log(err)
  })
  if (Type == "None") {
    await mysql.runQuery(Cursql)
  }
  await mysql.runQuery(Reposql)
  return "Complete"
}

/**
 * 
 * @param {"ImgFile,VidoeFile"} Type 
 * @param {"None,reservation"} Kind 
 * @returns 
 */
const GetFile = async function (Type, Kind) {
  const sql = `SELECT * FROM ${Type} WHERE Type = '${Kind}'`;
  const result = await mysql.runQuery(sql, null);
  return result;
}

/**
 * 스마트미러 저장소db에 있는 파일들 중
 * 날짜가 오늘과 같고 type이 reservation인 파일들과
 * type이 None인 파일들을 보여줄수 있도록 교체
 * @param {"ImgFile||ViodeFile"} Type 
 */
const ChangeFile = async function (Type) {
  const selectQuery = `SELECT * FROM ${Type} WHERE (Date = '${Days.month + Days.day}' AND Type = 'reservation') OR Type = 'None'`;
  const insertQuery = `INSERT INTO update (col1, col2, col3) VALUES ?`;

  const result = await mysql.runQuery(selectQuery)

  const dataToInsert = result.map(result => [result.col1, result.col2, result.col3]);
  mysql.runQuery(insertQuery, [dataToInsert])

}

/**
 * 
 * @param {"ImgFile||VideoFile"} Type 
 */
const DeleteAll = async function (Type) {
  const DelQuery = `DELETE FROM ${Type} ORDER BY Name ASC`;

  const result = await mysql.runQuery(DelQuery, null)
  return result
}

/**
 * 
 * @param {Table} Table 
 * @returns 
 */
const GetData = async function (Table) {
  const GetData = `SELECT * FROM ${Table}`;
  const result = await mysql.runQuery(GetData, null)
  return result
}

const UpdateData = async function (data) {
  const Updatesql = `UPDATE weather SET Code=${data} WHERE id=1`;
  const result = await mysql.runQuery(Updatesql, null)
  return result
}

module.exports = { SaveFile, deletefile, GetFile, ChangeFile, DeleteAll, GetData, UpdateData, version, smartMirror };

