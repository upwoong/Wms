const router = require("./router")

class regionInfo {
    constructor() {
        this.localSelect = ''
        this.citySelect = ''
        this.villageSelect = ''
        this.selectCityName = ''
        this.selectVillageName = ''
        this.localName = []
        this.cityName = []
        this.villageName = []
        this.weatherName = []
        this.weatherCode = 0
        this.currentLocationX = 0;
        this.currentLocationY = 0;
        this.firstSheet = []
    }

    async init() {
        await this.readFile()
        await this.getWeatherData()
        await this.getCurrentLocation()
        await this.getLocalArray()
    }
    async getWeatherData() {
        const GetWeather = await mirrorSql.GetData("weather")
        if (GetWeather) {
            this.weatherCode = GetWeather[0].Code
        }
        else {
            this.weatherCode = 2824561400
        }
    }

    async getLocalArray() {
        for (let index = 2; index <= 3775; index++) {
            let data = this.firstSheet["C" + index].v
            let state = true
            for (let i = 0; i < this.localName.length; i++) {
                if (this.localName[i] == data) {
                    state = false
                    break
                }
            }
            if (state) this.localName.push(data)
        }
    }

    async getCurrentLocation() {
        for (let index = 2; index < 3775; index++) {
            if (this.weatherCode == this.firstSheet["B" + index].v) {
                this.selectCityName = this.firstSheet["D" + index].v
                this.selectVillageName = this.firstSheet["E" + index].v
            }
        }
    }

    async readFile() {
        const excelFile = xlsx.readFile('api/기상청41_단기예보 조회서비스_오픈API활용가이드_격자_위경도(20210401).xlsx')
        this.firstSheet = excelFile.Sheets[excelFile.SheetNames[0]]
    }
    async updateData(data) {
        if (data == '') {
            data = 2824561400 //임시 데이터
        }
        await sqlmirror.UpdateData(data)
    }
    async selectPlace(local, city) {
        this.localSelect = local
        this.citySelect = city
        this.cityName = []

        for (let index = 2; index <= 3775; index++) {
            if (this.localSelect != this.firstSheet["C" + index].v) continue
            let data = this.firstSheet["D" + index].v
            if (data == "") continue
            let state = true
            for (let i = 0; i < this.cityName.length; i++) {
                if (this.cityName[i] == data) {
                    state = false
                    break
                }
            }
            if (state) this.cityName.push(data)
        }
        for (let index = 2; index <= 3775; index++) {
            if (this.localSelect == this.firstSheet["C" + index].v && this.citySelect == this.firstSheet["D" + index].v) {
                let data = this.firstSheet["E" + index].v
                if (data != "") this.villageName.push(data)
            }
        }
    }
    async setPlace(name, city, village) {
        this.localSelect = name
        this.citySelect = city
        this.villageSelect = village

        for (let index = 2; index <= 3775; index++) {
            if (
                this.localSelect == this.firstSheet['C' + index].v &&
                this.citySelect == this.firstSheet['D' + index].v &&
                this.villageSelect == this.firstSheet['E' + index].v
            ) {
                const data = this.firstSheet['B' + index].v;
                this.selectCityName = this.firstSheet['D' + index].v
                this.selectVillageName = this.firstSheet['E' + index].v
                this.currentLocationX = this.firstSheet['F' + index].v
                this.currentLocationY = this.firstSheet['G' + index].v
                await this.updateData(data)
            }
        }
    }
}
module.exports = {regionInfo,smartMirror}