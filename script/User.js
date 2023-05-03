const Mysql = require('./mySql')

const findUser = async function (id, password) {
    const Query = `SELECT * FROM adminuser WHERE Username = '${id}' AND Password = '${password}'`;
    const result = await Mysql.Runquery(Query, null)
    return result
}

module.exports = { findUser }