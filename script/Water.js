
const mysql = require('./Mysql')
const getDays = require('./getDays')

class WaterUsage {
    constructor(table, limit, dayColumn) {
        this.table = table
        this.limit = limit
        this.dayColumn = dayColumn
        this.dates = []
        this.maxValue = 0
        this.values = [[], []]
    }
    async getData() {
        const query = `
        SELECT *
        FROM ${this.table}
        ORDER BY Year DESC, Month DESC${this.dayColumn}
        LIMIT ${this.limit};
        `
        const data = await mysql.runQuery(query)

        for (let i = 0; i < data.length; i++) {
            this.dates.push(this.getDate(data[i]))
            this.values[0].push(parseFloat(data[i].Useage))
        }

        if (!this.values[0].length) {
            this.values[0].push(1)
        }

        this.maxValue = Math.max.apply(null, this.values[0])

        return {
            maxValue: this.maxValue,
            values: this.values,
            dates: this.dates,
        }
    }

    getDate(data) {
        if (this.limit == 12) {
            return data.Year + "." + data.Month
        } else {
            return data.Month + "." + data.Day
        }
    }

    async getPercent() {
        this.maxValue = Math.max.apply(null, this.values[0])
        for (let i = 0; i < this.values[0].length; i++) {
            this.values[1][i] = Number((this.values[0][i] / this.maxValue * 100).toFixed(0))
        }
    }

    async addDb() {
        if (this.limit == 12) {
            for (let index = 0; index < 12; index++) {
                const sql = 'INSERT INTO monthuseage (Useage, Year, Month, Percent) VALUES (?, ?, ?, ?, ?)'
                const params = [0, getDays.Year, index + 1, getDays.Day, 0, 0]
                await mysql.runQuery(sql, params)
            }
        } else {
            const sql = 'INSERT INTO weekuseage (Useage, Year, Month, Day, Percent) VALUES (?, ?, ?, ?, ?)'
            const params = [0, getDays.Year, getDays.Month, getDays.Day, 0, 0]
            await mysql.runQuery(sql, params)
        }

        return console.log("새로운 수전데이터 생성완료")
    }
    async save(Num, Useage, Date) {
        let split = Date.split('.')
        let split1 = Number(split[0])
        let split2 = Number(split[1])
        if (Num == 12) {
            const sql = `UPDATE monthuseage 
            JOIN (SELECT MAX(id) AS max_id FROM weekuseage) AS temp 
            SET Useage=?, Year=?, Month=?
            WHERE weekuseage.id = temp.max_id;`
            const params = [Useage, split1, split2]
            await mysql.runQuery(sql, params)
        } else {
            const sql = `UPDATE weekuseage 
            JOIN (SELECT MAX(id) AS max_id FROM weekuseage) AS temp 
            SET Useage=?, Month=?, Day=?
            WHERE weekuseage.id = temp.max_id;`
            const params = [Useage, split1, split2]
            await mysql.runQuery(sql, params)
        }
    }
}
module.exports = { WaterUsage }