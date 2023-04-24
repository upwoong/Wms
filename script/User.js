const Mysql = require('./Mysql')

const FindUser = async function (id, password) {
    const Query = `SELECT * FROM adminuser WHERE Username = '${id}' AND Password = '${password}'`;
    const result = await Mysql.Runquery(Query, null)
    return result
}

module.exports = { FindUser }