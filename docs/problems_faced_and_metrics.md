# 📊 ResQLink — Challenges Solved & Performance Metrics

This document analyzes the engineering challenges resolved during development, along with the performance metrics, validation parameters, and system limits established for the ResQLink platform.

---

## 🛠️ 1. Technical Challenges Solved

### 1.1. Device Geolocation Access Console Errors
- **Problem**: Next.js (Turbopack) and browser environments threw errors (`Device GPS Access Error: {}`) when Geolocation permission was blocked or pending. This triggered red overlay error screens in developer builds.
- **Solution**: Replaced default `console.error` calls in the geolocation error handler with `console.warn` logs, and implemented fallback states (`denied` or `pending`) to prevent dev-server blocks.

### 1.2. Dual GPS Coordinate Requirements & Fraud Prevention
- **Problem**: Users submitting requests from outside the affected disaster area could misdirect rescue resources.
- **Solution**: Implemented a **Dual GPS validation** model. The dashboard captures both:
  1. The location of the user submitting the alert (the Publisher location).
  2. The target location where help is needed (the Incident location).
- **Out-of-Region Triage**: If the publisher's location differs from the configured disaster area coordinates (e.g., further than the defined radius), the alert is routed to the **Other Locations (Pending Verification)** section. The administrator can verify the request before relocating it to the active rescue queue.

### 1.3. P2P Mesh Collision & Message Deduplication
- **Problem**: Bluetooth Low Energy (BLE) and Wi-Fi Direct ad-hoc networks continuously broadcast signals, causing severe packet duplication when multiple relay nodes overlap.
- **Solution**: Implemented local UUID indexing in the Hive NoSQL store. Incoming packets are queried against active UUID logs. If a match is found, the packet is ignored, preventing duplicate processing and database bloat.

### 1.4. ESP32 Battery Drain vs. Real-Time Telemetry
- **Problem**: Continuous sensor polling and cellular/Wi-Fi uploads drained the battery on remote ESP32 nodes within days.
- **Solution**: Developed an **Adaptive Throttling Algorithm** using hysteresis limits:
  - If readings remain within stable bounds ($\pm 0.5^\circ\text{C}$, $\pm 50$ ADC), the loop interval scales up to **30 seconds** (Sleep/Idle mode).
  - If a reading breaks the hysteresis limits, the loop reverts to a **5-second active interval** for real-time tracking.

---

## 📈 2. Technical Metrics & System Limits

The platform is designed around specific technical bounds to ensure reliability:

| Parameter | Metric / Limit | Scope |
|:---|:---|:---|
| **Disaster Zone Defaults** | Latitude: `12.5118`, Longitude: `76.8851` | Mandya Base coordinates |
| **Disaster Zone Radius** | $1.0 - 5.0 \, \text{km}$ | Configurable out-of-region validation limit |
| **Active Telemetry Interval** | $5.0 \, \text{seconds}$ | Critical event tracking frequency |
| **Idle Telemetry Interval** | $30.0 \, \text{seconds}$ | Idle power-saving frequency |
| **SMS Gateway Destination** | `+91 XXXXXXXXXX` | Configured SMS portal recipient number |
| **Maximum Local Cache** | $24.5 \, \text{MB}$ | Pre-cached offline sector maps storage size |
| **Multi-hop Transmission Latency** | $< 10.0 \, \text{seconds}$ | Time to forward alert from victim to HQ over 3-hop mesh |
| **GPS Coordinate Resolution** | $4 \, \text{decimal places}$ | Precise to within $\approx 11.1 \, \text{meters}$ |
| **Ad-hoc Mesh Protocol Range** | $\approx 100 \, \text{meters}$ | Bluetooth/WiFi range per client node |
