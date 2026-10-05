# ResQLink — Disaster Response Platform

ResQLink is a disaster response system that combines a real-time admin web dashboard and ESP32 firmware nodes into a unified emergency response network.

---

## 📦 Repository Structure

```
RESQLINK/
├── web/          # Next.js admin dashboard (disaster command centre)
├── hardware/     # ESP32 firmware & physical schematics
├── docs/         # Unified documentation, schemas, and architecture guides
│   ├── RESQLINK.pdf
│   ├── SMS_SETUP.md
│   ├── SUPABASE.md
│   ├── supabase_schema.sql
│   ├── system_architecture.md
│   └── tech_stack.txt
├── LICENSE.md    # Academic Presentation & Limited Use License
└── README.md     # Main overview file
```

---

## 🌐 Web — Admin Dashboard (`web/`)

A Next.js web application providing the disaster command centre interface for administrators.

**Key features:**
- Live SOS/rescue request feed with GPS location
- Real-time GSM SMS emergency ingestion from any 2G/3G/4G phone
- Out-of-region verification workflow
- AI triage & resource dispatch
- Leaflet map with flood zone overlay
- Live IoT environmental telemetry display

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

C++ firmware for ESP32 nodes that act as environmental sensors deployed in disaster-affected zones.

**Key features:**
- Real-time multi-sensor telemetry (temperature, humidity, flood depth, seismic tremors, air quality)
- Cloud and GSM SMS Gateway uplink
- Dynamic power throttling algorithm (5s active to 30s idle)

**Files:**
| File | Description |
|---|---|
| `espcode.c++` | Main firmware source code |
| `esp32_circuit_diagram.jpg` | Hardware wiring schematic |
| `firmware_flow_chart.jpg` | Firmware execution flow |
| `README.md` | Hardware specs & sensor wiring notes |

**Flash firmware:**
```bash
# Using Arduino IDE or PlatformIO
# Open hardware/espcode.c++ and flash to ESP32 board
```

---

## 🚀 Quick Start

```bash
# 1. Start the web dashboard
npm run dev                  # runs on http://localhost:3000

# 2. Flash firmware to ESP32 nodes (see docs/deployment_guide.txt)
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
