### WaterManageSystem

## 프로젝트 배경
이 프로젝트는 '손을 잘 씻자'라는 취지에서 나왔으며   
영상을 통해 손씻는 방법을 제공하고 자동화된 기능들로 편의성을 더해준다.

* * *
## 사용된 기술 스택   
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=green"><img src="https://img.shields.io/badge/handlebars.js-000000?style=for-the-badge&logo=handlebars.js&logoColor=white"><img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=Express&logoColor=white"><img src="https://img.shields.io/badge/MySql-4479A1?style=for-the-badge&logo=MySql&logoColor=white"><img src="https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=HTML5&logoColor=white"><img src="https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=CSS3&logoColor=white"><img src="https://img.shields.io/badge/Javascript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white"><img src="https://img.shields.io/badge/Arduino-00979D?style=for-the-badge&logo=Arduino&logoColor=white"><img src="https://img.shields.io/badge/php-777BB4?style=for-the-badge&logo=php&logoColor=white">

* * *
## 설치 방법
**Node** [https://nodejs.org/ko/download](https://nodejs.org/ko/download)   
**MySql** [https://dev.mysql.com/downloads/installer/](https://dev.mysql.com/downloads/installer/)   
**Arduino** [https://www.arduino.cc/en/softwared](https://www.arduino.cc/en/softwared)   

* * *
## 시작 방법
* git   
```git
git clone https://github.com/upwoong/Wms.git
```

* .env파일 생성
```env
DB_HOST='IP'
DB_PORT=Port
DB_NAME='DB_NAME'
DB_USER='DB_USER'
DB_PASS='DB_PASSWORD'
```

* 인증서 생성
```cmd
openssl req -nodes -new -x509 -keyout server.key -out localhost.cert
```

* Node
```Node
node server.js
```

```cpp
const char* Host = "https://localhost/";
WiFi.begin("WIFI", "WIFI_PASSWORD");
```

* * *
## 프로젝트 기여도
* 프론트 엔드
  * http 통신 (20%)
* 아두이노
  * http 통신 (10%)
* 백엔드
  * API 설계 및 개발 (90%)

* * *
## Rest Api 문서
| URL | METHOD | Request Body | Response Body |
| --- | --- | --- | --- |
| /insertImage | Post | { originalname : "Name",   mimetype : "Type",   destination : "smartmirror/image" | --- |
| /insertVideo | Post | { originalname : "Name",   mimetype : "Type",   destination : "smartmirror/video" | --- |
| /deleteImage | Post | { originalname : "Name",   mimetype : "Type",   destination : "smartmirror/image" | --- |
| /deleteVideo | Post | { originalname : "Name",   mimetype : "Type",   destination : "smartmirror/video" | --- |
| /weatherList | put | [서울특별시,부산광역시,대구광역시...] | --- |
| /SelectSmartmirror | Put | { selectSmartmirror : "contents"} | --- |
| /LoginUser | Post | { name : "Name", password : "Password"} | --- |
| /mediacontents | Get | --- | vidoefile : Array, imgfile : Array |
| /bookMedia | Get | --- | vidoefile : Array, imgfile : Array |
| /main | Get | --- | selectcityname : String, selectvillagename : String, weekData : Array, yeerData : Array, vidoefile : Array, imgfile : Array |
| /waterUseage | Get | --- | selectcityname : String, selectvillagename : String, weekData : Array, yeerData : Array |
| /smartMirrorManage | Get | --- | videodata : Array, imgdata : Array, ComboVideo : Array |


* * *

## 구현된 기능
### 아두이노
- 물 사용량
    ```javascript
    router.get('/water_useage/daily', async function (req, res) {
        try {
            let watervalue = parseFloat(((req.query.amount) / 1000).toFixed(3))
            waterArray.weekData.Valueobject[0][0] = parseFloat((parseFloat(waterArray.weekData.Valueobject[0][0]) + watervalue).toFixed(3))
            await Water.getPercent(waterArray.weekData)
            io.emit('weekendwater', waterArray.weekData.Valueobject[0][0])  //량
            io.emit('waterpercent', waterArray.weekData.Valueobject[1]) //일주일%
            res.render('dummy', { layout: null })
        } catch (err) {
            console.log(err)
        }
    }
    ```
    아두이노로부터 받은 데이터를 데이터베이스에 있는 데이터에 더하여 화면에 출력합니다.
    - 결과 화면
        <p align="center"><img src="https://github.com/upwoong/Wms/blob/main/Wms-screenshots/waterUseage.png?raw=true" width="400"></p>

### 휴지 디스펜서
- 남은 양
    ```javascript
    router.get('/tollet-paper-quantity', function (req, res) {
        try {
            let number = req.query.number
            let hand = req.query.remain
            io.emit('remain', [number, hand])
            res.render('dummy', { layout: null })
        }
        catch (err) {
        }
    })
    ```
    아두이노로부터 받은 남은 휴지의 양을 화면에 출력합니다.
    - 결과 화면   
        ![paper-remain-quantity](https://github.com/upwoong/Wms/blob/main/Wms-screenshots/paper-remain-quantity.png)

### 스마트미러
- 이미지와 비디오
    등록한 이미지와 비디오를 스마트미러에 보여줍니다.
    <p align="center"><img src="https://github.com/upwoong/Wms/blob/main/Wms-screenshots/smartmirror-result.png?raw=true" width="400"></p>

* * *
### 사용 방법
* 아두이노 통신
> 데이터 보내기
```cpp
String Path = "water_useage/daily?amount=" + String(value);
sendHTTPData(Path); // 서버에 값 보내는 함수
```
  * 스마트미러 사용방법   
추가 화면{ ex) : add - naver.png}
<img src="https://github.com/upwoong/Wms/blob/main/Wms-screenshots/add-naver.png?raw=true" width="400">

 * 결과 화면{ ex) : result - naver-png}
<img src="https://github.com/upwoong/Wms/blob/main/Wms-screenshots/result-naver.png?raw=true" width="400">

* * *
## 기여자
KMH : 프론트 엔드 구성 (80%)   
KDH : 아두이노 개발 (90%)   
LDG : 스마트미러 개발 (100%), 백엔드 개발(10%)

* * *
## 향후 계획
일별 수전사용량의 모든 데이터를 게시판 형태로 보여주기
