const mysql = require('./Mysql')
const getDays = require('./getDays')
require('dotenv').config()
let version = 0

class smartMirror {
  constructor(dbTable,kind) {
    this.refVideoArray = []
    this.refImageArray = []
    this.ComboVideo = [] //smartmirror의 갯수
    this.refContentsArray = []
    this.countOfSmartmirror = []

    this.numberImage = 0
    this.numberVideo = 0
    this.numberContents = 0

    this.allImgfile = []
    this.allVideofile = []
    this.allContentsFile = []

    this.dbTable = dbTable
    this.kind = kind
    this.selectDay = ''
  }
  async init() {
  }
  async getShowSmartmirror(setSmartmirror){
    for (let i = 0; i < this.refContentsArray.length; i++) {
      if (this.refContentsArray[i][0] == setSmartmirror) {
        this.numberContents = this.refContentsArray[i][1]
        break
      }
    }
  }

  async getContents(model, contents) {
    let data = new Array()
    if (model != "") data.push(model) //model이 비어있지 않는다면 data변수에 저장
    if (contents != "") data.push(contents) //contents가 비어있지 않는다면 data변수에 저장
  
    let state = true
      for (let i = 0; i < this.refContentsArray.length; i++) {
        if (this.refContentsArray[i][0] == model) // 중복된 모델의 경우 덮어쓰기
        {
          data.push(new Date())
          this.refContentsArray[i] = data //data배열의 첫번째 데이터는 스마트미러 모델명이다.
          state = false
          break
        }
      }
      if (state) { //중복된 모델의 경우가 아닐경우
        data.push(new Date())
        this.refContentsArray.push(data)
      }
  }

  async showContents() {
    const nowtime = new Date()
    this.countOfSmartmirror = new Array()
    for (let i = 0; i < this.refContentsArray.length; i++) {
      //현재시간에서 스마트미러의 비디오가 저장된 시간을 빼는 계산을 하여
      //현재 비디오가 몇분째 보여주고 있는지 계산한다.
      const elapsedMSec = nowtime - this.refContentsArray[i][2]
      const elapsedMin = elapsedMSec / 1000 / 60
      //만약 5분이상 보여주고 있다면 삭제를 하여 다음 비디오를 재생한다.
      if (elapsedMin > 5) this.refContentsArray.pop(i)
      this.countOfSmartmirror.push(this.refContentsArray[i][0])
    }
  }

  async SaveFile(Files, Days) {
    let sql = `INSERT INTO ${this.dbTable} (Name, Type, Date) VALUES (?, ?, ?)`

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
          filename = Files[i].filename
        }
      }
      const params = [filename, this.kind, currentday]
      await mysql.runQuery(sql, params)
    }
  }


  async deletefile(Files) {

    let sql = `DELETE FROM ${this.dbTable} WHERE FileName = '${Files}'`

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
  const sql = `SELECT * FROM ${this.dbTable} WHERE Type = '${this.kind}' ORDER BY Name ASC`
  this.refContentsArray = await mysql.runQuery(sql,null)
}

async ChangeFile() {
  const selectQuery = `SELECT * FROM ${this.dbTable} WHERE (Date = '${Days.month + Days.day}' AND Type = 'reservation') OR Type = 'None'`
  const insertQuery = `INSERT INTO update (col1, col2, col3) VALUES ?`

  const result = await mysql.runQuery(selectQuery)

  const dataToInsert = result.map(result => [result.col1, result.col2, result.col3])
  mysql.runQuery(insertQuery, [dataToInsert])

}

async DeleteAll() {
  const DelQuery = `DELETE FROM ${this.dbTable} ORDER BY Name ASC`

  const result = await mysql.runQuery(DelQuery, null)
  return result
}

async UpdateData(data) {
  const Updatesql = `UPDATE weather SET Code=${data} WHERE id=1`
  const result = await mysql.runQuery(Updatesql, null)
  return result
}
}

/**
 * 
 * @param {Table} Table 
 * @returns 
 */
const GetData = async function (Table) {
  const GetData = `SELECT * FROM ${Table}`
  const result = await mysql.runQuery(GetData, null)
  return result
}


module.exports = {GetData, version, smartMirror }

