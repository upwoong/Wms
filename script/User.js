const mysql = require('./Mysql')

const findUser = async function (id, password) {
    const Query = `SELECT * FROM adminuser WHERE Username = '${id}' AND Password = '${password}'`
    const result = await mysql.runQuery(Query, null)
    return result
}

module.exports = { findUser }