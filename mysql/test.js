const test = require('./Mysql')

const sqlmirror = require('./crud')

const water= require('../script/Water')


async function init(){
    const getdata = await water.getData(12)
    const getp = await water.getPercent(getdata.Valueobject)
}

init()