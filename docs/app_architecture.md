# 📱 ResQLink — Mobile Application Architecture

This document describes the design, database caching layers, offline ad-hoc communications, and native integration channels of the Flutter Mobile Client.

---

## 🏗️ 1. Project Architecture & Screen Layout

The Flutter app is structured to optimize local state management and support offline operations:

- **`lib/main.dart`**: Application entry point. Configures native screen routing and initializes SMS emergency dispatch services.
- **`lib/models/sos.dart`**: Defines the data models and serialization adapters for cached SOS payloads.
- **`lib/services/`**:
  - `storage_service.dart`: Manages read/write operations for cached local signals using Hive.
  - `sms_service.dart`: Formats and initiates GSM SMS emergency reports with GPS coordinates.
  - `sync_bridge_service.dart`: Re-uploads accumulated local logs when internet connectivity is restored.

---

## 🗺️ 2. User Interfaces

The app provides three interfaces tailored to specific roles during a disaster:

### 2.1. Victim SOS Portal (`lib/screens/victim_screen.dart`)
- **Action**: A single button to trigger an SOS.
- **Automation**: Fetches the device's current location via GPS, generates structured SMS distress templates, and allows instant dispatch without mobile data or internet.

### 2.2. Command Desk (`lib/screens/command_screen.dart`)
- **Action**: Provides an administrative portal for field dispatchers.
- **Functionality**: Displays active telemetry, allows team assignments, and manages local incident logs offline.

### 2.3. Tactical Map Overlay (`lib/screens/map_screen.dart`)
- **Action**: Interactive map using `flutter_map` and OpenStreetMap.
- **Visuals**: Displays the location of the dispatcher and nearby victim SOS signals (color-coded by need).

---

## 💬 3. GSM Control-Channel SMS Emergency Protocol

The primary zero-internet communication pipeline operates over GSM SMS:
- **Strategy**: Cellular control signaling channel (works on 2G, 3G, 4G, and 5G even when packet data / cellular internet is completely disabled or congested).
- **Format**: Structured text payload containing location, severity, and resource requirements:
  `RESQ SOS Medical Injured:3 Lat:12.3168 Lng:76.6135`
- **Deduplication**: Signals are indexed by timestamp and sender phone number in the Command Center to prevent duplicate entries.

---

## 💬 4. Native MethodChannel SMS Portal

For legacy cellular compatibility when data links are offline, the app includes a native Android MethodChannel SMS integration:
- **Channel Name**: `com.resqlink.sms`
- **Native Implementation (`MainActivity.kt`)**: Uses Kotlin to invoke an Android Intent that pre-fills message templates and sets the recipient number:
```kotlin
val intent = Intent(Intent.ACTION_SENDTO).apply {
    data = Uri.parse("smsto:$number")
    putExtra("sms_body", message)
}
startActivity(intent)
```
- **Pre-defined Templates**: Includes presets for Medical aid, Tents/Shelter, Supplies, Evacuations, and Power, along with custom text input.
