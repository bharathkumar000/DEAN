# 🔌 ResQLink — Hardware & Sensor Architecture

This document details the hardware configuration, schematic wiring parameters, firmware rule engine, and power optimization layers of the ResQLink Sensor Node.

---

## 🏗️ 1. Hardware Pinout & Wiring Specifications

All sensors connect directly to the ESP32 DevKit V1 board. Pin mappings are strictly defined to guarantee boot-safety and avoid signal interference:

| Component | Sensor Model | ESP32 GPIO | Protocol | Power | Purpose |
|:---|:---|:---|:---|:---|:---|
| **Thermal Sensor** | DHT11 | **GPIO 14** | One-Wire | 3.3V | Ambient temperature & relative humidity |
| **Seismic Sensor** | MPU6050 | **GPIO 21 (SDA)<br/>GPIO 22 (SCL)** | I2C | 3.3V | Acceleration vector tracking for tremor detection |
| **Flood Sensor** | Parallel Water Line | **GPIO 34** | Analog ADC | 3.3V | Accumulating floodwater height tracking |
| **Soil Moisture** | Resistive Probe | **GPIO 35** | Analog ADC | 3.3V | Earth moisture monitoring for landslide warnings |
| **Rain Gauge** | Resistive Grid | **GPIO 33** | Analog ADC | 3.3V | Cloudburst & rainfall intensity measurements |

---

## 🧠 2. Alert Engine Logic

The firmware evaluates sensor inputs against predefined emergency thresholds. Any critical event triggers an immediate alert:

```
                  [ Sensor Readings Loaded ]
                              │
                              ▼
            ⚡ Threshold Validation Engine ⚡
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
 [ Seismic > 15m/s² ]   [ Water > 2000 ]       [ Rain > 2500 ]
       │                      │                      │
       ▼                      ▼                      ▼
  Earthquake              Flood Alarm            Cloudburst
🚨 Alert Issued        🚨 Alert Issued        🚨 Alert Issued
```

### Alert Threshold Matrix:
- **Earthquake detection**: Vector magnitude calculated as $v = \sqrt{a_x^2 + a_y^2 + a_z^2}$. Triggered when $v > 15.0 \, m/s^2$.
- **Flood warning**: Water accumulation sensor reading $> 2000$ (out of 4095 ADC).
- **Landslide risk**: Active when Temperature $> 45^\circ\text{C}$ AND Soil Moisture reading $> 3800$ ADC.
- **Cloudburst warning**: Rain sensor reading $> 2500$ ADC.

---

## 🔌 3. Adaptive Throttling Algorithm (Power Efficiency)

Telemetry nodes operating in the field rely on portable solar panels and battery storage. To conserve power, the node dynamically adjusts its active loop timing based on environment activity:

```
               [ Sensor Evaluation Loop ]
                           │
             Is Hysteresis Limit Broken?
             (DHT11, MPU6050, Water Level)
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
         [ YES ]                       [ NO ]
            │                             │
    Set active mode               Increment idle count
    Check Thresholds              Does count exceed limits?
  Sync REST + Telegram                    │
  Set Interval = 5s             ┌─────────┴─────────┐
                                ▼                   ▼
                             [ YES ]             [ NO ]
                                │                   │
                        Throttle down to     Keep current
                       30s interval (Sleep)    interval
```

- **Active State (5-second loop)**: Triggered if readings differ from the last upload by more than the hysteresis bounds ($\pm 0.5^\circ\text{C}$, $\pm 50$ water ADC). Updates are immediate.
- **Idle Cooldown**: If no sensors exceed hysteresis limits, the loop intervals step up from 5s to 10s, and finally throttle down to **30 seconds** to maximize battery conservation.

---

## 📨 4. Telegram Integration Interface

When a threshold is breached, the node formats a message payload and initiates an HTTPS client connection using the `UniversalTelegramBot.h` library:
- **Channel**: Dispatches to configured emergency channel chat ID.
- **Commands**: Supports `/status` polling. The bot parses incoming queries and replies with live formatted telemetry logs.
