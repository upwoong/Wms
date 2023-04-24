
const mysql = require('./Mysql')
const Days = require('./getDays')
let Valueobject = []
let getDate = []
let maxValue = 0
let days = 0
const getData = async function(Days) {
    let table
    let sort
    let limit
    let dayColumn
    Valueobject[0] = []
    Valueobject[1] = []
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
console.log(query)
const data = await mysql.Runquery(query)
    for (let i = 0; i < data.length; i++) {
        Days == 12 ? getDate.push(data[i].Month) : getDate.push(data[i].Day)
        Valueobject[0].push(parseFloat(data[i].Useage))
    }
    getDate.sort((a, b) => b - a); // getDate 배열을 내림차순으로 정렬합니다.

    if (!Valueobject[0]) Valueobject[0].push(1)
    maxValue = Math.max.apply(null, Valueobject[0])
    return {
        maxValue : maxValue,
        Valueobject : Valueobject,
        getDate : getDate
    }
}

const getPercent = function (Array) {
    console.log(Array)
    let MaxValue = Math.max.apply(null, Array[0])
    console.log(MaxValue)
    for (let i = 0; i < Array[0].length; i++) {
        Array[1][i] = (Array[0][i] / MaxValue).toFixed(2) * 100
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
            const sql = 'INSERT INTO mytable (Year, Month, Day, Percent, Data) VALUES (?, ?, ?, ?, ?)';
            const params = [Days.Year, index + 1, Days.Day, 0, 0];
            await mysql.Runquery(sql, params);
        }
    }
    else {
        const sql = 'INSERT INTO mytable (Year, Month, Day, Percent, Data) VALUES (?, ?, ?, ?, ?)';
        const params = [Days.Year, Days.Month, Days.Day, 0, 0];
        await mysql.Runquery(sql, params);
    }
    return console.log("새로운 수전데이터 생성완료")
}
module.exports = { getData, getPercent, addDb, maxValue, Valueobject, getDate };


/*
const newArray = data.map((item) => ({
    id: item.id,
    name: item.name,

}));
내림차순 DESC - 1
오름차순 ASC 1
Year: DESC
days == 12 ASC
else DESC
*/