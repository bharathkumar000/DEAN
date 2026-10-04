# 📱 ResQLink — Mobile Application Architecture

This document describes the design, database caching layers, offline ad-hoc communications, and native integration channels of the Flutter Mobile Client.

---

## 🏗️ 1. Project Architecture & Screen Layout

The Flutter app is structured to optimize local state management and support offline operations:

- **`lib/main.dart`**: Application entry point. Configures native screen routing and initializes background services (e.g., Bluetooth ad-hoc networks).
- **`lib/models/sos.dart`**: Defines the data models and serialization adapters for cached SOS payloads.
- **`lib/services/`**:
  - `storage_service.dart`: Manages read/write operations for cached local signals using Hive.
  - `wifi_service.dart`: Manages peer-to-peer advertising and discovery services.
  - `sync_bridge_service.dart`: Re-uploads accumulated local logs when internet connectivity is restored.

---

## 🗺️ 2. User Interfaces

The app provides three interfaces tailored to specific roles during a disaster:

### 2.1. Victim SOS Portal (`lib/screens/victim_screen.dart`)
- **Action**: A single button to trigger an SOS.
- **Automation**: Fetches the device's current location via GPS, generates a unique UUID, and caches the alert locally to start ad-hoc background broadcasts.

### 2.2. Command Desk (`lib/screens/command_screen.dart`)
- **Action**: Provides an administrative portal for field dispatchers.
- **Functionality**: Displays active telemetry, allows team assignments, and manages local incident logs offline.

### 2.3. Tactical Map Overlay (`lib/screens/map_screen.dart`)
- **Action**: Interactive offline map using `flutter_map` and OpenStreetMap.
- **Visuals**: Displays the location of the dispatcher (blue radar beacon) and nearby victim SOS signals (color-coded by need).

---

## 🌐 3. Offline Ad-Hoc Mesh Network (Nearby Connections)

The offline P2P communication layer uses Google Nearby Connections:
- **Strategy**: `Strategy.P2P_CLUSTER` — Allows multiple peer connections to form ad-hoc mesh networks.
- **Discovery Mode**:
  - **Victim devices**: Advertise their distress beacon payload.
  - **Relay/Command nodes**: Discover nearby advertisers, connect to them, and pull the SOS data.
- **Deduplication**: Signals are indexed by UUID inside the storage service to prevent duplicate broadcasts.

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
