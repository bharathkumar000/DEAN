#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <UniversalTelegramBot.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>
#include <TinyGPS++.h>

// ================== Pin Definitions ==================
#define DHTPIN 14           
#define DHTTYPE DHT11

// HC-SR04 Ultrasonic Sensor Pins (Non-contact flood depth monitoring)
#define TRIG_PIN 25         
#define ECHO_PIN 26         

#define SOIL_MOISTURE_PIN 35
#define MQ_PIN 32           
#define RAIN_PIN 33         
#define GPS_RX_PIN 16       
#define GPS_TX_PIN 17       
#define WIND_SPEED_PIN 36   
#define WIND_DIR_PIN 39     

// MPU6050 Hardware Interrupt Pin (Wakes ESP32 from Deep Sleep on tremor)
#define MPU_INT_PIN 12

// ================== Sleep Configuration ==================
#define TIME_TO_SLEEP 1800  // Routine wake interval: 30 minutes (in seconds)
#define uS_TO_S_FACTOR 1000000ULL  // Conversion factor for micro seconds to seconds

// ================== Credentials ==================
const char* ssid = "YOUR_WIFI_SSID";         
const char* password = "YOUR_WIFI_PASSWORD"; 
const char* botToken = "YOUR_TELEGRAM_BOT_TOKEN";
const char* chatID = "YOUR_TELEGRAM_CHAT_ID";

const char* supabase_url = "https://YOUR_PROJECT_REF.supabase.co/rest/v1/sensor_logs";
const char* supabase_key = "YOUR_SUPABASE_ANON_KEY";

// ================== Logic Variables ==================
float prevTemp = 0, prevHum = 0, prevWaterDistance = 0, prevSeismic = 0, prevAir = 0, prevRain = 0;
int prevSoil = 0;
float prevPressure = 0, prevAltitude = 0, prevWindSpeed = 0, prevWindDir = 0;
double prevLat = 0, prevLng = 0;

int sameDataCount = 0;
int fetchCount = 0;
unsigned long currentInterval = 5000; 
unsigned long lastCheck = 0;

const float T_TOL = 0.5;   
const int S_TOL = 100;     
const float W_TOL = 5.0;    // Ultrasonic distance tolerance (cm)
const float V_TOL = 0.5;    // Vibration tolerance
const float A_TOL = 50.0;   // Air quality tolerance
const float R_TOL = 100.0;  // Rain tolerance
const float P_TOL = 2.0;    // Pressure tolerance
const float WIND_TOL = 5.0; // Wind speed tolerance

DHT dht(DHTPIN, DHTTYPE);
Adafruit_MPU6050 mpu;
Adafruit_BMP280 bmp;        
TinyGPSPlus gps;

// Hardware Status Flags
bool mpuAvailable = false;
bool bmpAvailable = false;

WiFiClientSecure client;
UniversalTelegramBot bot(botToken, client);

// ================== Ultrasonic Read Helper ==================
float readUltrasonicDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  if (duration == 0) return 999.0; // Out of range/error fallback
  
  // Calculate distance in cm (Speed of sound is ~340m/s or 0.034 cm/us)
  float distance = duration * 0.034 / 2.0;
  return distance;
}

// ================== Cloud API Sync ==================
void pushToSupabase(float t, float h, int s, float w, float v, float a, float r, 
                    float pressure, float altitude, float wind_speed, float wind_dir,
                    double latitude, double longitude, String status, int priority) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println(" [!] Failed to Sync to Cloud: WiFi Offline. Buffered for GSM SMS Gateway Relay.");
    return;
  }
  
  HTTPClient http;
  http.begin(supabase_url);
  http.addHeader("apikey", supabase_key);
  http.addHeader("Authorization", "Bearer " + String(supabase_key));
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Prefer", "return=minimal");

  StaticJsonDocument<512> doc;
  doc["device_id"] = "ESP32-01";
  doc["temperature"] = t;
  doc["humidity"] = h;
  doc["soil_moisture"] = s;
  doc["water_level"] = w; // Store distance or calculate inverse water depth
  doc["seismic"] = v;
  doc["air_quality"] = a;
  doc["rain_level"] = r;
  doc["baro_pressure"] = pressure;
  doc["altitude"] = altitude;
  doc["wind_speed"] = wind_speed;
  doc["wind_direction"] = wind_dir;
  doc["latitude"] = latitude;
  doc["longitude"] = longitude;
  doc["status"] = status;
  doc["priority_level"] = priority;

  String json;
  serializeJson(doc, json);
  
  Serial.println(" [>] Uploading payload to Supabase...");
  int response = http.POST(json);
  
  if (response > 0) {
    Serial.printf(" [✔] Supabase Success (Code: %d)\n", response);
  } else {
    Serial.printf(" [✘] Supabase Error: %s\n", http.errorToString(response).c_str());
  }
  http.end();
}

void handleNewMessages(int numNewMessages) {
  for (int i = 0; i < numNewMessages; i++) {
    String chat_id = String(bot.messages[i].chat_id);
    String text = bot.messages[i].text;

    if (text == "/start") {
      String welcome = "Welcome to ResqLink Bot!\n";
      welcome += "Use /status to get live sensor data.\n";
      welcome += "Use /help for more commands.";
      bot.sendMessage(chat_id, welcome, "");
    }

    if (text == "/status") {
      float h = dht.readHumidity();
      float t = dht.readTemperature();
      int s = analogRead(SOIL_MOISTURE_PIN);
      float w = readUltrasonicDistance();
      float a = analogRead(MQ_PIN);
      float r = 4095 - analogRead(RAIN_PIN);
      
      float pressureVal = 1013.25;
      float altVal = 0.0;
      if (bmpAvailable) {
        pressureVal = bmp.readPressure() / 100.0F;
        altVal = bmp.readAltitude(1013.25);
      }
      
      float windSpeedVal = analogRead(WIND_SPEED_PIN) * (120.0 / 4095.0);
      float windDirVal = analogRead(WIND_DIR_PIN) * (360.0 / 4095.0);

      String status = "📊 *Live Status Report*\n";
      status += "🌡 Temp: " + String(t) + "°C\n";
      status += "💧 Hum: " + String(h) + "%\n";
      status += "🌱 Soil: " + String(s) + "\n";
      status += "🌊 Water Distance: " + String(w) + " cm\n";
      status += "💨 Air Quality: " + String(a) + "\n";
      status += "🌧 Rain: " + String(r) + "\n";
      status += "🎈 Pressure: " + String(pressureVal) + " hPa\n";
      status += "🏔 Altitude: " + String(altVal) + " m\n";
      status += "💨 Wind Speed: " + String(windSpeedVal) + " km/h\n";
      status += "🧭 Wind Angle: " + String(windDirVal) + "°\n";
      
      bot.sendMessage(chat_id, status, "Markdown");
    }

    if (text == "/help") {
      String help = "ResqLink Bot Commands:\n";
      help += "/status - Get current sensor readings\n";
      help += "/start - Reset and show welcome message";
      bot.sendMessage(chat_id, help, "");
    }
  }
}

void print_wakeup_reason(){
  esp_sleep_wakeup_cause_t wakeup_reason = esp_sleep_get_wakeup_cause();
  switch(wakeup_reason){
    case ESP_SLEEP_WAKEUP_EXT0 : Serial.println(" [⚡ Wakeup] Tremor/Vibration detected by MPU6050 interrupt!"); break;
    case ESP_SLEEP_WAKEUP_TIMER : Serial.println(" [⚡ Wakeup] Routine timer wakeup."); break;
    default : Serial.printf(" [⚡ Wakeup] Normal power on or reason: %d\n", wakeup_reason); break;
  }
}

void setup() {
  Serial.begin(115200);
  Serial2.begin(9600, SERIAL_8N1, GPS_RX_PIN, GPS_TX_PIN); 
  delay(1000);
  
  Serial.println("\n\n====================================");
  Serial.println(" RESQLINK TELEMETRY & SMS MONITOR V5 ");
  Serial.println("====================================");

  print_wakeup_reason();
  
  dht.begin();
  
  // Initialize Ultrasonic Pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  // Initialize MPU6050
  if (!mpu.begin()) {
    Serial.println(" [!] MPU6050 NOT FOUND - Check Wiring!");
    mpuAvailable = false;
  } else {
    mpuAvailable = true;
    Serial.println(" [✔] MPU6050 Initialized!");
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    
    // Configure MPU6050 Motion Interrupt
    mpu.setInterruptPinPolarity(false); // Set pin to Active High (false = active high)
    mpu.setInterruptPinLatch(true);     // Latch the interrupt pin until status is read
    mpu.setMotionInterrupt(true);       // Enable motion detection interrupt
  }

  // Initialize BMP280 with auto address fallback (0x76 standard, 0x77 alternate)
  if (bmp.begin(0x76)) { 
    bmpAvailable = true;
    Serial.println(" [✔] BMP280 Initialized at I2C address 0x76!");
  } else if (bmp.begin(0x77)) {
    bmpAvailable = true;
    Serial.println(" [✔] BMP280 Initialized at I2C address 0x77!");
  } else {
    bmpAvailable = false;
    Serial.println(" [!] BMP280 NOT FOUND - Check I2C Address!");
  }

  pinMode(MPU_INT_PIN, INPUT_PULLDOWN);
  esp_sleep_enable_ext0_wakeup((gpio_num_t)MPU_INT_PIN, 1); 

  client.setInsecure();
  
  Serial.printf("Connecting to: %s ", ssid);
  WiFi.begin(ssid, password);
  
  unsigned long startWiFiAttempt = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - startWiFiAttempt < 8000) {
    delay(500);
    Serial.print(".");
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n [✔] WiFi Connected!");
    Serial.println(" [i] IP Address: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n [!] Wi-Fi Offline. Sensors buffered for GSM SMS Gateway Relay.");
  }
  Serial.println("------------------------------------");
}

void loop() {
  while (Serial2.available() > 0) {
    gps.encode(Serial2.read());
  }

  if (millis() - lastCheck > currentInterval) {
    lastCheck = millis();
    fetchCount++;

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int s = analogRead(SOIL_MOISTURE_PIN);
    float w = readUltrasonicDistance(); // Reads distance in cm
    float a_val = analogRead(MQ_PIN);
    float r_val = 4095 - analogRead(RAIN_PIN); 

    float v = 0.0;
    if (mpuAvailable) {
      sensors_event_t a, g, temp;
      mpu.getEvent(&a, &g, &temp);
      v = sqrt(sq(a.acceleration.x) + sq(a.acceleration.y) + sq(a.acceleration.z)); 
    }

    float pressureVal = 1013.25;
    float altVal = 0.0;
    if (bmpAvailable) {
      pressureVal = bmp.readPressure() / 100.0F; 
      altVal = bmp.readAltitude(1013.25);
    }

    float windSpeedVal = analogRead(WIND_SPEED_PIN) * (120.0 / 4095.0); 
    float windDirVal = analogRead(WIND_DIR_PIN) * (360.0 / 4095.0);    

    double latVal = 12.3168; 
    double lngVal = 76.6135;
    if (gps.location.isValid()) {
      latVal = gps.location.lat();
      lngVal = gps.location.lng();
    }

    bool majorChange = (abs(t - prevTemp) > T_TOL) || 
                       (abs(s - prevSoil) > S_TOL) || 
                       (abs(w - prevWaterDistance) > W_TOL) ||
                       (abs(v - prevSeismic) > V_TOL) ||
                       (abs(a_val - prevAir) > A_TOL) ||
                       (abs(r_val - prevRain) > R_TOL) ||
                       (abs(pressureVal - prevPressure) > P_TOL) ||
                       (abs(windSpeedVal - prevWindSpeed) > WIND_TOL);

    Serial.println("\n--- [ FETCH SEQUENCE #" + String(fetchCount) + " ] ---");
    Serial.printf(" TIME: %lu ms | INTERVAL: %lus\n", millis(), currentInterval / 1000);
    
    if (isnan(t) || isnan(h)) {
      Serial.println(" [!] SENSOR ERROR: Check DHT11!");
    } else {
      Serial.printf(" TEMP: %.1f °C | HUM: %.1f %%\n", t, h);
    }
    Serial.printf(" SOIL: %d | WATER DIST: %.1f cm | SEISMIC: %.2f m/s²\n", s, w, v);
    Serial.printf(" PRESSURE: %.1f hPa | WIND: %.1f km/h\n", pressureVal, windSpeedVal);
    Serial.printf(" GPS: LAT %.6f | LNG %.6f\n", latVal, lngVal);

    if (!majorChange) {
      sameDataCount++;
      Serial.println(" STATUS: [ STABLE ] - Skipping Cloud Upload");

      if (sameDataCount >= 3 && sameDataCount < 6) {
        currentInterval = 10000;
      } else if (sameDataCount >= 6) {
        currentInterval = 30000;
      }
    } else {
      Serial.println(" STATUS: [ DRIFT DETECTED ]");
      sameDataCount = 0;
      currentInterval = 5000; 
      
      prevTemp = t; prevHum = h; prevSoil = s; prevWaterDistance = w; prevSeismic = v; prevAir = a_val; prevRain = r_val;
      prevPressure = pressureVal; prevAltitude = altVal; prevWindSpeed = windSpeedVal; prevWindDir = windDirVal;
      prevLat = latVal; prevLng = lngVal;

      String status = "Updated";
      int priorityLevel = 3; 

      if (a_val > 1500) { status = "Smoke/Gas Alert"; priorityLevel = 1; }
      else if (v > 15.0) { status = "Earthquake Alert"; priorityLevel = 1; }
      // Ultrasonic: low distance value means the water level has risen closer to the sensor
      else if (w < 30.0) { status = "Flood Alert (Water Level High)"; priorityLevel = 2; }
      else if (r_val > 2500) { status = "Heavy Rain Alert"; priorityLevel = 2; }
      else if (windSpeedVal > 60.0) { status = "Storm Alert"; priorityLevel = 2; }
      
      pushToSupabase(t, h, s, w, v, a_val, r_val, pressureVal, altVal, windSpeedVal, windDirVal, latVal, lngVal, status, priorityLevel);

      if (status != "Updated" && WiFi.status() == WL_CONNECTED) {
        String msg = "🚨 ResqLink Alert: " + status + "\nLocation: Lat " + String(latVal, 5) + ", Lng " + String(lngVal, 5);
        if (strcmp(chatID, "YOUR_TELEGRAM_CHAT_ID") != 0 && strlen(chatID) > 0) {
          bot.sendMessage(chatID, msg, "");
        }
      }
    }
    Serial.println("====================================");
  }

  if (WiFi.status() == WL_CONNECTED && strcmp(chatID, "YOUR_TELEGRAM_CHAT_ID") != 0 && strlen(chatID) > 0) {
    static unsigned long lastBotCheck = 0;
    if (millis() - lastBotCheck > 1000) {
      int numNewMessages = bot.getUpdates(bot.last_message_received + 1);
      while (numNewMessages) {
        handleNewMessages(numNewMessages);
        numNewMessages = bot.getUpdates(bot.last_message_received + 1);
      }
      lastBotCheck = millis();
    }
  }
}
