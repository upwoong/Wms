// MySQL 연결 설정
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  });
  /*
const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'ehdrhd12',
    database: 'wmsadmin',
    port : 3306
  });
  */
  // MySQL 연결
  connection.connect((err) => {
    if (err) throw err;
    console.log('MySQL Connected!');
  });

  module.exports ={ connection }

