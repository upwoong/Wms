
const mysql = require('./mySql')
const getDays = require('./getDays')

class waterInfo {
    constructor() {
        this.getDate = []
        this.maxValue = 0
    }
}

const getData = async function(Days) {
    let table
    let limit
    let dayColumn
    let waterInfoObj = new waterInfo()
    let valueObject = [[], []]
    if (Days == 12) {
        table = "monthuseage"
        limit = 12
        dayColumn = ""
    } else {
        table = "weekuseage"
        limit = 7
        dayColumn = ", Day DESC"
    }
    const query = `
  SELECT *
  FROM ${table}
  ORDER BY Year DESC, Month DESC${dayColumn}
  LIMIT ${limit};
`;
const data = await mysql.runQuery(query)
    for (let i = 0; i < data.length; i++) {
        Days == 12 ? waterInfoObj.getDate.push(data[i].Year +"."+data[i].Month) : waterInfoObj.getDate.push(data[i].Month + "." +data[i].Day)
        valueObject[0].push(parseFloat(data[i].Useage))
    }
    if (!valueObject[0]) valueObject[0].push(1)
    waterInfoObj.maxValue = Math.max.apply(null, valueObject[0])
    return {
        maxValue : waterInfoObj.maxValue,
        valueObject : valueObject,
        getDate : waterInfoObj.getDate
    }
}

const getPercent = function (Array) {
    let maxValue = Math.max.apply(null, Array.valueObject[0])
    for (let i = 0; i < Array.valueObject[0].length; i++) {
        Array.valueObject[1][i] = Number((Array.valueObject[0][i] / maxValue * 100).toFixed(0))
    }
    return Array
}

/**
 * 
 * @param {Number} Num 
 */
const addDb = async function (Num) {
    if (Num == 12) {
        for (let index = 0; index < 12; index++) {
            const sql = 'INSERT INTO monthuseage (Useage, Year, Month, Percent) VALUES (?, ?, ?, ?, ?)';
            const params = [0, getDays.Year, index + 1, getDays.Day, 0, 0];
            await mysql.runQuery(sql, params);
        }
    }
    else {
        const sql = 'INSERT INTO weekuseage (Useage, Year, Month, Day, Percent) VALUES (?, ?, ?, ?, ?)';
        const params = [0, getDays.Year, getDays.Month, getDays.Day, 0, 0];
        await mysql.runQuery(sql, params);
    }
    return console.log("새로운 수전데이터 생성완료")
}

const save = async function(Num,Useage,Date) {
    let split = Date.split('.')
    let split1 = Number(split[0])
    let split2 = Number(split[1])
    if(Num == 12){
        const sql = `UPDATE monthuseage 
        JOIN (SELECT MAX(id) AS max_id FROM weekuseage) AS temp 
        SET Useage=?, Year=?, Month=?
        WHERE weekuseage.id = temp.max_id;`;
        const params = [Useage, split1, split2];
        await mysql.runQuery(sql,params)
    }else {
        const sql = `UPDATE weekuseage 
        JOIN (SELECT MAX(id) AS max_id FROM weekuseage) AS temp 
        SET Useage=?, Month=?, Day=?
        WHERE weekuseage.id = temp.max_id;`;
        const params = [Useage, split1, split2];
        await mysql.runQuery(sql,params)
    }
}
module.exports = { getData, getPercent, addDb, save };