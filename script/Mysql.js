
const util = require('util')
const config = require('../config/sqlconfig')

const query = util.promisify(config.connection.query).bind(config.connection);
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