const mysql = require('./Mysql');
const getDays = require('./getDays')
require('dotenv').config();
let version = 0

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
  if(Days == 0) selectday = getDays.Date
  else selectday = Days
  
    const strArr = selectday.split('-')
    const currentday = strArr[1] + strArr[2]
  console.log(selectday)
  this.version++
  if (Files.length > 0) {
    console.dir(Files[0]);

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
      await mysql.Runquery(Cursql, params);
    }
    const paramsa = [filename, "None", currentday];
    await mysql.Runquery(Reposql, paramsa);
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
    Cursql =`DELETE FROM curimgfile WHERE FileNmae = '${Files}'`;
  }
  else if (Kind == "video") {
    Reposql = `DELETE FROM videofile WHERE FileName = '${Files}'`;
    Cursql =`DELETE FROM curvideofile WHERE FileNmae = '${Files}'`;
  }
  this.version++
  fs.unlink(`smartmirror/${Kind}/${Files}`, function (err) {
      if (err) console.log(err)
  })
  if(Type == "None") {
    await mysql.Runquery(Cursql)
  }
  await mysql.Runquery(Reposql)
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
  const result = await mysql.Runquery(sql, null);
  return result;
}

/**
 * 스마트미러 저장소db에 있는 파일들 중
 * 날짜가 오늘과 같고 type이 reservation인 파일들과
 * type이 None인 파일들을 보여줄수 있도록 교체
 * @param {"ImgFile||ViodeFile"} Type 
 */
const ChangeFile =async function (Type) {
  const selectQuery = `SELECT * FROM ${Type} WHERE (Date = '${Days.month + Days.day}' AND Type = 'reservation') OR Type = 'None'`;
  const insertQuery = `INSERT INTO update (col1, col2, col3) VALUES ?`;

  const result =await  mysql.Runquery(selectQuery)

    const dataToInsert = result.map(result => [result.col1, result.col2, result.col3]);
    mysql.Runquery(insertQuery, [dataToInsert])

}

/**
 * 
 * @param {"ImgFile||VideoFile"} Type 
 */
const DeleteAll = async function(Type){
  const DelQuery = `DELETE FROM ${Type} ORDER BY Name ASC`;

  const result = await mysql.Runquery(DelQuery, null)
  return result
}

/**
 * 
 * @param {Table} Table 
 * @returns 
 */
const GetData = async function(Table){
  const GetData = `SELECT * FROM ${Table}`;
  const result = await mysql.Runquery(GetData, null)
  return result
}

const UpdateData = async function(data) {
  const Updatesql = `UPDATE weather SET Code=${data} WHERE id=1`;
  const result = await mysql.Runquery(Updatesql, null)
  return result
}

module.exports = {SaveFile, deletefile, GetFile, ChangeFile, DeleteAll, GetData, UpdateData, version };


function copyDataToUpdateTable() {
  const today = new Date().toISOString().slice(0, 10);

  
}

copyDataToUpdateTable();