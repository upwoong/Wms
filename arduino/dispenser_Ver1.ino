#include <SPI.h>
#include <MFRC522.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <EEPROM.h>

#define SS_PIN  21  // ESP32 pin GIOP21 
#define RST_PIN 22 // ESP32 pin GIOP22 


const char* Host = "http://makingnfc.cafe24app.com/";

MFRC522 rfid(SS_PIN, RST_PIN);

String UID = "";

int freq = 1000;
int channel = 0;
int resolution = 8;
int LEDPIN = 13;

void setup() {
  // put your setup code here, to run once:
  pinMode(LEDPIN, OUTPUT);
  ledcWrite(channel, 0);
  Serial.begin(115200);
  ledcSetup(channel, freq, resolution);
  ledcAttachPin(25, channel);   //25번핀
  
  ledcWriteTone(channel, 1000);
  
  Serial.print("Calibrating please wait.");

  Serial.println("  done!.");
  
  //WiFi.begin("Galaxy S9+7444","ehdrhd12");
 //WiFi.begin("Makerspace_Team", "5z6669NN");
  //WiFi.begin("making","making3cmd");
  WiFi.begin("U+Net7404","@B556B659P");
  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");
  }
  Serial.println("WIFI OK");
  
  SPI.begin(); // init SPI bus
  rfid.PCD_Init(); // init MFRC522

  Serial.println("Tap RFID/NFC Tag on reader");
}

void loop() {
  // put your main code here, to run repeatedly:

  if (rfid.PICC_IsNewCardPresent()) { // new tag is available
    NFC();
     
  }
  
}
void NFC(void){
  if (rfid.PICC_ReadCardSerial()) { // NUID has been readed
      MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
      //Serial.print("RFID/NFC Tag Type: ");
      //Serial.println(rfid.PICC_GetTypeName(piccType));

      // print NUID in Serial Monitor in the hex format
      Serial.print("UID:");
      for (int i = 0; i < rfid.uid.size; i++) {
        Serial.print(rfid.uid.uidByte[i] < 0x10 ? " 0" : " ");
        Serial.print(rfid.uid.uidByte[i], HEX);
        UID += String(rfid.uid.uidByte[i], HEX);
      }
      Serial.println();
      Serial.print("String : ");
      Serial.println(UID);
      String Path = "nfc_recieve?id=" + UID;
      sendHTTPData(Path); // 서버에 값 보내는 함수
      UID = "";
      Serial.println(Path);
      rfid.PICC_HaltA(); // halt PICC
      rfid.PCD_StopCrypto1(); // stop encryption on PCD
      Tone(); 
  }
}
bool sendHTTPData(String raw)  //서버에 송신 함수
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
void Tone(void){
  ledcWrite(channel, 90);
  digitalWrite(LEDPIN,HIGH);
  delay(500);
  ledcWrite(channel, 0);
  digitalWrite(LEDPIN,LOW);
  }
