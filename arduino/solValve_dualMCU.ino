#include "CustomLCD_ESP32.h"
#include "Paint.h"
#include <HTTPClient.h>
#include <WiFi.h>
//서버 주소입력
const char* Host = "https://localhost/";

#define SV_1 25         //B-1A
#define SV_2 26         //B-1B 
#define IR_1 32         //적외선센서 들올 때
#define IR_2 33         //적외선센서 나갈 때
#define SENSOR 27
#define TIMER 30000
#define SOAP 5000
#define COOLTIME 30000

CustomLCD LCD128;

bool sendHTTPData(String);
String getHTTPData(String, int);

bool sendtrigger = false;

long currentMillis = 0;   //1초를 측정하기 위한 현제 millis
long previousMillis = 0;  //1초를 측정하기 위한 과거 millis
int interval = 1000;      //현제 millis와 과거 millis의 차이값 1초
int value = 0;

volatile bool solstate = 0;           // 솔 벨브 상태
volatile unsigned long solMillis;   // Mode 1&2의 시작을 감지하는 변수
volatile unsigned long timerMillis; // Mode3를 감지하는 변수
volatile int Mode = 0;              //비누 대기상태[시작, 5초 이내, 쿨타임 이내]

volatile byte pulseCount;             //유량센서 펄스가 들어올때 마다 증가되는 변수
volatile unsigned int flowMilliLiters;    //1초에 들어오는 유량
volatile unsigned long totalMilliLiters;  //유량 총합
float flowRate;                       // 1에 가까운 수(1000ms / millis()로 측정된 1초) x 1초에 들어오는 펄스 값 / 보정계수 
float calibrationFactor = 4.5;        // 보정계수
byte pulse1Sec = 0;                   // 1초에 들어오는 펄스 값

void IRAM_ATTR IRsignal_1();
void IRAM_ATTR IRsignal_2();

void pulseCounter()   //유량센서 인터럽트 함수 (펄스값만 증가)
{
  pulseCount++;  
}

void setup() {
  // Set pin mode 
  //WIFI_CONNECT
  WiFi.begin("WIFI", "WIFI_PASSWORD");
  while(WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println("WIFI OK");
  pinMode(IR_1, INPUT);
  pinMode(IR_2, INPUT);
  pinMode(SV_1, OUTPUT);
  pinMode(SV_2, OUTPUT);
  pinMode(SENSOR, INPUT_PULLUP);
  pulseCount = 0;
  flowRate = 0.0;
  flowMilliLiters = 0;
  totalMilliLiters = 0;
  previousMillis = 0;
  attachInterrupt(digitalPinToInterrupt(IR_1), IRsignal_1, RISING); 
  attachInterrupt(digitalPinToInterrupt(IR_2), IRsignal_2, RISING);
  attachInterrupt(digitalPinToInterrupt(SENSOR), pulseCounter, FALLING);
  digitalWrite(SV_1, LOW);
  digitalWrite(SV_2, LOW);
  Serial.begin(115200);
  LCD128.begin();
  LCD128.Clear(0);
} 
void loop() {
  currentMillis = millis();
  if(currentMillis - previousMillis > interval){
    pulse1Sec = pulseCount;
    pulseCount = 0;
    flowRate = ((1000.0 / (millis() - previousMillis)) * pulse1Sec) / calibrationFactor;
    previousMillis = millis();
    flowMilliLiters = (flowRate / 60)*1000;
    totalMilliLiters += flowMilliLiters;
    //유량센서 데이터시트 기반으로 계산된 펄스값과 계산된 흐른 물의 총량
    Serial.print("Flow rate : ");
    Serial.print(int(flowRate));
    Serial.print("L/min");
    Serial.print("\t");
    Serial.print("Output Liquid Quantity: ");
    Serial.print(totalMilliLiters);
    Serial.println("mL / ");
    Serial.print("Mode : ");
    Serial.println(Mode);
  }
  if(sendtrigger){
    Serial.print("send");
    value = totalMilliLiters;
    String Path = "water_useage/daily?amount=" + String(value);
    sendHTTPData(Path); // 서버에 값 보내는 함수
    totalMilliLiters = 0;
    sendtrigger = false;
    digitalWrite(SV_1, LOW);
    digitalWrite(SV_2, LOW);
   }
  SolvalveStep(); 
}
void IRAM_ATTR IRsignal_1(){
  solstate = 1;
  // solscan 이 1일 때만 체크
  if(Mode == 0) solMillis = millis(); // 최초 감지 시간을 체크
  else if(Mode == 2) timerMillis = millis(); // 30 피크에 대한 최초 시간을 체크
}
void IRAM_ATTR IRsignal_2(){
  solstate = 0;
}
void SolvalveStep() {
  
  switch(Mode)
  {
    case 0: // 깬 상태에서 감지되면 Mode -> 1
      
        if(solstate) Mode = 1;
        digitalWrite(SV_1, LOW);
        digitalWrite(SV_2, LOW);
      
      break;
    case 1: // 5초 이내의 경우 원하는데로 제어가능
      if(millis() - solMillis <= SOAP) solvalveonoff(solstate);
      else // 5초가 지나면 자동으로 꺼짐
      {
        solvalveonoff(0);
        Mode = 2;
        solstate = 0;
      }
      break;
    case 2: // 5초 이후 20초 이내에 감지가 되면 Mode -> 3 / 20초가 지나면 Mode -> 0
      if(millis() - solMillis <= COOLTIME)
      {
        solvalveonoff(0);
        if(solstate) Mode = 3;
      }
      else {
        Mode = 0;
        sendtrigger = true;
      }
      break;
    case 3: // 20초 쿨타임 이내에 감지되면 30초동안 감지가 안될 때까지 작동
      if(millis() - timerMillis <= TIMER)
      {
        solvalveonoff(1);
        if(!solstate) // 손을 빼면 Mode2 이내의 시간인지, 초과인지 체크
        {
          if(millis() - solMillis <= COOLTIME) Mode = 2;// Mode2 이내의 시간이면 Mode -> 2
          else {
            Mode = 0;
            sendtrigger = true;
          } 
        }
      }
      else {
        Mode = 0;
        sendtrigger = true;
      }
      break;
  }
  
}

void solvalveonoff(bool state){
  digitalWrite(SV_1, !state);
  digitalWrite(SV_2, state); 
}
bool sendHTTPData(String raw)
{
  if (WiFi.status() != WL_CONNECTED) return false;
  bool result = false;
  HTTPClient http;
  String Path = Host + raw;
  http.begin(Path.c_str());
  int httpResponseCode = http.GET();
  if (httpResponseCode > 0) result = true;
  http.end();
  return result;
} 
//solenoidvalve_flowsensor_IRAM
