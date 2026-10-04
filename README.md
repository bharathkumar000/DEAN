# ResQLink — Disaster Response Platform

ResQLink is a disaster response system that combines a real-time admin web dashboard and ESP32 firmware nodes into a unified emergency response network.

---

## 📦 Repository Structure

```
RESQLINK/
├── web/          # Next.js admin dashboard (disaster command centre)
├── hardware/     # ESP32 firmware (BLE/WiFi mesh sensor nodes)
├── docs/         # Project documentation & architecture files
│   ├── RESQLINK.pdf
│   ├── system_architecture.md
│   └── tech_stack.txt
├── SMS_SETUP.md  # Off-Grid SMS Gateway & Forwarder setup guide
├── LICENSE.md    # Academic Presentation & Limited Use License
└── README.md     # Main overview file
```

---

## 🌐 Web — Admin Dashboard (`web/`)

A Next.js web application providing the disaster command centre interface for administrators.

**Key features:**
- Live SOS/rescue request feed with GPS location
- Out-of-region verification workflow
- AI triage & resource dispatch
- Leaflet map with flood zone overlay
- Offline mesh telemetry display

**Setup:**
```bash
cd web
npm install
cp .env.example .env        # fill in your Supabase credentials
npm run dev                  # runs on http://localhost:3000
```

**Environment variables (`.env`):**
| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anonymous key |
| `GROQ_API_KEY` | Groq API key for AI triage |

**Production build:**
```bash
cd web
npm run build
npm start
```

---

## ⚙️ Hardware — ESP32 Firmware (`hardware/`)

C++ firmware for ESP32 nodes that act as BLE/WiFi mesh relay points and environmental sensors deployed in disaster-affected zones.

**Key features:**
- BLE mesh broadcasting of SOS signals
- WiFi bridge mode for internet uplink
- Environmental sensor integration (temperature, flood depth)

**Files:**
| File | Description |
|---|---|
| `espcode.c++` | Main firmware source code |
| `esp32_circuit_diagram.jpg` | Hardware wiring schematic |
| `firmware_flow_chart.jpg` | Firmware execution flow |
| `deployment_guide.txt` | Field deployment instructions |
| `system_architecture.md` | Firmware architecture notes |

**Flash firmware:**
```bash
# Using Arduino IDE or PlatformIO
# Open hardware/espcode.c++ and flash to ESP32 board
```

---

## 🚀 Quick Start

```bash
# 1. Start the web dashboard
cd web && npm install && npm run dev

# 2. Flash firmware to ESP32 nodes (see hardware/deployment_guide.txt)
```

---

## 📐 System Architecture

See [`docs/system_architecture.md`](./docs/system_architecture.md) for the full architecture diagram and inter-component communication protocols.

---

## 📄 License & Terms of Use

This project is proprietary and protected under the **[Academic Evaluation & Presentation License](LICENSE.md)**.

- **Permitted Use**: Strictly limited to final-year academic project demonstration, evaluation, and viva-voce presentation by the authorized purchaser.
- **Restrictions**: Commercial deployment, monetization, resale, sublicensing, sharing with third parties, and public code hosting are strictly prohibited. All rights and intellectual property remain reserved by the original author.

See [`LICENSE.md`](./LICENSE.md) for full terms and conditions.
