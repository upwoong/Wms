const moment = require('moment')

module.exports.Year = moment().format('YY')
module.exports.Month = moment().format('MM')
module.exports.Day = moment().format('DD')
module.exports.Date = moment().format('YY-MM-DD')
module.exports.base_date = moment().format('YYYYMMDD')
module.exports.Hour = moment().format('HH')
module.exports.Min = moment().format('mm')