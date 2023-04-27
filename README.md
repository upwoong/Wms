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
  * API 설계 및 개발 (100%)

* * *
## Rest Api 문서
| URL | METHOD | Request Body | Response Body |
| --- | --- | --- | --- |
| /InsertContent | Post | --- | --- |
| /DeleteContent | Delete | --- | --- |
| /WeatherList | Post | --- | --- |
| /SelectSmartmirror | Put | --- | --- |
| /LoginUser | Post | --- | --- |
| /mediacontents | Get | --- | --- |
| /BookMedia | Get | --- | --- |
| /Main | Get | --- | --- |
| /WaterUseage | Get | --- | --- |
| /SmartMirrorManage | Get | --- | --- |


* * *
## 구현된 기능
| 기능 설명 | 스크린샷 |
| --- | --- |
| 1. 아두이노 통신 | |
| 1.1. 아두이노에서 손을 씻기 위해 물을 사용하면 사용량을 http통신으로 서버에 값을 받아와 처리합니다. | 수전 페이지 |
| 1.2. 아두이노에서 휴지 사용 감지 시, 휴지의 남은 양을 http통신으로 서버에 값을 받아와 처리합니다. | 메인페이지 하단 편집후 사용 |
| 2. 스마트미러 | |
| 2.1. 서버에서 이미지 또는 비디오 등록시 스마트미러에 보여줍니다. | ![스크린샷 제목 2-1](스크린샷 파일 경로 2-1) |

* * *
## 사용 방법
* 아두이노 통신
> 데이터 보내기
```cpp
String Path = "water_useage/daily?amount=" + String(value);
sendHTTPData(Path); // 서버에 값 보내는 함수
```
* 스마트미러 사용방법   
추가하는 이미지1
실제 스마트미러 실행화면

* * *
## 기여자
KMH : 프론트 엔드 구성 (80%)
KDH : 아두이노 개발 (90%)
LDG : 스마트미러 개발 (100%)

* * *
## 향후 계획
일별 수전사용량의 모든 데이터를 게시판 형태로 보여주기
