const schedule = require('node-schedule')
const request = require('request')
const moment = require('moment')
const Days = require('./getDays')
const cheerio = require('cheerio')
let weathername = new Array()
let weatherdata = new Array()

let url = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getUltraSrtNcst';
let queryParams = '?' + encodeURIComponent('ServiceKey') + '=VHqmEJqAw45745GV0%2BkA3l6TePYLRpgPhuEYJMsNv69w%2F6NaV98Z6fOUZruSuV7xvSyOfSDEa941PCus5fUjzg%3D%3D'; /* Service Key*/
queryParams += '&' + encodeURIComponent('pageNo') + '=' + encodeURIComponent('1'); /* */
queryParams += '&' + encodeURIComponent('numOfRows') + '=' + encodeURIComponent('1000'); /* */
queryParams += '&' + encodeURIComponent('dataType') + '=' + encodeURIComponent('XML'); /* */
queryParams += '&' + encodeURIComponent('base_date') + '=' + encodeURIComponent('20230223'); /* */
queryParams += '&' + encodeURIComponent('base_time') + '=' + encodeURIComponent('0600'); /* */
queryParams += '&' + encodeURIComponent('nx') + '=' + encodeURIComponent('55'); /* */
queryParams += '&' + encodeURIComponent('ny') + '=' + encodeURIComponent('127'); /* */

let k = schedule.scheduleJob("*/10 * * * * *", function () {
    let nowhourtime = Days.Hour+"00"

    if (Days.min < 30) {
        nowhourtime = nowhourtime - 100
    }
   if (nowhourtime < 1000) {
        nowhourtime = "0" + nowhourtime
    }
    const hourtime = nowhourtime.toString()

    
    request({ url: url + queryParams, method: 'GET' }, function (error, response, body) {
        
        if (weatherdata != "") {
            weatherdata = new Array()
            weathername = new Array()
        }
        $ = cheerio.load(body);
        $('item').each(function (idx) {
            const time = $(this).find('baseTime').text();
            const weather = $(this).find('category').text()
            const wea_val = $(this).find('obsrValue').text()
            if (weather == 'PTY' || weather == 'T1H') {
                weathername.push(weather)
                weatherdata.push(wea_val)
            }
            console.log(weatherdata)
        });
    })
    

    /*
    없음(0), 비(1), 비/눈(2), 눈(3), 소나기(4), 빗방울(5), 빗방울/눈날림(6), 눈날림(7)
    */
    let currentimg
    switch (weatherdata[0]) {
        case '0': currentimg = "weathericon/weather-0.png"
            break
        case '1': currentimg = "weathericon/weather-4.png"
            break
        case '2':
        case '6': currentimg = "weathericon/weather-2.png"
            break
        case '3':
        case '7': currentimg = "weathericon/weather-3.png"
            break
        case '4':
        case '5': currentimg = "weathericon/weather-1.png"
            break
    }
    
})
