const mysql = require('mysql2');
const util = require('util')
// MySQL 연결 설정
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'ehdrhd12',
  database: 'wmsadmin',
  port : 3306
});

// MySQL 연결
connection.connect((err) => {
  if (err) throw err;
  console.log('MySQL Connected!');
});
const query = util.promisify(connection.query).bind(connection);
// MySQL 쿼리 실행 함수
const Runquery = async function(sql, params) {
  try{
    const result = await query(sql, params);
    return result
  }catch(err){
    console.log(err)
  }
}

// MySQL 연결 종료 함수
function end() {
  connection.end();
  console.log('MySQL Disconnected!');
}

module.exports = { Runquery, end };