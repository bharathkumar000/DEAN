# 🌐 ResQLink — Web Command Dashboard Architecture

This document describes the design, routing mechanisms, mapping overlay layouts, and AI triage systems of the Next.js Command Dashboard.

---

## 🏗️ 1. Next.js Architecture

The web dashboard is built using Next.js with the App Router configuration, running under React 19.

### Directory Structure:
- `web/src/app/page.js`: Core layout grid containing the dashboard controls, active alert feeds, verification queues, and the map frame.
- `web/src/app/MapComponent.js`: Integrates the Leaflet map and updates location markers dynamically.
- `web/src/app/globals.css`: Premium dark UI theme using CSS custom properties for styling tokens.
- `web/src/app/api/`: Handles server-side telemetry logic, SQLite/JSON persistence, and Groq/Llama integration.

---

## 🗺️ 2. Interactive Map Engine (Leaflet)

The map handles live spatial tracking of active emergencies and field stations:
- **Base Tile Providers**: Leverages OpenStreetMap and CARTO Dark mode.
- **Marker Layering**:
  - **Blue pulsator**: Base station locator (radar beacon).
  - **Red markers**: Active Verified Emergency signals.
  - **Orange markers**: Unverified Out-of-Region signals.
  - **Green markers**: Resolved cases.
- **Route Overlay**: Uses **Project OSRM** (`router.project-osrm.org`) to calculate and render optimal driving paths from the dispatch station to the incident spot.

---

## ⚡ 3. Intelligent Classification & Triage

To help dispatchers prioritize rescue efforts, incoming requests are processed by a triage system combining a custom algorithm with LLM analysis.

### 3.1. Local Priority Scoring Matrix
A custom scoring algorithm computes an index based on distress parameters:
$$\text{Priority Score} = (\text{Resource Weight} \times 1.5) + (\text{Stranded Count} \times 2.0)$$
- **High Weight (10)**: Medical Aid, Rescue/Extraction.
- **Medium Weight (5)**: Drinking Water, Shelter.
- **Low Weight (2)**: Food, Power/Charging.

### 3.2. Groq Llama-3.3-70b Integration
For complex cases, raw telemetry is forwarded to `/api/ai-summary` which uses Groq to generate summaries and structure triage data:
1. **Request Triage**: Evaluates victim descriptions to identify life-threatening signs.
2. **Resource Extraction**: Determines required emergency packages.
3. **Draft Updates**: Proposes volunteer/team assignments.

---

## 🌐 4. Localization & Bilingual Support

To support local emergency personnel, the UI implements a client-side translation wrapper:
- **Languages**: English and Kannada (ಕನ್ನಡ).
- **Scope**: Re-renders menus, priority levels, sensor warning logs, and system badges instantly.
