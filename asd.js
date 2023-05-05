class PlaceInfo {
    constructor() {
      this.localselect = '';
      this.cityselect = '';
      this.villageselect = '';
      this.selectcityname = '';
      this.selectvillagename = '';
      this.localname = [];
      this.cityname = [];
      this.villagename = [];
      this.weathername = [];
      this.currentlocationX = 0;
      this.currentlocationY = 0;
    }
  
    async init() {
      await this.readFile();
    }
  
    async readFile() {
      const excelFile = xlsx.readFile('api/기상청41_단기예보 조회서비스_오픈API활용가이드_격자_위경도(20210401).xlsx');
      this.firstSheet = excelFile.Sheets[excelFile.SheetNames[0]];
    }
  
    async updateData(data) {
      if (data == '') {
        data = '2824561400'; //임시 데이터
      }
      await sqlmirror.UpdateData(data);
    }
  
    async setPlace(name, city, village) {
      this.localselect = name;
      this.cityselect = city;
      this.villageselect = village;
  
      for (let index = 2; index <= 3775; index++) {
        if (
          this.localselect == this.firstSheet['C' + index].v &&
          this.cityselect == this.firstSheet['D' + index].v &&
          this.villageselect == this.firstSheet['E' + index].v
        ) {
          const data = this.firstSheet['B' + index].v;
          this.selectcityname = this.firstSheet['D' + index].v;
          this.selectvillagename = this.firstSheet['E' + index].v;
          this.currentlocationX = this.firstSheet['F' + index].v;
          this.currentlocationY = this.firstSheet['G' + index].v;
          await this.updateData(data);
        }
      }
    }
  }
  
  const placeInfo = new PlaceInfo();
  await placeInfo.init();
  
  router.put('/weather', async function (req, res) {
    try {
      const name = req.body.name;
      const city = req.body.city;
      const village = req.body.village;
      await placeInfo.setPlace(name, city, village);
      sqlmirror.version++;
      res.redirect('main');
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'server error' });
    }
  });