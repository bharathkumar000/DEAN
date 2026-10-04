# 📡 ResQLink — Complete System Architecture & Workflow Document

> **Last Updated**: August 2026 | **Version**: 5.1 (Emergency Power Hub Removed)
> A unified reference covering every module, technology, protocol, and data pipeline in the ResQLink disaster response platform.

---

## 🗺️ 1. Full-Stack Hybrid Architecture

```mermaid
flowchart TD
    classDef hw fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#01579b
    classDef fw fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px,color:#1b5e20
    classDef mob fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#4a148c
    classDef db fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#e65100
    classDef web fill:#eceff1,stroke:#455a64,stroke-width:2px,color:#263238
    classDef ext fill:#fce4ec,stroke:#c62828,stroke-width:2px,color:#b71c1c

    subgraph CLOUD ["Cloud Backend & Persistence"]
        SUPA_DB[("Supabase DB")]:::db
        JSON_DB[("requests.json")]:::db
        TELE_API["Telegram Bot API"]:::db
    end

    subgraph WEB ["Web Command Dashboard (Next.js)"]
        DASH["Admin Dashboard"]:::web
        MAP_W["Tactical Leaflet Map"]:::web
        AI_PANEL["AI Situation Panel"]:::web
        API_REQ["/api/requests"]:::web
        API_AI["/api/ai-summary"]:::web
        DASH --> MAP_W & AI_PANEL
        DASH <--> API_REQ
        AI_PANEL --> API_AI
    end

    subgraph LORA_MESH ["Long-Range LoRa Mesh Network (5-10 km)"]
        direction LR
        S_NODE["Flood / Landslide Node (ESP32 + LoRa)"]:::fw
        R_NODE["Relay Node (ESP32 + LoRa)"]:::fw
        GW_NODE["LoRa Gateway Node (ESP32)"]:::fw
        S_NODE <--> R_NODE <--> GW_NODE
    end

    subgraph MOBILE ["Offline Mobile Mesh (Flutter App)"]
        VICTIM["Victim SOS App"]:::mob
        VOLUNTEER["Volunteer Relay App"]:::mob
        VICTIM <--> VOLUNTEER
    end

    %% Protocol Mappings
    VICTIM <-->|BLE / Wi-Fi Direct| S_NODE
    VOLUNTEER <-->|BLE / Wi-Fi Direct| GW_NODE
    
    GW_NODE -->|Wi-Fi Backhaul / Cellular| API_REQ
    GW_NODE -->|Sync Telemetry| SUPA_DB
    S_NODE -->|Threat Status| TELE_API
    
    SUPA_DB -->|Realtime Sub| DASH
    JSON_DB <--> API_REQ
    
    API_AI -->|Groq API| GROQ:::ext
    MAP_W -->|Routing| OSRM:::ext
    DASH -->|Weather| OWM:::ext
```

---

## 🛠️ 2. Complete Technology Stack

### Tier 1 — IoT Sensor Nodes & LoRa Gateways
*   **Microcontrollers:** ESP32 DevKit V1 (Main processing, BLE, and Wi-Fi Direct controller).
*   **RF Module:** SX1278 LoRa Transceiver (433MHz / 868MHz sub-GHz long-range radio).
*   **Sensor Suites:**
    *   *Flood:* Parallel Water Line + Ultrasonic Depth Sensor + Rain Gauge.
    *   *Landslide:* MPU6050 (3-Axis Accelerometer/Gyroscope for seismic motion) + Soil Moisture Probe.
*   **Power System:** 5W–10W solar panel, TP4056 / CN3791 MPPT Solar Charger, 2000mAh–5000mAh Lithium battery cells for remote sensor nodes.

### Tier 2 — Mobile Clients (Flutter app)
*   **Ad-hoc P2P API:** Google Nearby Connections (`nearby_connections: 4.3.0`) utilizing BLE for handshake and local Wi-Fi Direct for data sync.
*   **Local Caching:** Hive database (`hive: 2.2.3`).

### Tier 3 & 4 — Command & Control (Next.js Dashboard)
*   **Deployment Options:** Hosted on Vercel/Supabase (Online mode) or locally on an offline Raspberry Pi Zero 2 W acting as a local Wi-Fi AP.
*   **Dashboard Features:** React Leaflet maps, Project OSRM local routing, and cloud-hosted Llama-3.3-70b-versatile via Groq API for situational summaries and triage classification.

---

## 🔄 3. Hybrid Mesh Workflow

### 3.1. Unified LoRa Mesh & Sensor Pipeline
1.  **Continuous Monitoring:** Sensor nodes read environmental metrics (soil moisture, acceleration vector, water depth) in ultra-low power mode.
2.  **Edge Diagnostics:** If readings cross danger bounds (e.g., Seismic $>15.0 \, m/s^2$ or flood level $> 2000$), the node wakes up fully.
3.  **LoRa Propagation:** The alert is packed and broadcasted over the LoRa network, hopping node-to-node until it reaches the Gateway at Command HQ.
4.  **Local Notifications:** Simultaneously, the node broadcasts its danger state locally via Bluetooth to warn nearby residents.

### 3.2. SOS Multi-Hop Routing Pipeline
1.  **SOS Capture:** A victim launches the offline mobile app and taps "SOS".
2.  **BLE Bridge:** The phone transfers the SOS packet via BLE/Wi-Fi to the nearest **ESP32 LoRa Node**.
3.  **Radio Transport:** The ESP32 node inserts the packet into the **LoRa Mesh**, forwarding it to the Command Center in under 10 seconds.
4.  **Acknowledgment Broadcast:** Once HQ dispatches a rescue team, the acknowledgment flows back through the LoRa mesh to the node, which syncs it to the victim's phone.

---

## 📊 4. Smart Data Priority Routing

To prevent traffic congestion over low-bandwidth LoRa channels, data packets are scheduled by priority classes:

| Class | Priority | Description | Sample Payload | Hysteresis Trigger |
| :--- | :--- | :--- | :--- | :--- |
| **P1** | **Emergency / SOS** | Threat to human life (Medical, trapped victim) | `{"type":"SOS", "lat":12.31, "lng":76.61, "status":"Injured"}` | Immediate broadcast |
| **P2** | **Disaster Alert** | Environmental sensors crossing threat limits | `{"type":"ALERT", "sensor":"Flood", "value":2350}` | Immediately on threshold cross |
| **P3** | **Environmental Logs** | Routine weather, humidity, and battery status | `{"type":"LOG", "temp":24.5, "battery_pct":88.2}` | Scheduled every 30 mins |


