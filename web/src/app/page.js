'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

const CREDENTIALS = {
  admin: { username: "1", password: "1", role: "Admin", fullName: "System Admin" },
  user: { username: "2", password: "2", role: "User", fullName: "On-Duty Officer" }
};

const DEFAULT_RESOURCES = [
  { id: 1, name: "Emergency Medical Kit", type: "Medical Supplies", totalQuantity: 500, availableQuantity: 350 },
  { id: 2, name: "Food Packages", type: "Food & Water", totalQuantity: 1000, availableQuantity: 800 },
  { id: 3, name: "Emergency Tents", type: "Shelter", totalQuantity: 100, availableQuantity: 75 },
  { id: 4, name: "Rescue Personnel", type: "Rescue Team", totalQuantity: 50, availableQuantity: 40 },
  { id: 5, name: "Emergency Ambulances", type: "Ambulance", totalQuantity: 20, availableQuantity: 15 },
  { id: 6, name: "Clean Drinking Water", type: "Food & Water", totalQuantity: 5000, availableQuantity: 3200 },
  { id: 7, name: "Blankets & Sleeping Bags", type: "Bedding", totalQuantity: 1500, availableQuantity: 1200 },
  { id: 8, name: "Inflatable Rescue Boats", type: "Rescue Boats", totalQuantity: 40, availableQuantity: 28 },
  { id: 9, name: "Heavy Duty Excavators (JCB)", type: "Heavy Machinery", totalQuantity: 15, availableQuantity: 10 }
];

const DEFAULT_VOLUNTEERS = [
  { id: 1, name: "Dr. Sandeep", role: "Medical", status: "available", lat: 12.5318, lng: 76.9051, phone: "9123456780" },
  { id: 2, name: "Kiran Kumar", role: "Rescue", status: "busy", lat: 12.5118, lng: 76.9151, phone: "9123456781" },
  { id: 3, name: "Arjun Singh", role: "Driver", status: "available", lat: 12.5418, lng: 76.8851, phone: "9123456782" }
];

const DUMMY_REQUESTS = [
  {
    id: 1,
    requestId: "REQ-1000",
    resourceType: "Medical Supplies",
    quantityRequested: 150,
    quantityAllocated: 100,
    quantityPending: 50,
    lat: 12.5118,
    lng: 76.8851,
    severity: 5,
    individualsAffected: 200,
    status: "partial",
    contactPerson: "Dr. Ramesh Sharma",
    contactPhone: "9876543210",
    address: "Near Mandya Railway Station, Mandya",
    description: "Critical medical supplies needed urgently for cyclone victims. Require emergency medicines, first aid kits, and antiseptics. Multiple injuries reported."
  },
  {
    id: 2,
    requestId: "REQ-1001",
    resourceType: "Food & Water",
    quantityRequested: 500,
    quantityAllocated: 0,
    quantityPending: 500,
    lat: 12.5318,
    lng: 76.9051,
    severity: 4,
    individualsAffected: 100,
    status: "pending",
    contactPerson: "Rajesh Kumar",
    contactPhone: "9876543211",
    address: "MIMS Doctors Quarters, Mandya",
    description: "Emergency food supplies and clean drinking water needed for evacuees at temporary shelter. Families include elderly and children requiring immediate assistance."
  },
  {
    id: 3,
    requestId: "REQ-1002",
    resourceType: "Shelter",
    quantityRequested: 30,
    quantityAllocated: 30,
    quantityPending: 0,
    lat: 12.5418,
    lng: 76.9051,
    severity: 3,
    individualsAffected: 50,
    status: "allocated",
    contactPerson: "Priya Nair",
    contactPhone: "9876543212",
    address: "Temple Road, Mandya",
    description: "Temporary shelter tents required for displaced families whose homes were damaged in heavy rains. Need waterproof tents with basic amenities."
  },
  {
    id: 4,
    requestId: "REQ-1003",
    resourceType: "Ambulance",
    quantityRequested: 5,
    quantityAllocated: 5,
    quantityPending: 0,
    lat: 12.5018,
    lng: 76.8951,
    severity: 5,
    individualsAffected: 25,
    status: "resolved",
    contactPerson: "Mohammed Ali",
    contactPhone: "9876543213",
    address: "Near Mandya Bus Stand, Mandya",
    description: "Emergency medical transport needed for critical patients. Several casualties with severe injuries requiring immediate hospital admission and specialized care.",
    resolvedAt: "2026-05-22T10:30:00Z"
  },
  {
    id: 5,
    requestId: "REQ-1004",
    resourceType: "Rescue Team",
    quantityRequested: 10,
    quantityAllocated: 0,
    quantityPending: 10,
    lat: 12.5218,
    lng: 76.9251,
    severity: 4,
    individualsAffected: 80,
    status: "pending",
    contactPerson: "Anil Verma",
    contactPhone: "9876543214",
    address: "Industrial Area, Mandya",
    description: "Rescue operation urgently needed for people stranded in flooded area. Water level rising rapidly. Require boats and trained rescue personnel immediately."
  }
];

const TRANSLATIONS = {
  en: {
    title: "ResQ Link",
    base: "Base: VVCE Mysuru Emergency Operations Center",
    hw_title: "Live Hardware Monitoring ",
    temp: "Temperature",
    hum: "Humidity",
    soil: "Soil Moisture",
    water: "Water Level",
    seismic: "Seismic Activity",
    air: "Air Quality",
    rain: "Rain Intensity",
    pressure: "Pressure",
    altitude: "Altitude",
    windSpeed: "Wind Speed",
    windDir: "Wind Direction",
    submit_req: "Submit Emergency Request",
    res_type: "Resource Type",
    qty: "Quantity",
    severity: "Severity (1-5)",
    affected: "Individuals Affected",
    desc: "Description",
    submit_btn: "Submit Request",
    sos_btn: "SOS",
    sos_label: "Instant Emergency Help",
    logout: "Logout",
    active_req: "Active Emergency Requests",
    resolved_req: "Resolved Requests",
    avail_res: "Available Resources",
    join_vol: "Join as a Volunteer",
    name: "Full Name",
    expertise: "Expertise",
    phone: "Phone Number",
    reg_vol: "Register as Volunteer",
    avail_supplies: "Available Supplies",
    normal_mode: "Normal Mode",
    tactical_mode: "Tactical Mode",
    total_req: "Total Requests",
    active_req_short: "Active Requests",
    resolved_req_short: "Resolved Requests",
    critical_priority: "Critical Priority",
    ai_assistant: "ResQLink AI Assistant",
    gen_report: "Generate Situation Report",
    ai_helper_text: "Click 'Generate Situation Report' to get an AI analysis of the current environment logs.",
    analyzing_data: "Analyzing data...",
    weather_forecast: "Weather Forecast",
    loading_weather: "Loading weather details...",
    command_map: "Emergency Command Map",
    live_deployment: "LIVE DEPLOYMENT",
    last_sync: "Last Sync",
    city_name: "City Name",
    weather_desc: "Weather Description",
    feels_like: "Feels Like",
    visibility: "Visibility",
    cloudiness: "Cloudiness",
    coordinates: "Coordinates",
    timezone: "Timezone",
    location_map: "Emergency Location Map",
    submit_req_admin: "Submit Emergency Request (Admin)",
    on_duty_vols: "On-Duty Volunteers",
    sys_analytics: "System Analytics & Predictions",
    resolved_history: "Resolved Requests History",
    local_weather: "Local Weather",
    live_sensor_data: "Live Sensor Data",
    allocate_resources: "Allocate Resources",
    route_info: "Route Info",
    edit_resource: "Edit Resource",
    add_resource: "Add Resource",
    welcome_back: "Welcome Back",
    login_sub: "Sign in to your account",
    username: "Username",
    password: "Password",
    login_btn: "Login",
    demo_btn: "Use Demo Admin Credentials",
    dont_have_account: "Don't have an account? Register new account",
    disaster_mgmt: "Disaster Response Management System",
    join_resq: "Join ResQ Link",
    create_account_sub: "Create your account to get started",
    account_security: "Account Security",
    confirm_password: "Confirm Password",
    retype_password: "Retype Password",
    choose_username: "Choose a unique username",
    min_chars: "Min 6 characters",
    account_type: "Account Type",
    standard_fn: "Standard Functionality",
    sys_mgmt: "System Management",
    create_account_btn: "Create Account",
    already_have_account: "Already have an account? Login here",
    type: "Type",
    qty_short: "Qty",
    location: "Location",
    person: "Person",
    phone_short: "Phone",
    priority: "Priority",
    status: "Status",
    actions: "Actions",
    id: "ID",
    resolved_at: "Resolved At",
    critical_first: "Critical First",
    low_first: "Low Risk First",
    purge: "Purge",
    allocate: "Allocate",
    resolve: "Resolve",
    route: "Route",
    ml_priority: "Real-time ML Priority",
    confidence: "Confidence",
    sos_hint: "One-click alert with your mobile GPS telemetry",
    medical_first_aid: "Medical / First Aid",
    rescue_search: "Rescue / Search",
    driver_logistics: "Driver / Logistics",
    general_assistance: "General Assistance",
    weather_syncing: "Weather readings syncing...",
    req_details: "Request Details",
    qty_to_allocate: "Quantity to Allocate",
    cancel: "Cancel",
    distance: "Distance",
    est_time: "Estimated Time",
    severity_level: "Severity Level",
    ok: "OK",
    resource_name: "Resource Name",
    total_qty: "Total Quantity",
    avail_qty: "Available Quantity",
    save: "Save",
    pinned_target: "Pinned Target",
    map_pin_required: "🚨 Map Target Pin Required",
    dispatch: "Dispatch",
    admin: "Admin",
    from_north: "from North",
    units: "units",
    dispatch_title: "Select Incident Request for Dispatch",
    dispatch_desc: "Select a request from the active list below to dispatch the volunteer to that specific location.",
    what: "What Needed",
    where: "Where (Location / Address)",
    no_pending_requests: "No active requests available to dispatch volunteers to.",
    exhaustion_forecast: "Inventory Exhaustion Forecast",
    hrs_left: "hrs left",
    burn_rate: "Burn Rate",
    units_hr: "units/hr",
    risk: "RISK",
    avg_priority: "Avg Priority",
    people_helped: "People Helped",
    utilization: "Utilization",
    avg_response_time: "Avg Response Time",
    coords_locked: "Coords Locked",
    pin_target_required: "🚨 Pinned target coords required (Click Map)"
  },
  kn: {
    title: "ರೆಸ್ಕ್ಯೂ ಲಿಂಕ್",
    base: "ನೆಲೆ: ವಿವಿಇಸಿ ಮೈಸೂರು ತುರ್ತು ಕಾರ್ಯಾಚರಣೆ ಕೇಂದ್ರ",
    hw_title: "ಲೈವ್ ಹಾರ್ಡ್‌ವೇರ್ ಮಾನಿಟರಿಂಗ್ (ಸುಪಬೇಸ್)",
    temp: "ತಾಪಮಾನ",
    hum: "ಆರ್ದ್ರತೆ",
    soil: "ಮಣ್ಣಿನ ತೇವಾಂಶ",
    water: "ನೀರಿನ ಮಟ್ಟ",
    seismic: "ಭೂಕಂಪನ ಚಟುವಟಿಕೆ",
    air: "ಗಾಳಿಯ ಗುಣಮಟ್ಟ",
    rain: "ಮಳೆಯ ತೀವ್ರತೆ",
    pressure: "ಒತ್ತಡ",
    altitude: "ಎತ್ತರ",
    windSpeed: "ಗಾಳಿಯ ವೇಗ",
    windDir: "ಗಾಳಿಯ ದಿಕ್ಕು",
    submit_req: "ತುರ್ತು ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಿ",
    res_type: "ಸಂಪನ್ಮೂಲ ಪ್ರಕಾರ",
    qty: "ಪ್ರಮಾಣ",
    severity: "ತೀವ್ರತೆ (1-5)",
    affected: "ಪೀಡಿತ ವ್ಯಕ್ತಿಗಳು",
    desc: "ವಿವರಣೆ",
    submit_btn: "ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಿ",
    sos_btn: "ಎಸ್ಒಎಸ್",
    sos_label: "ತತ್ಕ್ಷಣ ತುರ್ತು ಸಹಾಯ",
    logout: "ನಿರ್ಗಮಿಸಿ",
    active_req: "ಸಕ್ರಿಯ ತುರ್ತು ವಿನಂತಿಗಳು",
    resolved_req: "ಪರಿಹರಿಸಲಾದ ವಿನಂತಿಗಳು",
    avail_res: "ಲಭ್ಯವಿರುವ ಸಂಪನ್ಮೂಲಗಳು",
    join_vol: "ಸ್ವಯಂಸೇವಕರಾಗಿ ಸೇರಿ",
    name: "ಪೂರ್ಣ ಹೆಸರು",
    expertise: "ಪರಿಣತಿ",
    phone: "ದೂರವಾಣಿ ಸಂಖ್ಯೆ",
    reg_vol: "ಸ್ವಯಂಸೇವಕರಾಗಿ ನೋಂದಾಯಿಸಿ",
    avail_supplies: "ಲಭ್ಯವಿರುವ ಸರಬರಾಜುಗಳು",
    normal_mode: "ಸಾಮಾನ್ಯ ಮೋಡ್",
    tactical_mode: "ಯುದ್ಧತಂತ್ರದ ಮೋಡ್",
    total_req: "ಒಟ್ಟು ವಿನಂತಿಗಳು",
    active_req_short: "ಸಕ್ರಿಯ ವಿನಂತಿಗಳು",
    resolved_req_short: "ಪರಿಹರಿಸಲಾದ ವಿನಂತಿಗಳು",
    critical_priority: "ಗಂಭೀರ ಆದ್ಯತೆ",
    ai_assistant: "ರೆಸ್ಕ್ಯೂಲಿಂಕ್ AI ಸಹಾಯಕಿ",
    gen_report: "ಪರಿಸ್ಥಿತಿ ವರದಿ ರಚಿಸಿ",
    ai_helper_text: "ಪ್ರಸ್ತುತ ಪರಿಸರದ ಲಾಗ್‌ಗಳ AI ವಿಶ್ಲೇಷಣೆಯನ್ನು ಪಡೆಯಲು 'ಪರಿಸ್ಥಿತಿ ವರದಿ ರಚಿಸಿ' ಕ್ಲಿಕ್ ಮಾಡಿ.",
    analyzing_data: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    weather_forecast: "ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ",
    loading_weather: "ಹವಾಮಾನ ವಿವರಗಳನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...",
    command_map: "ತುರ್ತು ನಿಯಂತ್ರಣ ನಕ್ಷೆ",
    live_deployment: "ಲೈವ್ ನಿಯೋಜನೆ",
    last_sync: "ಕೊನೆಯ ಸಿಂಕ್",
    city_name: "ನಗರದ ಹೆಸರು",
    weather_desc: "ಹವಾಮಾನ ವಿವರಣೆ",
    feels_like: "ಹಾಗೆ ಭಾಸವಾಗುತ್ತದೆ",
    visibility: "ಗೋಚರತೆ",
    cloudiness: "ಮೋಡ ಕವಿದ ವಾತಾವರಣ",
    coordinates: "ನಿರ್ದೇಶಾಂಕಗಳು",
    timezone: "ಸಮಯ ವಲಯ",
    location_map: "ತುರ್ತು ಸ್ಥಳ ನಕ್ಷೆ",
    submit_req_admin: "ತುರ್ತು ವಿನಂತಿ ಸಲ್ಲಿಸಿ (ನಿರ್ವಾಹಕರು)",
    on_duty_vols: "ಕರ್ತವ್ಯದಲ್ಲಿರುವ ಸ್ವಯಂಸೇವಕರು",
    sys_analytics: "ವ್ಯವಸ್ಥೆ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ಮುನ್ಸೂಚನೆಗಳು",
    resolved_history: "ಪರಿಹರಿಸಲಾದ ವಿನಂತಿಗಳ ಇತಿಹಾಸ",
    local_weather: "ಸ್ಥಳೀಯ ಹವಾಮಾನ",
    live_sensor_data: "ಲೈವ್ ಸೆನ್ಸರ್ ಡೇಟಾ",
    allocate_resources: "ಸಂಪನ್ಮೂಲಗಳನ್ನು ಹಂಚಿಕೆ ಮಾಡಿ",
    route_info: "ಮಾರ್ಗ ಮಾಹಿತಿ",
    edit_resource: "ಸಂಪನ್ಮೂಲವನ್ನು ಸಂಪಾದಿಸಿ",
    add_resource: "ಸಂಪನ್ಮೂಲವನ್ನು ಸೇರಿಸಿ",
    welcome_back: "ಪುನಃ ಸುಸ್ವಾಗತ",
    login_sub: "ನಿಮ್ಮ ಖಾತೆಗೆ ಲಾಗಿನ್ ಮಾಡಿ",
    username: "ಬಳಕೆದಾರ ಹೆಸರು",
    password: "ಗುಪ್ತಪದ",
    login_btn: "ಲಾಗಿನ್",
    demo_btn: "ಡೆಮೊ ನಿರ್ವಾಹಕ ರುಜುವಾತುಗಳನ್ನು ಬಳಸಿ",
    dont_have_account: "ಖಾತೆ ಇಲ್ಲವೇ? ಹೊಸದನ್ನು ರಚಿಸಿ",
    disaster_mgmt: "ವಿಪತ್ತು ಪ್ರತಿಕ್ರಿಯೆ ನಿರ್ವಹಣಾ ವ್ಯವಸ್ಥೆ",
    join_resq: "ರೆಸ್ಕ್ಯೂ ಲಿಂಕ್ ಸೇರಿ",
    create_account_sub: "ಪ್ರಾರಂಭಿಸಲು ನಿಮ್ಮ ಖಾತೆಯನ್ನು ರಚಿಸಿ",
    account_security: "ಖಾತೆ ಭದ್ರತೆ",
    confirm_password: "ದೃಢೀಕರಿಸಿ",
    retype_password: "ಗುಪ್ತಪದವನ್ನು ಮರುಟೈಪ್ ಮಾಡಿ",
    choose_username: "ವಿಶಿಷ್ಟ ಬಳಕೆದಾರ ಹೆಸರನ್ನು ಆರಿಸಿ",
    min_chars: "ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು",
    account_type: "ಖಾತೆಯ ಪ್ರಕಾರ",
    standard_fn: "ಸಾಮಾನ್ಯ ಕಾರ್ಯಶೀಲತೆ",
    sys_mgmt: "ಸಿಸ್ಟಮ್ ನಿರ್ವಹಣೆ",
    create_account_btn: "ಖಾತೆ ರಚಿಸಿ",
    already_have_account: "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ಲಾಗಿನ್ ಮಾಡಿ",
    type: "ಪ್ರಕಾರ",
    qty_short: "ಪ್ರಮಾಣ",
    location: "ಸ್ಥಳ",
    person: "ಸಂಪರ್ಕ ವ್ಯಕ್ತಿ",
    phone_short: "ಫೋನ್",
    priority: "ಆದ್ಯತೆ",
    status: "ಸ್ಥಿತಿ",
    actions: "ಕ್ರಮಗಳು",
    id: "ಐಡಿ",
    resolved_at: "ಪರಿಹರಿಸಲಾದ ಸಮಯ",
    critical_first: "ಗಂಭೀರ ಮೊದಲು",
    low_first: "ಕಡಿಮೆ ಆದ್ಯತೆ ಮೊದಲು",
    purge: "ಅಳಿಸಿ",
    allocate: "ಹಂಚಿಕೆ",
    resolve: "ಪರಿಹರಿಸಿ",
    route: "ಮಾರ್ಗ",
    ml_priority: "ನೈಜ-ಸಮಯದ ML ಆದ್ಯತೆ",
    confidence: "ವಿಶ್ವಾಸಾರ್ಹತೆ",
    sos_hint: "ನಿಮ್ಮ ಮೊಬೈಲ್ ಜಿಪಿಎಸ್ ಟೆಲಿಮೆಟ್ರಿಯೊಂದಿಗೆ ಒಂದೇ ಕ್ಲಿಕ್‌ನಲ್ಲಿ ಎಚ್ಚರಿಕೆ",
    medical_first_aid: "ವೈದ್ಯಕೀಯ / ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ",
    rescue_search: "ರಕ್ಷಣೆ / ಹುಡುಕಾಟ",
    driver_logistics: "ಚಾಲಕ / ಲಾಜಿಸ್ಟಿಕ್ಸ್",
    general_assistance: "ಸಾಮಾನ್ಯ ಸಹಾಯ",
    weather_syncing: "ಹವಾಮಾನ ವಿವರಗಳು ಸಿಂಕ್ ಆಗುತ್ತಿವೆ...",
    req_details: "ವಿನಂತಿಯ ವಿವರಗಳು",
    qty_to_allocate: "ಹಂಚಿಕೆ ಮಾಡಬೇಕಾದ ಪ್ರಮಾಣ",
    cancel: "ರದ್ದುಮಾಡಿ",
    distance: "ದೂರ",
    est_time: "ಅಂದಾಜು ಸಮಯ",
    severity_level: "ತೀವ್ರತೆಯ ಮಟ್ಟ",
    ok: "ಸರಿ",
    resource_name: "ಸಂಪನ್ಮೂಲ ಹೆಸರು",
    total_qty: "ಒಟ್ಟು ಪ್ರಮಾಣ",
    avail_qty: "ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ",
    save: "ಉಳಿಸಿ",
    pinned_target: "ಪಿನ್ ಮಾಡಿದ ಗುರಿ",
    map_pin_required: "🚨 ನಕ್ಷೆಯಲ್ಲಿ ಗುರಿ ಗುರುತಿಸುವುದು ಅಗತ್ಯ",
    dispatch: "ನಿಯೋಜಿಸು",
    admin: "ನಿರ್ವಾಹಕರು",
    from_north: "ಉತ್ತರದಿಂದ",
    units: "ಘಟಕಗಳು",
    dispatch_title: "ನಿಯೋಜನೆಗಾಗಿ ಘಟನೆ ವಿನಂತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    dispatch_desc: "ಸ್ವಯಂಸೇವಕರನ್ನು ಆ ನಿರ್ದಿಷ್ಟ ಸ್ಥಳಕ್ಕೆ ನಿಯೋಜಿಸಲು ಕೆಳಗಿನ ಸಕ್ರಿಯ ಪಟ್ಟಿಯಿಂದ ವಿನಂತಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",
    what: "ಏನು ಬೇಕಾಗಿದೆ",
    where: "ಎಲ್ಲಿ (ಸ್ಥಳ / ವಿಳಾಸ)",
    no_pending_requests: "ಸ್ವಯಂಸೇವಕರನ್ನು ನಿಯೋಜಿಸಲು ಯಾವುದೇ ಸಕ್ರಿಯ ವಿನಂತಿಗಳು ಲಭ್ಯವಿಲ್ಲ.",
    exhaustion_forecast: "ದಾಸ್ತಾನು ಖಾಲಿಯಾಗುವ ಮುನ್ಸೂಚನೆ",
    hrs_left: "ಗಂಟೆಗಳು ಬಾಕಿ",
    burn_rate: "ಬಳಕೆಯ ದರ",
    units_hr: "ಘಟಕಗಳು/ಗಂಟೆ",
    risk: "ಅಪಾಯ",
    avg_priority: "ಸರಾಸರಿ ಆದ್ಯತೆ",
    people_helped: "ಸಹಾಯ ಪಡೆದ ಜನರು",
    utilization: "ಬಳಕೆ ದರ",
    avg_response_time: "ಸರಾಸರಿ ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ",
    coords_locked: "ನಿರ್ದೇಶಾಂಕಗಳನ್ನು ಲಾಕ್ ಮಾಡಲಾಗಿದೆ",
    pin_target_required: "🚨 ಪಿನ್ ಮಾಡಿದ ಗುರಿಯ ನಿರ್ದೇಶಾಂಕಗಳು ಅಗತ್ಯವಿದೆ (ನಕ್ಷೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ)"
  }
};

const WEATHER_API_KEY = "ffc79bc9d96b20005a62a24e1f39113a";

export default function Home() {
  // Toast Notification State
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 5000);
  };

  // Authentication & Session
  const [currentUser, setCurrentUser] = useState(null);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  // Registration Form
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('User');
  const [regError, setRegError] = useState('');

  // Core Data State
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState(DEFAULT_RESOURCES);
  const [volunteers, setVolunteers] = useState(DEFAULT_VOLUNTEERS);
  const [nextRequestId, setNextRequestId] = useState(1005);
  const [dispatchingVolId, setDispatchingVolId] = useState(null);

  // Map & Location State
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [deviceLat, setDeviceLat] = useState(null);
  const [deviceLng, setDeviceLng] = useState(null);
  const [deviceGpsStatus, setDeviceGpsStatus] = useState('pending'); // 'pending', 'active', 'denied', 'unsupported'

  // Weather & Sensors
  const [weatherData, setWeatherData] = useState(null);
  const [sensorData, setSensorData] = useState({
    temperature: 24.5,
    humidity: 62.0,
    soil_moisture: 2100,
    water_level: 120.0,
    seismic: 0.05,
    air_quality: 180,
    rain_level: 0,
    baro_pressure: 1011.5,
    altitude: 770.0,
    wind_speed: 12.5,
    wind_direction: 190,
    latitude: 0,
    longitude: 0,
    status: "Updated",
    created_at: new Date().toISOString()
  });

  // Settings & Accessibility
  const [lang, setLang] = useState('en');
  const [tacticalMode, setTacticalMode] = useState(false);
  const [mobileView, setMobileView] = useState(false);

  // AI Triage & Matchmaking & Broadcasts State
  const [selectedTriageRequest, setSelectedTriageRequest] = useState(null);
  const [aiTriageLoading, setAiTriageLoading] = useState(false);
  const [broadcasts, setBroadcasts] = useState([]);
  const [newBroadcastMsg, setNewBroadcastMsg] = useState("");
  const [broadcastSeverity, setBroadcastSeverity] = useState("info");
  const [broadcastZone, setBroadcastZone] = useState("All Sectors");
  const [isDemoModeOpen, setIsDemoModeOpen] = useState(false);

  // Collapsible UI panels
  const [isHardwareExpanded, setIsHardwareExpanded] = useState(false);
  const [isWeatherExpanded, setIsWeatherExpanded] = useState(false);
  const [isVolunteerFormExpanded, setIsVolunteerFormExpanded] = useState(false);
  const [isUserResourcesExpanded, setIsUserResourcesExpanded] = useState(false);

  // AI Assistant State
  const [aiSummaryOutput, setAiSummaryOutput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Sort Risk Level
  const [riskSort, setRiskSort] = useState('critical');

  // Modals & Allocation Inputs
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocateRequest, setAllocateRequest] = useState(null);
  const [allocateQtyVal, setAllocateQtyVal] = useState('');

  const [showResourceModal, setShowResourceModal] = useState(false);
  const [resourceModalData, setResourceModalData] = useState({ id: '', name: '', type: '', totalQuantity: '', availableQuantity: '' });

  // User Dashboard Form Inputs
  const [userResourceType, setUserResourceType] = useState('');
  const [userQuantity, setUserQuantity] = useState('');
  const [userSeverity, setUserSeverity] = useState('');
  const [userIndividuals, setUserIndividuals] = useState('');
  const [userDescription, setUserDescription] = useState('');

  // Admin Dashboard Form Inputs
  const [adminResourceType, setAdminResourceType] = useState('');
  const [adminQuantity, setAdminQuantity] = useState('');
  const [adminSeverity, setAdminSeverity] = useState('');
  const [adminIndividuals, setAdminIndividuals] = useState('');
  const [adminContact, setAdminContact] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminDescription, setAdminDescription] = useState('');

  // Disaster Boundary and Verification States
  const [disasterCenter, setDisasterCenter] = useState({ lat: 12.52, lng: 76.90 }); // Default Mandya center
  const [disasterRadius, setDisasterRadius] = useState(15); // Default 15 km
  const [tempCenterLat, setTempCenterLat] = useState('12.52');
  const [tempCenterLng, setTempCenterLng] = useState('76.90');
  const [tempRadius, setTempRadius] = useState('15');

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationRequest, setVerificationRequest] = useState(null);
  const [verificationType, setVerificationType] = useState('help_other'); // 'help_other' or 'fake'
  const [proofLat, setProofLat] = useState('');
  const [proofLng, setProofLng] = useState('');
  const [proofAddress, setProofAddress] = useState('');

  // SMS Google Sheets Integration
  const [smsData, setSmsData] = useState([]);
  const [isSmsLoading, setIsSmsLoading] = useState(false);
  const [smsError, setSmsError] = useState(null);

  // Volunteer Join Inputs
  const [volName, setVolName] = useState('');
  const [volRole, setVolRole] = useState('Medical');
  const [volPhone, setVolPhone] = useState('');

  const routeTimeoutRef = useRef(null);
  const routeModalTimeoutRef = useRef(null);

  // Automatic Geolocation / Device GPS permission and tracking on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!navigator.geolocation) {
      setDeviceGpsStatus('unsupported');
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setDeviceLat(lat);
        setDeviceLng(lng);
        setDeviceGpsStatus('active');
        console.log(`Device GPS Active: Lat ${lat}, Lng ${lng}`);
      },
      (error) => {
        console.warn("Device GPS Access Warning:", error.message || error);
        setDeviceGpsStatus(error.code === 1 ? 'denied' : 'pending');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );

    return () => {
      if (navigator.geolocation && watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const t = TRANSLATIONS[lang];

  // 1. Initial Load & Setup
  useEffect(() => {
    // Restore User Session
    const savedUser = localStorage.getItem('drmsCurrentUser');
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        setTimeout(() => {
          setCurrentUser(userObj);
        }, 0);
      } catch (e) {
        localStorage.removeItem('drmsCurrentUser');
      }
    }

    // Restore Settings
    const savedLang = localStorage.getItem('resqlink_lang');
    const savedTactical = localStorage.getItem('tacticalMode') === 'true';
    const savedMobile = localStorage.getItem('mobileViewActive') === 'true';
    setTimeout(() => {
      if (savedLang) setLang(savedLang);
      setTacticalMode(savedTactical);
      setMobileView(savedMobile);
    }, 0);

    // Load broadcasts from server with change detection
    let prevBroadcastsJson = '';
    const loadBroadcasts = async () => {
      try {
        const res = await fetch('/api/broadcasts');
        if (res.ok) {
          const data = await res.json();
          const jsonStr = JSON.stringify(data);
          if (jsonStr !== prevBroadcastsJson) {
            prevBroadcastsJson = jsonStr;
            setBroadcasts(data);
          }
        }
      } catch (err) {
        console.error("Failed to load broadcasts:", err);
      }
    };

    // Load requests from server with change detection
    let prevRequestsJson = '';
    const loadRequests = async () => {
      try {
        const res = await fetch('/api/requests');
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const jsonStr = JSON.stringify(data);
            if (jsonStr !== prevRequestsJson) {
              prevRequestsJson = jsonStr;
              const mapped = data.map(req => {
                const mlResult = calculateMLPriority(req.resourceType, req.individualsAffected, req.severity);
                return {
                  ...req,
                  id: req.id || req.requestId,
                  priorityScore: mlResult.priorityScore,
                  mlPriorityClass: mlResult.priorityClass,
                  mlConfidence: mlResult.mlConfidence / 100
                };
              });
              setRequests(mapped);
            }
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load requests from server:", err);
      }

      if (!prevRequestsJson) {
        const seededRequests = DUMMY_REQUESTS.map(req => {
          const mlResult = calculateMLPriority(req.resourceType, req.individualsAffected, req.severity);
          return {
            ...req,
            priorityScore: mlResult.priorityScore,
            mlPriorityClass: mlResult.priorityClass,
            mlConfidence: mlResult.mlConfidence / 100
          };
        });
        prevRequestsJson = JSON.stringify(seededRequests);
        setRequests(seededRequests);
      }
    };

    loadRequests();
    loadBroadcasts();

    // Poll updates every 12 seconds
    const pollInterval = setInterval(() => {
      loadRequests();
      loadBroadcasts();
    }, 12000);

    return () => clearInterval(pollInterval);
  }, []);

  // Sync Body CSS Styles
  useEffect(() => {
    if (tacticalMode) {
      document.body.classList.add('tactical-mode');
    } else {
      document.body.classList.remove('tactical-mode');
    }
    localStorage.setItem('tacticalMode', tacticalMode);
  }, [tacticalMode]);

  useEffect(() => {
    if (mobileView) {
      document.body.classList.add('mobile-view-active');
    } else {
      document.body.classList.remove('mobile-view-active');
    }
    localStorage.setItem('mobileViewActive', mobileView);
  }, [mobileView]);

  // Sync base position for map and fetch weather
  const currentBaseLocation = useMemo(() => {
    if (sensorData.latitude && sensorData.longitude) {
      return {
        lat: sensorData.latitude,
        lng: sensorData.longitude,
        name: "Dynamic Telemetry Node"
      };
    }
    return {
      lat: 12.3275,
      lng: 76.6133,
      name: "VVCE-MYS"
    };
  }, [sensorData.latitude, sensorData.longitude]);

  useEffect(() => {
    fetchWeather(currentBaseLocation.lat, currentBaseLocation.lng);
  }, [currentBaseLocation.lat, currentBaseLocation.lng, lang]);

  // 2. Live Hardware Data Polling (Supabase REST API)
  useEffect(() => {
    let active = true;
    const fetchSensorData = async () => {
      try {
        const configResponse = await fetch('/api/config');
        const config = await configResponse.json();
        
        const rawUrl = config.SUPABASE_URL || "";
        const key = config.SUPABASE_ANON_KEY || "";
        
        if (!rawUrl || !key) return;
        
        const supabaseUrl = `${rawUrl.replace(/\/$/, '')}/rest/v1/sensor_logs?select=*&order=created_at.desc&limit=1`;

        const response = await fetch(supabaseUrl, {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`
          }
        });
        const data = await response.json();
        if (!active) return;
        if (data && data.length > 0) {
          setSensorData(data[0]);
        }
      } catch (err) {
        if (!active) return;
        // Suppress repeating console.error and use simulated data smoothly
        setSensorData(prev => {
          const deltaTemp = (Math.random() - 0.5) * 0.2;
          const deltaHum = (Math.random() - 0.5) * 0.4;
          const deltaSoil = Math.round((Math.random() - 0.5) * 10);
          const deltaWater = parseFloat(((Math.random() - 0.5) * 0.3).toFixed(2));
          const deltaSeismic = parseFloat(((Math.random() - 0.5) * 0.01).toFixed(4));
          const deltaAir = Math.round((Math.random() - 0.5) * 2);
          
          return {
            ...prev,
            temperature: parseFloat((Math.max(10, Math.min(45, prev.temperature + deltaTemp))).toFixed(1)),
            humidity: parseFloat((Math.max(10, Math.min(95, prev.humidity + deltaHum))).toFixed(1)),
            soil_moisture: Math.max(500, Math.min(4000, prev.soil_moisture + deltaSoil)),
            water_level: parseFloat((Math.max(0, Math.min(500, prev.water_level + deltaWater))).toFixed(1)),
            seismic: parseFloat((Math.max(0.01, Math.min(2.0, prev.seismic + deltaSeismic))).toFixed(3)),
            air_quality: Math.max(10, Math.min(300, prev.air_quality + deltaAir)),
            status: "Simulated (Offline)"
          };
        });
      }
    };

    // Fetch immediately on mount
    fetchSensorData();

    // Then poll every 15 seconds
    const interval = setInterval(fetchSensorData, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // 2.5 Live SMS Data Polling (Google Sheets)
  useEffect(() => {
    let active = true;
    let isFirstFetch = true;
    let prevSmsJson = '';

    const fetchSmsData = async () => {
      if (isFirstFetch) {
        setIsSmsLoading(true);
      }
      setSmsError(null);
      try {
        const response = await fetch('/api/sms');
        if (!response.ok) throw new Error('Failed to fetch SMS data from proxy');
        const text = await response.text();
        
        const rows = [];
        let currentRow = [];
        let currentCell = '';
        let inQuotes = false;
        
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === '"') {
            if (inQuotes && text[i+1] === '"') {
              currentCell += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell.trim());
            currentCell = '';
          } else if (char === '\n' && !inQuotes) {
            currentRow.push(currentCell.trim());
            rows.push(currentRow);
            currentRow = [];
            currentCell = '';
          } else if (char !== '\r' || inQuotes) {
            currentCell += char;
          }
        }
        if (currentCell !== '' || currentRow.length > 0) {
          currentRow.push(currentCell.trim());
          rows.push(currentRow);
        }
        
        if (rows.length > 0) {
          const headers = rows[0];
          const data = [];
          for (let i = 1; i < rows.length; i++) {
            if (rows[i].length === 0 || (rows[i].length === 1 && !rows[i][0])) continue;
            const obj = {};
            headers.forEach((header, index) => {
              obj[header] = rows[i][index] || '';
            });
            data.push(obj);
          }
          if (active) {
            const jsonStr = JSON.stringify(data);
            if (jsonStr !== prevSmsJson) {
              prevSmsJson = jsonStr;
              setSmsData(data);
            }
          }
        }
      } catch (err) {
        console.error("SMS Fetch Error:", err);
        if (active) {
          setSmsError(err.message);
        }
      } finally {
        if (active && isFirstFetch) {
          setIsSmsLoading(false);
          isFirstFetch = false;
        }
      }
    };

    fetchSmsData();
    const interval = setInterval(fetchSmsData, 12000); // 12 seconds silent poll
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // 3. API Requests & Helper Functions
  function fetchWeather(lat, lng) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric&lang=${lang === 'kn' ? 'kn' : 'en'}`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.main) setWeatherData(data);
      })
      .catch(err => console.error('Error fetching weather:', err));
  }

  const getAISummary = async () => {
    setIsAiLoading(true);
    setAiSummaryOutput(lang === 'kn' ? "ಟೆಲಿಮೆಟ್ರಿ ವೆಕ್ಟರ್‌ಗಳು ಮತ್ತು ಸಂಕಲಿಸಿದ ವರದಿಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ..." : "Analyzing telemetry vectors and compiled reports...");
    try {
      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensorData, lang })
      });
      const data = await response.json();
      if (data.summary) {
        setAiSummaryOutput(data.summary);
      } else {
        setAiSummaryOutput(lang === 'kn' ? "AI ಸಾರಾಂಶವನ್ನು ರಚಿಸಲು ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು Groq API ಸಂಪರ್ಕವನ್ನು ಪರಿಶೀಲಿಸಿ." : "AI failed to generate summary. Please check Groq API connection.");
      }
    } catch (err) {
      setAiSummaryOutput(lang === 'kn' ? "ನೆಟ್‌ವರ್ಕ್ ದೋಷ: ದಯವಿಟ್ಟು ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ಅಥವಾ Groq API ಕೀ ಸಂರಚನೆಯನ್ನು ಪರಿಶೀಲಿಸಿ." : "Network Error: Please check internet connection or verify Groq API key configuration.");
    } finally {
      setIsAiLoading(false);
    }
  };

  function calculateMLPriority(resourceType, individualsAffected, severity) {
    let priorityClass = 'low';
    let baseScore = 0;

    if (resourceType === 'Ambulance' || resourceType === 'Rescue Team') {
      if (individualsAffected >= 25) {
        priorityClass = 'critical';
        baseScore = 120;
      } else if (individualsAffected >= 5) {
        priorityClass = 'high';
        baseScore = 70;
      } else {
        priorityClass = 'medium';
        baseScore = 40;
      }
    } else if (resourceType === 'Medical Supplies') {
      if (individualsAffected >= 100 || (individualsAffected >= 50 && severity >= 4)) {
        priorityClass = 'critical';
        baseScore = 110;
      } else if (individualsAffected >= 50 || (individualsAffected >= 25 && severity >= 4)) {
        priorityClass = 'high';
        baseScore = 65;
      } else if (individualsAffected >= 10) {
        priorityClass = 'medium';
        baseScore = 35;
      } else {
        priorityClass = 'low';
        baseScore = 15;
      }
    } else if (resourceType === 'Food & Water') {
      if (individualsAffected >= 200) {
        priorityClass = 'critical';
        baseScore = 105;
      } else if (individualsAffected >= 100) {
        priorityClass = 'high';
        baseScore = 60;
      } else if (individualsAffected >= 30) {
        priorityClass = 'medium';
        baseScore = 32;
      } else {
        priorityClass = 'low';
        baseScore = 12;
      }
    } else if (resourceType === 'Shelter') {
      if (individualsAffected >= 150) {
        priorityClass = 'critical';
        baseScore = 108;
      } else if (individualsAffected >= 80) {
        priorityClass = 'high';
        baseScore = 62;
      } else if (individualsAffected >= 20) {
        priorityClass = 'medium';
        baseScore = 30;
      } else {
        priorityClass = 'low';
        baseScore = 10;
      }
    }

    const finalScore = baseScore + (severity * 3);
    const seedVal = ((resourceType ? resourceType.charCodeAt(0) : 0) + (individualsAffected || 0) * 7 + (severity || 0) * 13) % 15;
    const confidence = 80 + seedVal;

    return {
      priorityClass,
      priorityScore: finalScore,
      mlConfidence: confidence
    };
  }

  // Live forecasting calculations
  const forecasts = useMemo(() => {
    return resources.map(res => {
      const relevantRequests = requests.filter(r => r.resourceType === res.type && r.status !== 'resolved');
      const hourlyRate = (relevantRequests.length * 0.8) + 1.2;
      const hoursLeft = (res.availableQuantity / hourlyRate).toFixed(1);
      const riskStatus = hoursLeft < 12 ? "critical" : (hoursLeft < 24 ? "high" : "low");

      return {
        ...res,
        hoursLeft,
        hourlyRate: hourlyRate.toFixed(1),
        riskStatus
      };
    });
  }, [resources, requests]);

  // Analytics Metrics
  const avgPriority = useMemo(() => {
    const active = requests.filter(r => r.status !== 'resolved');
    if (active.length === 0) return 0.0;
    const sum = active.reduce((acc, curr) => acc + (curr.priorityScore || 0), 0);
    return (sum / active.length).toFixed(1);
  }, [requests]);

  const peopleHelped = useMemo(() => {
    const resolved = requests.filter(r => r.status === 'resolved');
    return resolved.reduce((acc, curr) => acc + (curr.individualsAffected || 0), 0);
  }, [requests]);

  const resourceUtilization = useMemo(() => {
    const total = resources.reduce((acc, curr) => acc + curr.totalQuantity, 0);
    const available = resources.reduce((acc, curr) => acc + curr.availableQuantity, 0);
    if (total === 0) return 0;
    return (((total - available) / total) * 100).toFixed(0);
  }, [resources]);

  // Map Click Location Handlers (memoized)
  const handleMapClick = useCallback((latlng) => {
    setSelectedLocation(latlng);
  }, []);

  const handleAutoFetchGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latlng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSelectedLocation(latlng);
        },
        (error) => {
          console.warn("GPS Warning:", error.message || error);
          alert("Failed to fetch GPS location: " + error.message);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Sorted Requests
  const sortedRequests = useMemo(() => {
    // A request is in active (disaster area) if status is not resolved AND NOT fake AND (it is verified OR its distance to disasterCenter is <= disasterRadius)
    const active = requests.filter(r => {
      if (r.status === 'resolved' || r.status === 'fake') return false;
      const dist = getCoordinatesDistance(r.lat, r.lng, disasterCenter.lat, disasterCenter.lng);
      const isInside = dist <= disasterRadius;
      const isVerified = r.verified === true;
      return isInside || isVerified;
    });

    // A request is in otherLocations if status is not resolved AND NOT fake AND it is not verified AND its distance to disasterCenter is > disasterRadius
    const otherLocations = requests.filter(r => {
      if (r.status === 'resolved' || r.status === 'fake') return false;
      const dist = getCoordinatesDistance(r.lat, r.lng, disasterCenter.lat, disasterCenter.lng);
      const isInside = dist <= disasterRadius;
      const isVerified = r.verified === true;
      return !isInside && !isVerified;
    });

    const resolved = requests.filter(r => r.status === 'resolved');
    
    const sortFn = (a, b) => {
      if (riskSort === 'critical') {
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      }
      return (a.priorityScore || 0) - (b.priorityScore || 0);
    };

    return {
      active: [...active].sort(sortFn),
      otherLocations: [...otherLocations].sort(sortFn),
      resolved: [...resolved].sort((a, b) => new Date(b.resolvedAt) - new Date(a.resolvedAt))
    };
  }, [requests, riskSort, disasterCenter, disasterRadius]);

  // 4. Form Submit & Dispatch Methods
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');

    const username = usernameInput.trim();
    const password = passwordInput;

    if (username === CREDENTIALS.admin.username && password === CREDENTIALS.admin.password) {
      setCurrentUser(CREDENTIALS.admin);
      localStorage.setItem('drmsCurrentUser', JSON.stringify(CREDENTIALS.admin));
    } else if (username === CREDENTIALS.user.username && password === CREDENTIALS.user.password) {
      setCurrentUser(CREDENTIALS.user);
      localStorage.setItem('drmsCurrentUser', JSON.stringify(CREDENTIALS.user));
    } else {
      setAuthError('Invalid credentials. Check username or password.');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match');
      return;
    }

    showToast('Demo registration completed. You can now login with local credentials.', 'success');
    setShowRegister(false);
    setRegUsername('');
    setRegPassword('');
    setRegConfirmPassword('');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('drmsCurrentUser');
    setShowRegister(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  const fillDemoCredentials = () => {
    setUsernameInput('1');
    setPasswordInput('1');
  };

  const handleUserRequestSubmit = (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      showToast('Please click on the map to specify coordinates first.', 'error');
      return;
    }

    const qty = parseInt(userQuantity);
    const sev = parseInt(userSeverity);
    const affected = parseInt(userIndividuals);

    const mlResult = calculateMLPriority(userResourceType, affected, sev);

    const newRequest = {
      id: requests.length + 1,
      requestId: `REQ-${nextRequestId}`,
      resourceType: userResourceType,
      quantityRequested: qty,
      quantityAllocated: 0,
      quantityPending: qty,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      publisherLat: deviceLat || currentBaseLocation.lat,
      publisherLng: deviceLng || currentBaseLocation.lng,
      severity: sev,
      individualsAffected: affected,
      status: 'pending',
      priorityScore: parseFloat(mlResult.priorityScore.toFixed(1)),
      mlPriorityClass: mlResult.priorityClass,
      mlConfidence: parseFloat((mlResult.mlConfidence / 100).toFixed(2)),
      contactPerson: currentUser ? currentUser.fullName : "Field Dispatcher",
      contactPhone: "N/A",
      description: userDescription,
      verified: false
    };

    setRequests(prev => [newRequest, ...prev]);
    setNextRequestId(prev => prev + 1);

    // Save request to server DB persistently
    fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRequest)
    }).catch(err => console.error("Error saving request to server:", err));

    // Reset Form
    setUserResourceType('');
    setUserQuantity('');
    setUserSeverity('');
    setUserIndividuals('');
    setUserDescription('');
    setSelectedLocation(null);

    showToast('Emergency request submitted successfully!', 'success');
  };

  const handleAdminRequestSubmit = (e) => {
    e.preventDefault();
    if (!selectedLocation) {
      showToast('Please select coordinates on the map.', 'error');
      return;
    }

    const qty = parseInt(adminQuantity);
    const sev = parseInt(adminSeverity);
    const affected = parseInt(adminIndividuals);

    const mlResult = calculateMLPriority(adminResourceType, affected, sev);

    const newRequest = {
      id: requests.length + 1,
      requestId: `REQ-${nextRequestId}`,
      resourceType: adminResourceType,
      quantityRequested: qty,
      quantityAllocated: 0,
      quantityPending: qty,
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      publisherLat: deviceLat || currentBaseLocation.lat,
      publisherLng: deviceLng || currentBaseLocation.lng,
      severity: sev,
      individualsAffected: affected,
      status: 'pending',
      priorityScore: parseFloat(mlResult.priorityScore.toFixed(1)),
      mlPriorityClass: mlResult.priorityClass,
      mlConfidence: parseFloat((mlResult.mlConfidence / 100).toFixed(2)),
      contactPerson: adminContact,
      contactPhone: adminPhone,
      description: adminDescription,
      verified: true
    };

    setRequests(prev => [newRequest, ...prev]);
    setNextRequestId(prev => prev + 1);

    // Save request to server DB persistently
    fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRequest)
    }).catch(err => console.error("Error saving request to server:", err));

    // Reset Form
    setAdminResourceType('');
    setAdminQuantity('');
    setAdminSeverity('');
    setAdminIndividuals('');
    setAdminContact('');
    setAdminPhone('');
    setAdminDescription('');
    setSelectedLocation(null);

    showToast('Emergency request submitted successfully!', 'success');
  };

  const handleVolunteerRegister = (e) => {
    e.preventDefault();
    const newVol = {
      id: volunteers.length + 1,
      name: volName,
      role: volRole,
      phone: volPhone,
      status: 'available',
      lat: currentBaseLocation.lat + (Math.random() - 0.5) * 0.04,
      lng: currentBaseLocation.lng + (Math.random() - 0.5) * 0.04
    };

    setVolunteers(prev => [...prev, newVol]);
    showToast(`Thank you ${volName}! You are registered as ${volRole} volunteer.`, 'success');
    setVolName('');
    setVolPhone('');
  };

  const handleDispatchVolunteer = async (volId, reqId) => {
    const target = requests.find(r => r.id === reqId);
    if (!target) {
      showToast("Request not found.", 'error');
      return;
    }
    const vol = volunteers.find(v => v.id === volId);
    if (!vol) return;

    // Update volunteer state locally
    setVolunteers(prev => prev.map(v => v.id === volId ? { ...v, status: 'busy' } : v));

    // Update request locally and on server
    const updatedRequest = {
      ...target,
      status: 'allocated',
      quantityAllocated: target.quantityRequested,
      quantityPending: 0,
      assignedVolunteerId: volId,
      assignedVolunteerName: vol.name
    };

    setRequests(prev => prev.map(r => r.id === reqId ? updatedRequest : r));
    
    // Select it for triage sidebar too to update UI
    if (selectedTriageRequest && selectedTriageRequest.id === reqId) {
      setSelectedTriageRequest(updatedRequest);
    }

    try {
      await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedRequest)
      });
      showToast(`Dispatched volunteer ${vol.name} to ${target.requestId} (${target.resourceType})`, 'success');
    } catch (err) {
      console.error("Failed to sync dispatch on server:", err);
    }

    setDispatchingVolId(null);
    
    // Draw route on map
    handleShowRoute(target);
  };

  function getCoordinatesDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  const handleSendEmergencyBroadcast = async () => {
    if (!newBroadcastMsg.trim()) {
      showToast("Broadcast message cannot be empty", "warning");
      return;
    }

    try {
      const response = await fetch('/api/broadcasts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newBroadcastMsg,
          targetZone: broadcastZone,
          severity: broadcastSeverity
        })
      });
      if (response.ok) {
        setNewBroadcastMsg("");
        // Reload broadcasts locally
        const res = await fetch('/api/broadcasts');
        if (res.ok) {
          const data = await res.json();
          setBroadcasts(data);
        }
        showToast("Emergency Broadcast sent via SMS gateway successfully!", "success");
      }
    } catch (err) {
      console.error("Failed to send broadcast:", err);
      showToast("Failed to send broadcast", "error");
    }
  };

  const handleRunAITriage = async (req) => {
    setAiTriageLoading(true);
    try {
      const response = await fetch('/api/ai-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: req.description,
          lang: lang
        })
      });
      if (response.ok) {
        const data = await response.json();
        const updated = {
          ...req,
          mlPriorityClass: data.mlPriorityClass,
          mlConfidence: data.mlConfidence,
          triageSummary: data.triageSummary
        };
        setSelectedTriageRequest(updated);
        
        // Also update requests state locally
        setRequests(prev => prev.map(r => r.id === req.id ? updated : r));
        showToast("AI Triage analysis complete!", "success");
      }
    } catch (err) {
      console.error("AI Triage run failed:", err);
      showToast("AI Triage run failed", "error");
    } finally {
      setAiTriageLoading(false);
    }
  };

  const handleSaveAITriage = async (req) => {
    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: req.requestId,
          mlPriorityClass: req.mlPriorityClass,
          mlConfidence: req.mlConfidence,
          triageSummary: req.triageSummary
        })
      });
      if (response.ok) {
        showToast("AI Triage committed to database!", "success");
      }
    } catch (err) {
      console.error("Failed to save triage:", err);
      showToast("Failed to save triage", "error");
    }
  };

  const handleUpdateDisasterZone = () => {
    const lat = parseFloat(tempCenterLat);
    const lng = parseFloat(tempCenterLng);
    const rad = parseFloat(tempRadius);
    if (isNaN(lat) || isNaN(lng) || isNaN(rad)) {
      showToast('Please enter valid numerical values.', 'error');
      return;
    }
    setDisasterCenter({ lat, lng });
    setDisasterRadius(rad);
    showToast(`Disaster boundary updated! Center: ${lat}, ${lng} | Radius: ${rad}km`, 'success');
  };

  const handleSetCenterFromBase = () => {
    setTempCenterLat(currentBaseLocation.lat.toString());
    setTempCenterLng(currentBaseLocation.lng.toString());
    showToast('Populated with current base station coordinates.', 'info');
  };

  const handleGenerateMockSOSInside = async () => {
    // Generate within 0.05 degrees (approx 5km) of disasterCenter
    const latOffset = (Math.random() - 0.5) * 0.05;
    const lngOffset = (Math.random() - 0.5) * 0.05;
    const mockLat = disasterCenter.lat + latOffset;
    const mockLng = disasterCenter.lng + lngOffset;

    const needTypes = ["Medical", "Food & Water", "Shelter", "Ambulance", "Rescue Team"];
    const names = ["Suresh K.", "Ravi Kumar", "Anitha M.", "Prakash Gowda", "Latha S."];
    const descriptions = [
      "Water is rising and flooding the house ground level. Urgent evacuation needed.",
      "Trapped under tree branch after landslide block. Leg injury reported.",
      "Elderly patient with heart condition requires immediate transport. Roads blocked by trees.",
      "Displaced families without food and clean drinking water. Running out of sustenance.",
      "Trapped on first floor, water level rising rapidly. Require rescue boat rescue."
    ];

    const randomIndex = Math.floor(Math.random() * needTypes.length);

    const mockSOS = {
      requestId: "REQ-MOCK-" + Math.floor(1000 + Math.random() * 9000),
      resourceType: needTypes[randomIndex],
      quantityRequested: Math.floor(1 + Math.random() * 8),
      quantityAllocated: 0,
      quantityPending: 1,
      lat: mockLat,
      lng: mockLng,
      publisherLat: deviceLat || currentBaseLocation.lat,
      publisherLng: deviceLng || currentBaseLocation.lng,
      severity: Math.floor(3 + Math.random() * 3),
      individualsAffected: Math.floor(2 + Math.random() * 15),
      status: "pending",
      contactPerson: names[Math.floor(Math.random() * names.length)],
      contactPhone: "9" + Math.floor(100000000 + Math.random() * 900000000),
      address: "Simulated Sector " + String.fromCharCode(65 + Math.floor(Math.random() * 5)),
      description: descriptions[randomIndex],
      verified: true
    };

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockSOS)
      });
      if (response.ok) {
        const res = await fetch('/api/requests');
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(req => {
            const mlResult = calculateMLPriority(req.resourceType, req.individualsAffected, req.severity);
            return {
              ...req,
              id: req.id || req.requestId,
              priorityScore: mlResult.priorityScore,
              mlPriorityClass: mlResult.priorityClass,
              mlConfidence: mlResult.mlConfidence / 100
            };
          });
          setRequests(mapped);
          showToast(`Mock SOS beacon (${mockSOS.requestId}) generated inside disaster zone!`, 'success');
        }
      }
    } catch (err) {
      console.error("Failed to generate mock SOS:", err);
      showToast("Mock SOS beacon generation failed", "error");
    }
  };

  const handleGenerateMockSOSOutside = async () => {
    // Generate outside active zone (e.g., offset by 0.25 to 0.4 degrees, which is ~30-40km away)
    const latOffset = (0.25 + Math.random() * 0.15) * (Math.random() > 0.5 ? 1 : -1);
    const lngOffset = (0.25 + Math.random() * 0.15) * (Math.random() > 0.5 ? 1 : -1);
    const mockLat = disasterCenter.lat + latOffset;
    const mockLng = disasterCenter.lng + lngOffset;

    const needTypes = ["Medical", "Food & Water", "Shelter", "Ambulance", "Rescue Team"];
    const names = ["Karthik R.", "Deepa Gowda", "Manjunath S.", "Shruthi K.", "Harish B."];
    const descriptions = [
      "I am safe, but my cousins are stuck in the flood zone near the railroad. Please help them.",
      "Reporting from office. My sister is stranded in the flooded housing sector. She has no power or water.",
      "Citizen alert: Old age home in the disaster zone has water entering the ground floor.",
      "My friend is trapped in their car near the water body. Please send a rescue boat there.",
      "Urgent medical emergency for family member stuck in the flood affected zone."
    ];

    const randomIndex = Math.floor(Math.random() * needTypes.length);

    const mockSOS = {
      requestId: "REQ-OUT-" + Math.floor(1000 + Math.random() * 9000),
      resourceType: needTypes[randomIndex],
      quantityRequested: Math.floor(1 + Math.random() * 5),
      quantityAllocated: 0,
      quantityPending: 1,
      lat: mockLat,
      lng: mockLng,
      severity: Math.floor(2 + Math.random() * 3),
      individualsAffected: Math.floor(1 + Math.random() * 8),
      status: "pending",
      contactPerson: names[Math.floor(Math.random() * names.length)],
      contactPhone: "9" + Math.floor(100000000 + Math.random() * 900000000),
      address: "Outside Region (Reporting for Stuck Person)",
      description: descriptions[randomIndex],
      verified: false
    };

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockSOS)
      });
      if (response.ok) {
        const res = await fetch('/api/requests');
        if (res.ok) {
          const data = await res.json();
          const mapped = data.map(req => {
            const mlResult = calculateMLPriority(req.resourceType, req.individualsAffected, req.severity);
            return {
              ...req,
              id: req.id || req.requestId,
              priorityScore: mlResult.priorityScore,
              mlPriorityClass: mlResult.priorityClass,
              mlConfidence: mlResult.mlConfidence / 100
            };
          });
          setRequests(mapped);
          showToast(`Mock SOS beacon (${mockSOS.requestId}) generated outside disaster zone! Check "Other Locations".`, 'success');
        }
      }
    } catch (err) {
      console.error("Failed to generate mock SOS:", err);
      showToast("Mock SOS beacon generation failed", "error");
    }
  };

  const handleOpenVerification = (req) => {
    setVerificationRequest(req);
    setVerificationType('help_other');
    setProofLat('');
    setProofLng('');
    setProofAddress('');
    setShowVerificationModal(true);
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    if (!verificationRequest) return;

    if (verificationType === 'fake') {
      const updatedReq = {
        ...verificationRequest,
        status: 'resolved',
        verificationStatus: 'fake',
        resolvedAt: new Date().toISOString(),
        description: `${verificationRequest.description} (Marked Fake by Admin)`
      };

      setRequests(prev => prev.map(r => (r.id === verificationRequest.id || r.requestId === verificationRequest.requestId) ? updatedReq : r));

      try {
        await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedReq)
        });
        showToast(`Request ${verificationRequest.requestId} archived as fake.`, 'success');
      } catch (err) {
        console.error("Failed to update status on server:", err);
      }
      setShowVerificationModal(false);
      setVerificationRequest(null);
    } else {
      const latVal = parseFloat(proofLat);
      const lngVal = parseFloat(proofLng);

      if (isNaN(latVal) || isNaN(lngVal)) {
        showToast("Please enter valid coordinates.", "error");
        return;
      }

      const distance = getCoordinatesDistance(latVal, lngVal, disasterCenter.lat, disasterCenter.lng);
      if (distance > disasterRadius) {
        showToast(`The target location is still outside the disaster area! Distance: ${distance.toFixed(2)} km (Allowed: ${disasterRadius} km)`, 'error');
        return;
      }

      const updatedReq = {
        ...verificationRequest,
        lat: latVal,
        lng: lngVal,
        address: proofAddress || verificationRequest.address,
        verified: true,
        verificationStatus: 'verified',
        description: `${verificationRequest.description} (Verified from sender at original location Lat: ${verificationRequest.lat.toFixed(4)}, Lng: ${verificationRequest.lng.toFixed(4)})`
      };

      setRequests(prev => prev.map(r => (r.id === verificationRequest.id || r.requestId === verificationRequest.requestId) ? updatedReq : r));

      try {
        await fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedReq)
        });
        showToast(`Request ${verificationRequest.requestId} verified & updated to disaster zone.`, 'success');
      } catch (err) {
        console.error("Failed to update status on server:", err);
      }

      setShowVerificationModal(false);
      setVerificationRequest(null);
    }
  };

  const handleShowRoute = (request) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${currentBaseLocation.lng},${currentBaseLocation.lat};${request.lng},${request.lat}?overview=full&geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.code === 'Ok' && data.routes.length > 0) {
          const route = data.routes[0];
          const distance = (route.distance / 1000).toFixed(2);
          const duration = Math.round(route.duration / 60);

          setRouteData({
            distance,
            duration,
            location: `Lat: ${request.lat.toFixed(4)}, Lng: ${request.lng.toFixed(4)}`,
            lat: request.lat,
            lng: request.lng,
            contactPerson: request.contactPerson,
            contactPhone: request.contactPhone,
            individualsAffected: request.individualsAffected,
            severity: request.severity,
            description: request.description
          });

          const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteCoordinates(coordinates);
          setShowRouteModal(true);

          fetchWeather(request.lat, request.lng);

          if (routeTimeoutRef.current) clearTimeout(routeTimeoutRef.current);
          routeTimeoutRef.current = setTimeout(() => {
            setRouteCoordinates([]);
            fetchWeather(currentBaseLocation.lat, currentBaseLocation.lng);
          }, 20000);

          if (routeModalTimeoutRef.current) clearTimeout(routeModalTimeoutRef.current);
          routeModalTimeoutRef.current = setTimeout(() => {
            setShowRouteModal(false);
          }, 8000);
        }
      })
      .catch(err => {
        console.error('Error fetching route:', err);
        showToast('Route mapping connection timed out.', 'error');
      });
  };

  const handleSOSPanic = () => {
    if (!confirm("🚨 CONFIRM SOS PANIC TRIGGER? This immediately broadcasts coordinates to the emergency team via secure channels.")) {
      return;
    }

    if (!navigator.geolocation) {
      showToast("Browser GPS telemetry unavailable. Please submit request manually.", 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      const newRequest = {
        id: requests.length + 1,
        requestId: `SOS-${Date.now().toString().slice(-4)}`,
        resourceType: "CRITICAL SOS",
        quantityRequested: 1,
        quantityAllocated: 0,
        quantityPending: 1,
        lat,
        lng,
        publisherLat: lat,
        publisherLng: lng,
        severity: 5,
        individualsAffected: 1,
        status: 'pending',
        priorityScore: 150.0,
        mlPriorityClass: 'critical',
        mlConfidence: 0.99,
        contactPerson: currentUser ? currentUser.fullName : "Anonymous Civilian",
        contactPhone: "GEO-LOCATED",
        description: "🚨 SECURE SOS SIGNAL: Panic alert dispatched from mobile client. Critical response required at location."
      };

      setRequests(prev => [newRequest, ...prev]);

      // Telegram Message Dispatcher (optional)
      const botToken = config.TELEGRAM_BOT_TOKEN || "";
      const chatID = config.TELEGRAM_CHAT_ID || "";
      const msg = `🚨 *CRITICAL SOS ALERT*\n\nUser: ${newRequest.contactPerson}\nLocation: https://www.google.com/maps?q=${lat},${lng}\nStatus: IMMEDIATE RESPONSE REQUIRED`;

      if (botToken && chatID && chatID !== "YOUR_TELEGRAM_CHAT_ID") {
        try {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatID,
              text: msg,
              parse_mode: 'Markdown'
            })
          });
        } catch (err) {
          console.error("Telegram API connection failed:", err);
        }
      }

      showToast("🚨 SOS EMERGENCY BROADCAST SUCCESSFUL! Operational units briefed. Stay in your current location if safe.", 'success');
    }, (error) => {
      showToast(`Location Telemetry Failed: ${error.message}`, 'error');
    });
  };

  const handleAllocateOpen = (request) => {
    setAllocateRequest(request);
    setAllocateQtyVal('');
    setShowAllocateModal(true);
  };

  const handleAllocateSubmit = (e) => {
    e.preventDefault();
    if (!allocateRequest) return;
    const qty = parseInt(allocateQtyVal);

    const resource = resources.find(r => r.type === allocateRequest.resourceType);
    if (!resource) {
      showToast("Error: Resource mapping node missing.", 'error');
      return;
    }

    if (qty > resource.availableQuantity) {
      showToast(`Insufficient supplies. Current stock: ${resource.availableQuantity}`, 'warning');
      return;
    }

    if (qty > allocateRequest.quantityPending) {
      showToast(`Allocation exceeds outstanding requests. Pending: ${allocateRequest.quantityPending}`, 'warning');
      return;
    }

    setResources(prev => prev.map(r => r.type === allocateRequest.resourceType ? { ...r, availableQuantity: r.availableQuantity - qty } : r));

    let updatedReq = null;
    setRequests(prev => prev.map(req => {
      if (req.id === allocateRequest.id) {
        const pending = req.quantityPending - qty;
        const allocated = (req.quantityAllocated || 0) + qty;
        const status = pending === 0 ? 'allocated' : 'partial';
        updatedReq = {
          ...req,
          quantityAllocated: allocated,
          quantityPending: pending,
          status
        };
        return updatedReq;
      }
      return req;
    }));

    // Update server DB persistently
    if (updatedReq) {
      fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReq)
      }).catch(err => console.error("Error saving allocation to server:", err));
    }

    setShowAllocateModal(false);
    setAllocateRequest(null);
    showToast('Logistics allocation logged successfully.', 'success');
  };

  const handleMarkResolved = (requestId) => {
    if (confirm("Verify request resolution and close incident file?")) {
      let updatedReq = null;
      setRequests(prev => prev.map(req => {
        if (req.id === requestId) {
          updatedReq = { ...req, status: 'resolved', resolvedAt: new Date().toISOString() };
          return updatedReq;
        }
        return req;
      }));

      // Update server DB persistently
      if (updatedReq) {
        fetch('/api/requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedReq)
        }).catch(err => console.error("Error resolving request on server:", err));
      }
    }
  };

  const handleDeleteRequest = (requestId) => {
    if (confirm("Permanently purge this resolved record from archives?")) {
      setRequests(prev => prev.filter(req => req.id !== requestId));
    }
  };

  const handleResourceOpen = (res = null) => {
    if (res) {
      setResourceModalData({
        id: res.id,
        name: res.name,
        type: res.type,
        totalQuantity: res.totalQuantity,
        availableQuantity: res.availableQuantity
      });
    } else {
      setResourceModalData({ id: '', name: '', type: '', totalQuantity: '', availableQuantity: '' });
    }
    setShowResourceModal(true);
  };

  const handleResourceSave = (e) => {
    e.preventDefault();
    const { id, name, type, totalQuantity, availableQuantity } = resourceModalData;
    const total = parseInt(totalQuantity);
    const avail = parseInt(availableQuantity);

    if (id) {
      setResources(prev => prev.map(r => r.id === id ? { ...r, name, type, totalQuantity: total, availableQuantity: avail } : r));
    } else {
      setResources(prev => [...prev, { id: prev.length + 1, name, type, totalQuantity: total, availableQuantity: avail }]);
    }
    setShowResourceModal(false);
  };

  // Helper cardinal weather converter
  const degToCardinal = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(((deg % 360) / 45)) % 8];
  };

  const getWeatherItems = (data) => {
    if (!data) return [];
    const windDirection = data.wind && data.wind.deg !== undefined
        ? `${degToCardinal(data.wind.deg)} (${data.wind.deg}° ${t.from_north})`
        : 'N/A';

    return [
      { label: t.city_name, value: data.name || 'N/A' },
      { label: t.weather_desc, value: data.weather && data.weather[0] ? data.weather[0].description : 'N/A' },
      { label: t.temp, value: data.main ? `${data.main.temp}°C` : 'N/A' },
      { label: t.feels_like, value: data.main ? `${data.main.feels_like}°C` : 'N/A' },
      { label: t.hum, value: data.main ? `${data.main.humidity}%` : 'N/A' },
      { label: t.pressure, value: data.main ? `${data.main.pressure} hPa` : 'N/A' },
      { label: t.windSpeed, value: data.wind ? `${data.wind.speed} m/s` : 'N/A' },
      { label: t.windDir, value: windDirection },
      { label: t.visibility, value: data.visibility !== undefined ? `${(data.visibility / 1000).toFixed(1)} km` : 'N/A' },
      { label: t.cloudiness, value: data.clouds ? `${data.clouds.all}%` : 'N/A' },
      { label: t.coordinates, value: data.coord ? `${data.coord.lat.toFixed(6)}, ${data.coord.lon.toFixed(6)}` : 'N/A' },
      { label: t.timezone, value: data.timezone !== undefined ? `GMT${data.timezone >= 0 ? '+' : ''}${data.timezone / 3600}` : 'N/A' },
    ];
  };


  // ML priority live display calculations
  const userPriorityResult = useMemo(() => {
    if (!userResourceType) return { priorityClass: 'low', mlConfidence: 0 };
    return calculateMLPriority(userResourceType, parseInt(userIndividuals) || 0, parseInt(userSeverity) || 0);
  }, [userResourceType, userIndividuals, userSeverity]);

  const adminPriorityResult = useMemo(() => {
    if (!adminResourceType) return { priorityClass: 'low', mlConfidence: 0 };
    return calculateMLPriority(adminResourceType, parseInt(adminIndividuals) || 0, parseInt(adminSeverity) || 0);
  }, [adminResourceType, adminIndividuals, adminSeverity]);

  // Return JSX
  return (
    <div>
      {/* 1. AUTHENTICATION COMPONENT */}
      {!currentUser && (
        <div id="authScreen" className="login-container">
          <div className="auth-wrapper">
            <div className={`auth-container ${showRegister ? 'show-register' : ''}`} id="authContainer">
              
              {/* Logo Side Panel */}
              <div className="logo-panel">
                <div className="logo-box">
                  <img src="/logo.png" alt="ResQ Link Logo" />
                  <h2>ResQ Link</h2>
                  <p>Disaster Response Management System</p>
                </div>
              </div>

              {/* Login Form Panel */}
              <div className="form-panel">
                {!showRegister ? (
                  <div className="login-card" id="loginFormCard">
                    <h1>Welcome Back</h1>
                    <p>Login to your account</p>
                    <form onSubmit={handleLoginSubmit}>
                      <div className="form-group">
                        <label htmlFor="username">{t.username}</label>
                        <input
                          type="text"
                          id="username"
                          className="form-control"
                          required
                          value={usernameInput}
                          onChange={(e) => setUsernameInput(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="password">{t.password}</label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="password"
                            id="password"
                            className="form-control"
                            required
                            style={{ paddingRight: '40px' }}
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        Login
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={fillDemoCredentials}
                        style={{ width: '100%', marginTop: '8px', fontSize: '13px', borderBottomWidth: '2px' }}
                      >
                        Use Demo Admin Credentials
                      </button>
                      {authError && <div className="error-message" style={{ display: 'block' }}>{authError}</div>}
                    </form>
                    <div className="auth-link">
                      <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(true); }}>
                        Don&apos;t have an account? Create one
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="login-card" id="registerFormCard">
                    <h1>Join ResQ Link</h1>
                    <p>{t.create_account_sub}</p>
                    <form onSubmit={handleRegisterSubmit}>
                      <div className="form-section-title">Account Security</div>
                      <div className="form-group">
                        <label htmlFor="regUsername">Username *</label>
                        <input
                          type="text"
                          id="regUsername"
                          className="form-control"
                          placeholder="Choose a unique username"
                          required
                          value={regUsername}
                          onChange={(e) => setRegUsername(e.target.value)}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="regPassword">Password *</label>
                          <input
                            type="password"
                            id="regPassword"
                            className="form-control"
                            placeholder="Min. 6 characters"
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="regConfirmPassword">Confirm *</label>
                          <input
                            type="password"
                            id="regConfirmPassword"
                            className="form-control"
                            placeholder="Re-type password"
                            required
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="form-section-title" style={{ marginTop: '5px' }}>Account Type</div>
                      <div className="role-toggle">
                        <label className={`role-btn ${regRole === 'User' ? 'active' : ''}`} onClick={() => setRegRole('User')}>
                          <input type="radio" name="regRole" value="User" checked={regRole === 'User'} readOnly />
                          <i className="fa-solid fa-user role-icon"></i>
                          <span>User</span>
                          <small>Standard functionality</small>
                        </label>
                        <label className={`role-btn ${regRole === 'Admin' ? 'active' : ''}`} onClick={() => setRegRole('Admin')}>
                          <input type="radio" name="regRole" value="Admin" checked={regRole === 'Admin'} readOnly />
                          <i className="fa-solid fa-user-gear role-icon"></i>
                          <span>Admin</span>
                          <small>System management</small>
                        </label>
                      </div>

                      {regError && <div className="error-message" style={{ display: 'block' }}>{regError}</div>}
                      
                      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        Create Account
                      </button>
                    </form>
                    <div className="auth-link">
                      <a href="#" onClick={(e) => { e.preventDefault(); setShowRegister(false); }}>
                        Already have an account? Login
                      </a>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 2. ADMIN DASHBOARD */}
      {currentUser && currentUser.role === 'Admin' && (
        <div id="adminDashboard" className="dashboard" style={{ display: 'block' }}>
          
          {/* Header Panel */}
          <div className="header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img src="/logo.png" alt="ResQ Link Logo" style={{ height: '80px', width: 'auto', borderRadius: '50%' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ margin: 0, fontSize: '48px', letterSpacing: '1px', lineHeight: '1.2' }}>{t.title}</h1>
                <span style={{ fontSize: '20px', opacity: 0.9, fontWeight: 'normal' }}>{t.base}</span>
              </div>
            </div>
            <div className="header-right">
              <button
                className="btn btn-secondary btn-small"
                id="tacticalToggleAdmin"
                onClick={() => setTacticalMode(prev => !prev)}
                style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: tacticalMode ? '#900' : '#333', color: tacticalMode ? '#fff' : '#00ff88', border: '1px solid #444' }}
              >
                <i className={tacticalMode ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                <span>{tacticalMode ? t.normal_mode : t.tactical_mode}</span>
              </button>
              <button
                className="btn btn-secondary btn-small"
                id="langToggleAdmin"
                onClick={() => setLang(prev => prev === 'en' ? 'kn' : 'en')}
                style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <i className="fas fa-language"></i>
                <span>{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
              </button>
              <div className="user-info">
                <span id="userRole" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{t.admin}</span>
              </div>
              <button className="btn btn-logout btn-small" onClick={handleLogout}>{t.logout}</button>
            </div>
          </div>

          <div className="container">
            
            {/* Top Stat Cards */}
            <div className="stats-grid" id="adminStatsGrid" style={{ display: 'grid', marginBottom: '24px' }}>
              <div className="stat-card">
                <div className="icon-container"><i className="fas fa-clipboard-list"></i></div>
                <div className="stat-content">
                  <h3>{t.total_req}</h3>
                  <div className="value">{requests.length}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="icon-container"><i className="fas fa-hourglass-half"></i></div>
                <div className="stat-content">
                  <h3>{t.active_req_short}</h3>
                  <div className="value">{requests.filter(r => r.status !== 'resolved').length}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="icon-container"><i className="fas fa-check-circle"></i></div>
                <div className="stat-content">
                  <h3>{t.resolved_req_short}</h3>
                  <div className="value">{requests.filter(r => r.status === 'resolved').length}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="icon-container"><i className="fas fa-exclamation-triangle"></i></div>
                <div className="stat-content">
                  <h3>{t.critical_priority}</h3>
                  <div className="value">{requests.filter(r => r.mlPriorityClass === 'critical' && r.status !== 'resolved').length}</div>
                </div>
              </div>
            </div>


            {/* Map Workstation Section */}
            <div className="section" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0 }}><i className="fas fa-map-location-dot"></i> {t.command_map}</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    className="btn btn-secondary btn-small" 
                    onClick={handleAutoFetchGPS}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '6px',
                      fontWeight: '600'
                    }}
                  >
                    <i className="fas fa-location-crosshairs"></i> Fetch GPS Location
                  </button>
                  <span className="status-badge status-pending">{t.live_deployment}</span>
                </div>
              </div>
              <div style={{ height: '500px', width: '100%', border: '1px solid #ddd', overflow: 'hidden', borderRadius: '12px' }}>
                <MapComponent
                  lat={currentBaseLocation.lat}
                  lng={currentBaseLocation.lng}
                  name={currentBaseLocation.name}
                  requests={requests}
                  volunteers={volunteers}
                  onMapClick={handleMapClick}
                  selectedLocation={selectedLocation}
                  routeCoordinates={routeCoordinates}
                  tacticalMode={tacticalMode}
                  deviceLat={deviceLat}
                  deviceLng={deviceLng}
                />
              </div>
            </div>

            {/* Admin Input Panel and Requests table layout */}
            <div className="main-workspace">
              {/* Left Column: Active Requests */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Active Requests */}
                <div className="section" id="activeRequestsSection" style={{ height: 'auto', display: 'block', margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2>{t.active_req}</h2>
                    <select id="riskSort" className="form-control" style={{ width: 'auto' }} value={riskSort} onChange={(e) => setRiskSort(e.target.value)}>
                      <option value="critical">{t.critical_first}</option>
                      <option value="low">{t.low_first}</option>
                    </select>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr><th>{t.type}</th><th>{t.qty_short}</th><th>{t.location}</th><th>{t.person}</th><th>{t.phone_short}</th><th>{t.priority}</th><th>{t.status}</th><th>{t.actions}</th></tr>
                      </thead>
                      <tbody id="activeRequestsTable">
                        {sortedRequests.active.map(req => (
                          <tr key={req.id || req.requestId}>
                            <td>{req.resourceType}</td>
                            <td>{req.quantityAllocated || 0}/{req.quantityRequested}</td>
                            <td style={{ fontSize: '13px', maxWidth: '150px' }}>{req.address || `Lat: ${req.lat.toFixed(4)}, Lng: ${req.lng.toFixed(4)}`}</td>
                            <td>{req.contactPerson || 'N/A'}</td>
                            <td className="contact-phone">{req.contactPhone || 'N/A'}</td>
                            <td><span className={`priority-badge priority-${req.mlPriorityClass}`}>{req.mlPriorityClass.toUpperCase()}</span></td>
                            <td><span className={`status-badge status-${req.status}`}>{req.status.toUpperCase()}</span></td>
                            <td>
                              <div className="btn-group">
                                <button className="btn btn-secondary btn-small" onClick={() => handleShowRoute(req)}>{t.route}</button>
                                <button className="btn btn-secondary btn-small" onClick={() => { setSelectedTriageRequest(req); showToast(`Selected ${req.requestId} for AI Triage`, 'info'); }} style={{ background: selectedTriageRequest?.id === req.id ? '#ccd6c8' : '' }}>
                                  <i className="fas fa-brain"></i> {lang === 'kn' ? 'ವಿಂಗಡಿಸು' : 'Triage'}
                                </button>
                                {req.status !== 'allocated' && <button className="btn btn-primary btn-small" onClick={() => handleAllocateOpen(req)}>{t.allocate}</button>}
                                {req.status === 'allocated' && <button className="btn btn-primary btn-small" onClick={() => handleMarkResolved(req.id)}>{t.resolve}</button>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Other Locations (Pending Verification) */}
                <div className="section" id="unverifiedRequestsSection" style={{ height: 'auto', display: 'block', margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2>Other Locations (Pending Verification)</h2>
                    <span className="status-badge status-partial" style={{ background: '#f97316', color: '#fff', border: 'none' }}>
                      {sortedRequests.otherLocations.length} Pending
                    </span>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>{t.type}</th>
                          <th>Distance</th>
                          <th>Sender Loc</th>
                          <th>{t.person}</th>
                          <th>{t.phone_short}</th>
                          <th>{t.priority}</th>
                          <th>{t.actions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRequests.otherLocations.length > 0 ? (
                          sortedRequests.otherLocations.map(req => {
                            const distance = getCoordinatesDistance(req.lat, req.lng, disasterCenter.lat, disasterCenter.lng).toFixed(2);
                            return (
                              <tr key={req.id || req.requestId}>
                                <td><strong>{req.resourceType}</strong></td>
                                <td><span style={{ color: '#f97316', fontWeight: 'bold' }}>{distance} km</span></td>
                                <td style={{ fontSize: '12px' }}>{`Lat: ${req.lat.toFixed(4)}, Lng: ${req.lng.toFixed(4)}`}</td>
                                <td>{req.contactPerson || 'N/A'}</td>
                                <td className="contact-phone">{req.contactPhone || 'N/A'}</td>
                                <td><span className={`priority-badge priority-${req.mlPriorityClass}`}>{req.mlPriorityClass.toUpperCase()}</span></td>
                                <td>
                                  <div className="btn-group">
                                    <button className="btn btn-secondary btn-small" onClick={() => handleShowRoute(req)}>{t.route}</button>
                                    <button 
                                      className="btn btn-primary btn-small" 
                                      onClick={() => handleOpenVerification(req)}
                                      style={{ background: '#f97316', borderColor: '#f97316', display: 'flex', alignItems: 'center', gap: '5px' }}
                                    >
                                      <i className="fas fa-phone-alt"></i> Verify
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: 'var(--color-text-secondary)' }}>
                              No requests pending verification from other locations.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Admin Tools (Submit Request, Boundary Config, Simulation) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Submit Emergency Request Form (Admin Side) */}
                <div className="form-section" style={{ height: 'auto', margin: 0, width: '100%' }}>
                  <h2>{t.submit_req_admin}</h2>
                  <div className="priority-display" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gridTemplateRows: 'auto auto', gap: '0px', alignItems: 'center' }}>
                    <h3>{t.ml_priority}</h3>
                    <div className="confidence">{t.confidence}: {adminPriorityResult.mlConfidence}%</div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                      <div className={`priority-badge priority-${adminPriorityResult.priorityClass}`}>{adminPriorityResult.priorityClass.toUpperCase()}</div>
                    </div>
                  </div>

                  <form onSubmit={handleAdminRequestSubmit}>
                    <div className="form-group">
                      <label style={{ fontSize: '16px' }}>{t.res_type}</label>
                      <select className="form-control" style={{ height: '50px', fontSize: '15px' }} required value={adminResourceType} onChange={(e) => setAdminResourceType(e.target.value)}>
                        <option value="">{t.select_resource}</option>
                        <option value="Medical Supplies">Medical Supplies</option>
                        <option value="Food & Water">Food &amp; Water</option>
                        <option value="Shelter">Shelter</option>
                        <option value="Rescue Team">Rescue Team</option>
                        <option value="Ambulance">Ambulance</option>
                        <option value="Bedding">Bedding</option>
                        <option value="Rescue Boats">Rescue Boats</option>
                        <option value="Heavy Machinery">Heavy Machinery</option>
                      </select>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{t.qty}</label>
                        <input type="number" className="form-control" required min="1" value={adminQuantity} onChange={(e) => setAdminQuantity(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>{t.severity}</label>
                        <select className="form-control" required value={adminSeverity} onChange={(e) => setAdminSeverity(e.target.value)}>
                          <option value="">Select Severity</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{t.affected}</label>
                      <input type="number" className="form-control" required min="1" value={adminIndividuals} onChange={(e) => setAdminIndividuals(e.target.value)} />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>{t.person}</label>
                        <input type="text" className="form-control" required value={adminContact} onChange={(e) => setAdminContact(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>{t.phone}</label>
                        <input type="text" className="form-control" required value={adminPhone} onChange={(e) => setAdminPhone(e.target.value)} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{t.desc}</label>
                      <textarea className="form-control" rows="3" required value={adminDescription} onChange={(e) => setAdminDescription(e.target.value)}></textarea>
                    </div>

                    <div style={{ fontSize: '13px', margin: '8px 0 12px', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fas fa-map-marker-alt" style={{ color: selectedLocation ? '#ef4444' : '#9ca3af' }}></i>
                        <span>
                          {selectedLocation 
                            ? `${t.pinned_target || 'Disaster Location'}: ${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}` 
                            : (t.map_pin_required || 'Disaster Target Location Required (Click Map)')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: deviceGpsStatus === 'active' ? '#10b981' : deviceGpsStatus === 'denied' ? '#ef4444' : '#f59e0b' }}>
                        <i className={`fas ${deviceGpsStatus === 'active' ? 'fa-satellite-dish' : deviceGpsStatus === 'denied' ? 'fa-ban' : 'fa-spinner fa-spin'}`}></i>
                        <span>
                          {deviceGpsStatus === 'active' 
                            ? `Device GPS (Publisher): ${deviceLat ? deviceLat.toFixed(5) : '?'}, ${deviceLng ? deviceLng.toFixed(5) : '?'}`
                            : deviceGpsStatus === 'denied' 
                            ? `Device GPS: Permission Denied / Off`
                            : `Device GPS: Requesting Permission...`}
                        </span>
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ height: '60px', fontSize: '18px', fontWeight: 'bold' }}>
                      {t.submit_btn}
                    </button>
                  </form>
                </div>

                {/* Disaster Boundary Configuration */}
                <div className="form-section" style={{ height: 'auto', margin: 0, width: '100%' }}>
                  <h2>Disaster Zone Boundary</h2>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '15px', lineHeight: '1.4' }}>
                    Define the active flood-affected zone. Coordinates outside this zone will go to "Other Locations" for phone verification.
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '13px' }}>Center Lat</label>
                      <input 
                        type="number" 
                        step="any" 
                        className="form-control" 
                        value={tempCenterLat} 
                        onChange={(e) => setTempCenterLat(e.target.value)} 
                        style={{ height: '40px' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '13px' }}>Center Lng</label>
                      <input 
                        type="number" 
                        step="any" 
                        className="form-control" 
                        value={tempCenterLng} 
                        onChange={(e) => setTempCenterLng(e.target.value)} 
                        style={{ height: '40px' }}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px' }}>Radius (km)</label>
                    <input 
                      type="number" 
                      step="any" 
                      className="form-control" 
                      value={tempRadius} 
                      onChange={(e) => setTempRadius(e.target.value)} 
                      style={{ height: '40px' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button" 
                      className="btn btn-primary" 
                      onClick={handleUpdateDisasterZone} 
                      style={{ flex: 1, padding: '10px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      Update Boundary
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={handleSetCenterFromBase} 
                      style={{ flex: 1, padding: '10px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      Use Base station
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider and Secondary Operational Feeds (Below the fold) */}
            <div style={{ borderTop: '2px dashed var(--color-border)', margin: '40px 0 24px', paddingTop: '24px' }}>
              <h2 style={{ fontSize: '20px', color: 'var(--color-primary)', marginBottom: '20px', fontWeight: '600' }}>
                <i className="fas fa-chart-line"></i> Operational Feeds & Telemetry
              </h2>
            </div>

            {/* Collapsible telemetry grids */}
            <div className="collapsible-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              
              {/* Sensor Card */}
              <div id="hardwareSection" className="weather-section" style={{ display: 'block' }}>
                <div className="weather-header" onClick={() => setIsHardwareExpanded(prev => !prev)}>
                  <h2><i className="fas fa-microchip"></i> {t.hw_title}</h2>
                  <i className="fas fa-chevron-down" style={{ transform: isHardwareExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}></i>
                </div>
                <div className={`weather-content ${isHardwareExpanded ? 'expanded' : ''}`}>
                  <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    <div className={`stat-card hw-card ${sensorData.temperature > 38.0 ? 'danger-alert-card' : ''}`} id="hwCardTemp"><div className="stat-content"><h3>{t.temp}</h3><div className="value">{sensorData.temperature}°C</div></div></div>
                    <div className={`stat-card hw-card ${sensorData.humidity > 85.0 ? 'danger-alert-card' : ''}`} id="hwCardHum"><div className="stat-content"><h3>{t.hum}</h3><div className="value">{sensorData.humidity}%</div></div></div>
                    <div className={`stat-card hw-card ${sensorData.seismic > 0.15 ? 'danger-alert-card' : ''}`} id="hwCardSeismic"><div className="stat-content"><h3>{t.seismic}</h3><div className="value">{sensorData.seismic} m/s²</div></div></div>
                    <div className={`stat-card hw-card ${sensorData.water_level > 180.0 ? 'danger-alert-card' : ''}`} id="hwCardWater"><div className="stat-content"><h3>{t.water}</h3><div className="value">{sensorData.water_level}</div></div></div>
                    <div className={`stat-card hw-card ${sensorData.soil_moisture > 3000 ? 'danger-alert-card' : ''}`} id="hwCardSoil"><div className="stat-content"><h3>{t.soil}</h3><div className="value">{sensorData.soil_moisture}</div></div></div>
                    <div className={`stat-card hw-card ${sensorData.rain_level > 50 ? 'danger-alert-card' : ''}`} id="hwCardRain"><div className="stat-content"><h3>{t.rain}</h3><div className="value">{sensorData.rain_level}</div></div></div>
                  </div>
                  <div style={{ padding: '0 15px 15px', fontSize: '10px', color: '#666', textAlign: 'right' }}>
                    {t.last_sync || 'Last Sync'}: {new Date(sensorData.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* Weather Card */}
              <div id="weatherSection" className="weather-section" style={{ display: 'block' }}>
                <div className="weather-header" onClick={() => setIsWeatherExpanded(prev => !prev)}>
                  <h2><i className="fas fa-cloud-sun"></i> {t.weather_forecast}</h2>
                  <i className="fas fa-chevron-down" style={{ transform: isWeatherExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}></i>
                </div>
                <div className={`weather-content ${isWeatherExpanded ? 'expanded' : ''}`}>
                  {weatherData ? (
                    <div className="weather-grid" style={{ padding: '15px' }}>
                      {getWeatherItems(weatherData).map((item, idx) => (
                        <div className="weather-item" key={idx}>
                          <label>{item.label}</label>
                          <div className="value">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>
                      {t.loading_weather}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Secondary Workspace for SMS, Volunteers, and AI Panel */}
            <div className="main-workspace" style={{ minHeight: 'auto', marginBottom: '24px', gridTemplateColumns: '2fr 1fr' }}>
              
              {/* Left Column: Live SMS Requests and Volunteers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* Live SMS Data from Google Sheets */}
                <div className="section" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2>Live SMS Requests (Google Sheets Sync)</h2>
                    {isSmsLoading && <span className="status-badge status-partial">Syncing...</span>}
                  </div>
                  {smsError ? (
                    <div className="alert alert-danger" style={{ color: '#d32f2f', padding: '10px', background: '#ffebee', borderRadius: '5px' }}>Error loading SMS data: {smsError}</div>
                  ) : (
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Quantity</th>
                            <th>Location</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {smsData.length > 0 ? smsData.map((row, idx) => (
                            <tr key={idx}>
                              <td>{row.Category || 'N/A'}</td>
                              <td>{row.Quantity || 'N/A'}</td>
                              <td>{row.Location || 'N/A'}</td>
                              <td style={{ whiteSpace: 'pre-wrap', maxWidth: '300px' }}>{row.Notes || 'N/A'}</td>
                            </tr>
                          )) : (
                            <tr><td colSpan="4" style={{ textAlign: 'center' }}>No live SMS requests found</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Volunteer Dispatch Grid */}
                <div className="section" id="volunteerManagementSection" style={{ margin: 0 }}>
                  <h2>{t.on_duty_vols}</h2>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr><th>{t.name}</th><th>{t.role}</th><th>{t.status}</th><th>{t.phone}</th><th>{t.actions}</th></tr>
                      </thead>
                      <tbody id="volunteerTable">
                        {volunteers.map(v => (
                          <tr key={v.id}>
                            <td><strong>{v.name}</strong></td>
                            <td>{v.role}</td>
                            <td><span className={`status-badge status-${v.status}`}>{v.status.toUpperCase()}</span></td>
                            <td>{v.phone}</td>
                            <td>
                              <button className="btn btn-primary btn-small" onClick={() => setDispatchingVolId(v.id)} disabled={v.status === 'busy'}>
                                {t.dispatch}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: AI Triage & Rescue Coordination Control Hub */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* 1. AI Incident Triage Panel */}
                <div className="section" style={{ margin: 0 }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-brain" style={{ color: '#2f442f' }}></i> Disaster AI Triage Center
                  </h2>
                  
                  {selectedTriageRequest ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                      <div style={{ background: 'var(--color-surface)', padding: '12px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
                          <span>ID: {selectedTriageRequest.requestId}</span>
                          <span className={`status-badge status-${selectedTriageRequest.status}`}>{selectedTriageRequest.status.toUpperCase()}</span>
                        </div>
                        <div style={{ fontSize: '13px', marginTop: '6px', color: 'var(--color-text)' }}>
                          <strong>Need:</strong> {selectedTriageRequest.resourceType} ({selectedTriageRequest.individualsAffected} affected)
                        </div>
                        <div style={{ fontSize: '12px', marginTop: '4px', fontStyle: 'italic', color: '#555' }}>
                          "{selectedTriageRequest.description}"
                        </div>
                      </div>

                      {/* AI Action Trigger */}
                      <button 
                        className="btn btn-primary" 
                        disabled={aiTriageLoading}
                        onClick={() => handleRunAITriage(selectedTriageRequest)}
                        style={{ padding: '10px', fontSize: '13px', fontWeight: 'bold' }}
                      >
                        {aiTriageLoading ? (
                          <span><i className="fas fa-spinner fa-spin"></i> Categorizing Distress...</span>
                        ) : (
                          <span><i className="fas fa-robot"></i> Analyze with Disaster AI</span>
                        )}
                      </button>

                      {/* AI Classification Output */}
                      {selectedTriageRequest.mlPriorityClass && (
                        <div style={{ background: '#f0f5f0', padding: '12px', borderRadius: '8px', border: '1px solid #b2cbb2', marginTop: '5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2d3b2e' }}>AI Urgency Class:</span>
                            <span className={`status-badge status-${selectedTriageRequest.mlPriorityClass}`} style={{ fontSize: '11px', fontWeight: '800' }}>
                              {selectedTriageRequest.mlPriorityClass.toUpperCase()}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#2d3b2e' }}>AI Confidence Score:</span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#22c55e' }}>
                              {((selectedTriageRequest.mlConfidence || 0.85) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#333', borderTop: '1px solid #ccd6c8', paddingTop: '8px', lineHeight: '1.4' }}>
                            <strong>AI Action Directive:</strong> {selectedTriageRequest.triageSummary || "No summary generated."}
                          </div>
                          
                          {/* Save Triage to Database */}
                          <button 
                            className="btn btn-secondary btn-small"
                            onClick={() => handleSaveAITriage(selectedTriageRequest)}
                            style={{ width: '100%', marginTop: '10px', padding: '6px', fontSize: '11px', fontWeight: 'bold' }}
                          >
                            <i className="fas fa-save"></i> Commit Triage to Server
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: '#666', fontSize: '13px' }}>
                      <i className="fas fa-info-circle" style={{ fontSize: '20px', display: 'block', marginBottom: '8px', color: 'var(--color-sage)' }}></i>
                      Select an incident request from the map or lists to run AI Triage and Matchmaking.
                    </div>
                  )}
                </div>

                {/* 2. Smart Proximity Rescuer Matchmaking */}
                {selectedTriageRequest && (
                  <div className="section" style={{ margin: 0 }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <i className="fas fa-map-marked-alt" style={{ color: '#2f442f' }}></i> Smart Rescuer Matchmaking
                    </h2>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        Active rescuers ranked by distance to <strong>{selectedTriageRequest.requestId}</strong>:
                      </div>

                      {/* Proximity calculation and mapping list */}
                      {(() => {
                        const rankedVolunteers = volunteers.map(vol => {
                          const dist = getCoordinatesDistance(vol.lat, vol.lng, selectedTriageRequest.lat, selectedTriageRequest.lng);
                          // Match check
                          const isSkillMatch = (
                            (selectedTriageRequest.resourceType === 'Medical' && vol.role === 'Medical Responder') ||
                            (selectedTriageRequest.resourceType === 'Rescue Team' && vol.role === 'Rescue Team Lead') ||
                            (selectedTriageRequest.resourceType === 'Food & Water' && vol.role === 'Logistics Coordinator') ||
                            (selectedTriageRequest.resourceType === 'Shelter' && vol.role === 'Shelter Manager') ||
                            (selectedTriageRequest.resourceType === 'Ambulance' && vol.role === 'Ambulance Operator')
                          );
                          return { ...vol, distance: dist, isSkillMatch };
                        });

                        // Sort by distance
                        rankedVolunteers.sort((a, b) => a.distance - b.distance);

                        return rankedVolunteers.map(vol => (
                          <div 
                            key={vol.id} 
                            style={{ 
                              padding: '10px', 
                              borderRadius: '8px', 
                              border: vol.isSkillMatch ? '2px solid #3a6841' : '1px solid var(--color-border)',
                              background: vol.status === 'busy' ? '#f4f4f4' : (vol.isSkillMatch ? '#f0f5f0' : 'var(--color-surface)'),
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '13px' }}>
                                {vol.name} {vol.isSkillMatch && <span style={{ color: '#3a6841', fontSize: '11px', fontWeight: 'bold' }}>⭐ Match</span>}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#666' }}>{vol.distance.toFixed(2)} km</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#555' }}>
                              <span>Role: {vol.role}</span>
                              <span className={`status-badge status-${vol.status}`} style={{ fontSize: '9px' }}>{vol.status}</span>
                            </div>
                            
                            {vol.status !== 'busy' && (
                              <button 
                                className="btn btn-primary btn-small"
                                onClick={() => handleDispatchVolunteer(vol.id, selectedTriageRequest.id)}
                                style={{ width: '100%', marginTop: '4px', fontSize: '11px', padding: '4px', fontWeight: 'bold' }}
                              >
                                <i className="fas fa-paper-plane"></i> Dispatch Rescuer
                              </button>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* 3. Emergency Broadcast Center */}
                <div className="section" style={{ margin: 0 }}>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-bullhorn" style={{ color: '#2f442f' }}></i> HQ Emergency Broadcasts
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
                    <textarea 
                      className="form-control"
                      placeholder="Enter emergency warning to broadcast via GSM SMS Gateway..."
                      value={newBroadcastMsg}
                      onChange={(e) => setNewBroadcastMsg(e.target.value)}
                      style={{ width: '100%', minHeight: '60px', padding: '10px', fontSize: '12.5px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                    />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select 
                        className="form-control"
                        value={broadcastZone}
                        onChange={(e) => setBroadcastZone(e.target.value)}
                        style={{ padding: '6px', fontSize: '11.5px' }}
                      >
                        <option value="All Sectors">All Sectors</option>
                        <option value="Sector A">Sector A</option>
                        <option value="Sector B">Sector B</option>
                        <option value="Sector C">Sector C</option>
                        <option value="Sector D">Sector D</option>
                      </select>
                      
                      <select 
                        className="form-control"
                        value={broadcastSeverity}
                        onChange={(e) => setBroadcastSeverity(e.target.value)}
                        style={{ padding: '6px', fontSize: '11.5px' }}
                      >
                        <option value="info">Info Alert</option>
                        <option value="warning">High Warning</option>
                        <option value="critical">Critical Alarm</option>
                      </select>
                    </div>

                    <button 
                      className="btn btn-primary"
                      onClick={handleSendEmergencyBroadcast}
                      style={{ padding: '8px', fontSize: '13px', fontWeight: 'bold' }}
                    >
                      <i className="fas fa-sms"></i> Broadcast via SMS Gateway
                    </button>

                    {/* Broadcast history list */}
                    {broadcasts.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #ccd6c8', paddingTop: '10px', marginTop: '5px' }}>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2d3b2e' }}>Recent Warnings:</div>
                        {broadcasts.map(bc => (
                          <div 
                            key={bc.id} 
                            style={{ 
                              padding: '8px', 
                              borderRadius: '6px', 
                              background: bc.severity === 'critical' ? '#ffebeb' : (bc.severity === 'warning' ? '#fff4e5' : '#f0f5f0'),
                              borderLeft: `4px solid ${bc.severity === 'critical' ? '#ef4444' : (bc.severity === 'warning' ? '#f59e0b' : '#3a6841')}`,
                              fontSize: '11.5px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '4px' }}>
                              <span>Zone: {bc.targetZone}</span>
                              <span style={{ fontSize: '10px', color: '#666' }}>{new Date(bc.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <div style={{ color: '#222' }}>{bc.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>


            </div>

            {/* Inventory Exhaustion Forecast and analytics */}
            <div className="section" id="analyticsSection" style={{ display: 'block' }}>
              <h2>{t.sys_analytics}</h2>
              <div className="ai-demand-section" style={{ marginBottom: '20px' }}>
                <div className="ai-demand-header">
                  <h3><i className="fas fa-hourglass-half"></i> {t.exhaustion_forecast}</h3>
                </div>
                <div className="ai-demand-grid" id="forecastingGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                  {forecasts.map(f => (
                    <div className={`ai-demand-card forecast-${f.riskStatus}`} key={f.id} style={{
                      padding: '15px',
                      borderRadius: '12px',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderLeft: `5px solid ${f.riskStatus === 'critical' ? '#ff4444' : (f.riskStatus === 'high' ? '#ff8800' : '#22c55e')}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '120px'
                    }}>
                      <div style={{ fontWeight: '700', marginBottom: '5px' }}><i className="fas fa-hourglass-half"></i> {f.name}</div>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--color-primary)' }}>{f.availableQuantity} <span style={{ fontSize: '14px' }}>{t.units}</span></div>
                      <div style={{ fontSize: '12px', marginTop: '5px' }}>
                        {t.burn_rate}: ~{f.hourlyRate} {t.units_hr}<br />
                        <span className={`status-badge status-${f.riskStatus}`}>{f.riskStatus.toUpperCase()} {t.risk}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="analytics-grid">
                <div className="analytics-card"><h3>{t.avg_priority}</h3><div className="value" id="avgPriority">{avgPriority}</div></div>
                <div className="analytics-card"><h3>{t.people_helped}</h3><div className="value" id="totalIndividuals">{peopleHelped}</div></div>
                <div className="analytics-card"><h3>{t.utilization}</h3><div className="value" id="resourceUtilization">{resourceUtilization}%</div></div>
                <div className="analytics-card"><h3>{t.avg_response_time}</h3><div className="value" id="avgResponseTime">N/A</div></div>
              </div>
            </div>

            {/* Resolved requests */}
            <div className="section" id="resolvedRequestsSection" style={{ opacity: 0.8, display: 'block' }}>
              <h2>{t.resolved_history}</h2>
              <div className="table-container">
                <table style={{ fontSize: '13px' }}>
                  <thead>
                    <tr><th>{t.id}</th><th>{t.type}</th><th>{t.location}</th><th>{t.person}</th><th>{t.phone_short}</th><th>{t.desc}</th><th>{t.priority}</th><th>{t.resolved_at}</th><th>{t.actions}</th></tr>
                  </thead>
                  <tbody>
                    {sortedRequests.resolved.map(req => (
                      <tr key={req.id || req.requestId}>
                        <td><strong>{req.requestId}</strong></td>
                        <td>{req.resourceType}</td>
                        <td style={{ fontSize: '12px', maxWidth: '150px' }}>{req.address || `Lat: ${req.lat.toFixed(4)}, Lng: ${req.lng.toFixed(4)}`}</td>
                        <td>{req.contactPerson || 'N/A'}</td>
                        <td>{req.contactPhone || 'N/A'}</td>
                        <td style={{ fontSize: '12px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.description}>
                          {req.description}
                        </td>
                        <td><span className={`priority-badge priority-${req.mlPriorityClass}`}>{req.mlPriorityClass.toUpperCase()}</span></td>
                        <td>{new Date(req.resolvedAt).toLocaleString()}</td>
                        <td>
                          <div className="btn-group">
                            <button className="btn btn-secondary btn-small" onClick={() => handleDeleteRequest(req.id)}>{t.purge}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 3. USER DASHBOARD */}
      {currentUser && currentUser.role === 'User' && (
        <div id="userDashboard" className="dashboard" style={{ display: 'block' }}>
          
          {/* Header */}
          <div className="header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <img src="/logo.png" alt="ResQ Link Logo" style={{ height: '80px', width: 'auto', borderRadius: '50%' }} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <h1 style={{ margin: 0, fontSize: '48px', letterSpacing: '1px', lineHeight: '1.2' }}>{t.title}</h1>
                <span style={{ fontSize: '20px', opacity: 0.9, fontWeight: 'normal' }}>{t.base}</span>
              </div>
            </div>
            <div className="header-right">
              <button
                className="btn btn-secondary btn-small"
                id="tacticalToggleUser"
                onClick={() => setTacticalMode(prev => !prev)}
                style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: tacticalMode ? '#900' : '#333', color: tacticalMode ? '#fff' : '#ff0000', border: '1px solid #444' }}
              >
                <i className={tacticalMode ? "fas fa-eye-slash" : "fas fa-eye"}></i>
                <span>{tacticalMode ? 'Normal Mode' : 'Tactical Mode'}</span>
              </button>
              <button
                className="btn btn-secondary btn-small"
                id="langToggleUser"
                onClick={() => setLang(prev => prev === 'en' ? 'kn' : 'en')}
                style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <i className="fas fa-language"></i>
                <span>{lang === 'en' ? 'ಕನ್ನಡ' : 'English'}</span>
              </button>
              <button
                className="btn btn-secondary btn-small"
                id="mobileViewToggle"
                onClick={() => setMobileView(prev => !prev)}
                style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <i className={mobileView ? "fas fa-desktop" : "fas fa-mobile-alt"}></i>
              </button>
              <div className="user-info">
                <span id="userDashboardRole">{currentUser.fullName}</span>
              </div>
              <button className="btn btn-logout btn-small" onClick={handleLogout}>{t.logout}</button>
            </div>
          </div>

          <div className="container">
            <div className="main-workspace" style={{ marginBottom: '24px' }}>
              
              {/* User map coordinate picker */}
              <div className="map-section">
                <h2><i className="fas fa-map-marked-alt"></i> {t.location_map}</h2>
                <div style={{ height: '500px', width: '100%', border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden' }}>
                  <MapComponent
                    lat={currentBaseLocation.lat}
                    lng={currentBaseLocation.lng}
                    name={currentBaseLocation.name}
                    requests={requests}
                    volunteers={volunteers}
                    onMapClick={handleMapClick}
                    selectedLocation={selectedLocation}
                    routeCoordinates={routeCoordinates}
                    tacticalMode={tacticalMode}
                    deviceLat={deviceLat}
                    deviceLng={deviceLng}
                  />
                </div>
              </div>

              {/* User input emergency trigger panel */}
              <div className="form-section">
                
                {/* Panic SOS Button */}
                <div className="sos-container">
                  <button className="btn-sos" onClick={handleSOSPanic}>
                    <i className="fas fa-hand-holding-medical"></i>
                    <span>{t.sos_btn}</span>
                  </button>
                  <div className="sos-label">{t.sos_label}</div>
                  <div className="sos-hint">{t.sos_hint}</div>
                </div>

                <h2>{t.submit_req}</h2>
                
                {/* Dynamic ML Score Box */}
                <div className="priority-display" id="userPriorityDisplay" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gridTemplateRows: 'auto auto', gap: '0px', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>Real-time ML Priority</h3>
                  <div className="confidence" id="userPriorityConfidence">{t.confidence}: {userPriorityResult.mlConfidence}%</div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                    <div className={`priority-badge priority-${userPriorityResult.priorityClass}`} id="userPriorityBadge">
                      {userPriorityResult.priorityClass.toUpperCase()}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleUserRequestSubmit}>
                  <div className="form-group">
                    <label htmlFor="userResourceType" style={{ fontSize: '16px' }}>{t.res_type}</label>
                    <select id="userResourceType" className="form-control" required style={{ height: '50px', fontSize: '15px' }} value={userResourceType} onChange={(e) => setUserResourceType(e.target.value)}>
                      <option value="">Select Resource</option>
                      <option value="Medical Supplies">Medical Supplies</option>
                      <option value="Food & Water">Food &amp; Water</option>
                      <option value="Shelter">Shelter</option>
                      <option value="Rescue Team">Rescue Team</option>
                      <option value="Ambulance">Ambulance</option>
                      <option value="Bedding">Bedding</option>
                      <option value="Rescue Boats">Rescue Boats</option>
                      <option value="Heavy Machinery">Heavy Machinery</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="userQuantity">{t.qty}</label>
                      <input type="number" id="userQuantity" className="form-control" required min="1" value={userQuantity} onChange={(e) => setUserQuantity(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label htmlFor="userSeverity">{t.severity}</label>
                      <select id="userSeverity" className="form-control" required value={userSeverity} onChange={(e) => setUserSeverity(e.target.value)}>
                        <option value="">Select Severity</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="userIndividualsAffected">{t.affected}</label>
                    <input type="number" id="userIndividualsAffected" className="form-control" required min="1" value={userIndividuals} onChange={(e) => setUserIndividuals(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label htmlFor="userDescription">{t.desc}</label>
                    <textarea id="userDescription" className="form-control" rows="3" required value={userDescription} onChange={(e) => setUserDescription(e.target.value)}></textarea>
                  </div>

                    <div style={{ fontSize: '13px', margin: '8px 0 12px', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <i className="fas fa-map-marker-alt" style={{ color: selectedLocation ? '#ef4444' : '#9ca3af' }}></i>
                        <span>
                          {selectedLocation 
                            ? `${t.coords_locked || 'Disaster Location'}: ${selectedLocation.lat.toFixed(5)}, ${selectedLocation.lng.toFixed(5)}` 
                            : (t.pin_target_required || 'Disaster Target Location Required (Click Map)')}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: deviceGpsStatus === 'active' ? '#10b981' : deviceGpsStatus === 'denied' ? '#ef4444' : '#f59e0b' }}>
                        <i className={`fas ${deviceGpsStatus === 'active' ? 'fa-satellite-dish' : deviceGpsStatus === 'denied' ? 'fa-ban' : 'fa-spinner fa-spin'}`}></i>
                        <span>
                          {deviceGpsStatus === 'active' 
                            ? `Device GPS (Publisher): ${deviceLat ? deviceLat.toFixed(5) : '?'}, ${deviceLng ? deviceLng.toFixed(5) : '?'}`
                            : deviceGpsStatus === 'denied' 
                            ? `Device GPS: Permission Denied / Off`
                            : `Device GPS: Requesting Permission...`}
                        </span>
                      </div>
                    </div>

                  <button type="submit" className="btn btn-primary" style={{ height: '60px', fontSize: '18px', fontWeight: 'bold' }}>
                    {t.submit_btn}
                  </button>
                </form>

              </div>
            </div>

            {/* Weather / Sensors / Volunteers Accordions */}
            <div className="sections-grid" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Weather info */}
              <div className="weather-section" id="userWeatherSection">
                <div className="weather-header" onClick={() => setIsWeatherExpanded(prev => !prev)}>
                  <h2><i className="fas fa-cloud-sun"></i> {t.local_weather}</h2>
                  <i className="fas fa-chevron-down" style={{ transform: isWeatherExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}></i>
                </div>
                <div className={`weather-content ${isWeatherExpanded ? 'expanded' : ''}`}>
                  {weatherData ? (
                    <div className="weather-grid" style={{ padding: '15px' }}>
                      {getWeatherItems(weatherData).map((item, idx) => (
                        <div className="weather-item" key={idx}>
                          <label>{item.label}</label>
                          <div className="value">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '15px', color: '#666' }}>{t.weather_syncing}</div>
                  )}
                </div>
              </div>

              {/* Hardware Sensors */}
              <div className="weather-section" id="userHardwareSection">
                <div className="weather-header" onClick={() => setIsHardwareExpanded(prev => !prev)}>
                  <h2><i className="fas fa-microchip"></i> {t.live_sensor_data}</h2>
                  <i className="fas fa-chevron-down" style={{ transform: isHardwareExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}></i>
                </div>
                <div className={`weather-content ${isHardwareExpanded ? 'expanded' : ''}`}>
                  <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
                    <div className="hw-item" style={{ padding: '10px', background: sensorData.temperature > 38.0 ? '#fee2e2' : '#fff', color: sensorData.temperature > 38.0 ? '#991b1b' : 'inherit', border: sensorData.temperature > 38.0 ? '1px solid #ef4444' : 'none', borderRadius: '8px' }}>
                      <label style={{ fontSize: '11px' }}>{t.temp}</label>
                      <div style={{ fontWeight: 'bold' }}>{sensorData.temperature}°C</div>
                    </div>
                    <div className="hw-item" style={{ padding: '10px', background: sensorData.humidity > 85.0 ? '#fee2e2' : '#fff', color: sensorData.humidity > 85.0 ? '#991b1b' : 'inherit', border: sensorData.humidity > 85.0 ? '1px solid #ef4444' : 'none', borderRadius: '8px' }}>
                      <label style={{ fontSize: '11px' }}>{t.hum}</label>
                      <div style={{ fontWeight: 'bold' }}>{sensorData.humidity}%</div>
                    </div>
                    <div className="hw-item" style={{ padding: '10px', background: sensorData.seismic > 0.15 ? '#fee2e2' : '#fff', color: sensorData.seismic > 0.15 ? '#991b1b' : 'inherit', border: sensorData.seismic > 0.15 ? '1px solid #ef4444' : 'none', borderRadius: '8px' }}>
                      <label style={{ fontSize: '11px' }}>{t.seismic}</label>
                      <div style={{ fontWeight: 'bold' }}>{sensorData.seismic} m/s²</div>
                    </div>
                    <div className="hw-item" style={{ padding: '10px', background: sensorData.water_level > 180.0 ? '#fee2e2' : '#fff', color: sensorData.water_level > 180.0 ? '#991b1b' : 'inherit', border: sensorData.water_level > 180.0 ? '1px solid #ef4444' : 'none', borderRadius: '8px' }}>
                      <label style={{ fontSize: '11px' }}>{t.water}</label>
                      <div style={{ fontWeight: 'bold' }}>{sensorData.water_level}</div>
                    </div>
                    <div className="hw-item" style={{ padding: '10px', background: sensorData.soil_moisture > 3000 ? '#fee2e2' : '#fff', color: sensorData.soil_moisture > 3000 ? '#991b1b' : 'inherit', border: sensorData.soil_moisture > 3000 ? '1px solid #ef4444' : 'none', borderRadius: '8px' }}>
                      <label style={{ fontSize: '11px' }}>{t.soil}</label>
                      <div style={{ fontWeight: 'bold' }}>{sensorData.soil_moisture}</div>
                    </div>
                    <div className="hw-item" style={{ padding: '10px', background: sensorData.rain_level > 50 ? '#fee2e2' : '#fff', color: sensorData.rain_level > 50 ? '#991b1b' : 'inherit', border: sensorData.rain_level > 50 ? '1px solid #ef4444' : 'none', borderRadius: '8px' }}>
                      <label style={{ fontSize: '11px' }}>{t.rain}</label>
                      <div style={{ fontWeight: 'bold' }}>{sensorData.rain_level}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Volunteer Register */}
              <div className="weather-section" id="volunteerSection">
                <div className="weather-header" onClick={() => setIsVolunteerFormExpanded(prev => !prev)}>
                  <h2><i className="fas fa-user-plus"></i> {t.join_vol}</h2>
                  <i className="fas fa-chevron-down" style={{ transform: isVolunteerFormExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}></i>
                </div>
                <div className={`weather-content ${isVolunteerFormExpanded ? 'expanded' : ''}`}>
                  <div style={{ padding: '20px' }}>
                    <form onSubmit={handleVolunteerRegister}>
                      <div className="form-row">
                        <div className="form-group">
                          <label>{t.name}</label>
                          <input type="text" className="form-control" required value={volName} onChange={(e) => setVolName(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label>{t.expertise}</label>
                          <select className="form-control" required value={volRole} onChange={(e) => setVolRole(e.target.value)}>
                            <option value="Medical">Medical / First Aid</option>
                            <option value="Rescue">Rescue / Search</option>
                            <option value="Driver">Driver / Logistics</option>
                            <option value="General">General Assistance</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>{t.phone}</label>
                        <input type="tel" className="form-control" required value={volPhone} onChange={(e) => setVolPhone(e.target.value)} />
                      </div>
                      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>{t.reg_vol}</button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Supplies List */}
              <div className="weather-section" id="userResourcesSection">
                <div className="weather-header" onClick={() => setIsUserResourcesExpanded(prev => !prev)}>
                  <h2><i className="fas fa-boxes"></i> {t.avail_supplies}</h2>
                  <i className="fas fa-chevron-down" style={{ transform: isUserResourcesExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}></i>
                </div>
                <div className={`weather-content ${isUserResourcesExpanded ? 'expanded' : ''}`}>
                  <div style={{ padding: '20px' }}>
                    <div className="resources-grid">
                      {resources.map(res => {
                        const pct = ((res.availableQuantity / res.totalQuantity) * 100).toFixed(0);
                        return (
                          <div className="resource-card" key={res.id}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px' }}>
                              <span>{res.name}</span>
                              <span style={{ color: 'var(--color-primary)' }}>{res.availableQuantity}/{res.totalQuantity}</span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress" style={{ width: `${pct}%`, background: pct < 20 ? '#ef4444' : (pct < 50 ? '#f97316' : '#10b981') }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 4. MODALS & DIALOGS */}
      {/* Alert Verification Modal */}
      {showVerificationModal && verificationRequest && (
        <div id="verificationModal" className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>📞 Alert Verification</h2>
              <button className="btn-close" onClick={() => { setShowVerificationModal(false); setVerificationRequest(null); }}>&times;</button>
            </div>
            
            <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Sender Contact & Original Alert Info
              </h3>
              <div className="info-item"><span className="info-label">Request ID:</span><span className="info-value">{verificationRequest.requestId}</span></div>
              <div className="info-item"><span className="info-label">Sender Name:</span><span className="info-value">{verificationRequest.contactPerson}</span></div>
              <div className="info-item">
                <span className="info-label">Contact Phone:</span>
                <span className="info-value" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                  <a href={`tel:${verificationRequest.contactPhone}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    <i className="fas fa-phone-alt"></i> {verificationRequest.contactPhone}
                  </a>
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Sender Location:</span>
                <span className="info-value">{`Lat: ${verificationRequest.lat.toFixed(5)}, Lng: ${verificationRequest.lng.toFixed(5)}`}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Distance to Disaster:</span>
                <span className="info-value" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                  {getCoordinatesDistance(verificationRequest.lat, verificationRequest.lng, disasterCenter.lat, disasterCenter.lng).toFixed(2)} km
                </span>
              </div>
              <div className="info-item" style={{ borderBottom: 'none' }}><span className="info-label">Original Description:</span></div>
              <p className="description-text" style={{ marginTop: '8px' }}>{verificationRequest.description}</p>
            </div>

            <form onSubmit={handleVerificationSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', fontSize: '15px' }}>Verification Outcome</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="verificationType" 
                      value="help_other" 
                      checked={verificationType === 'help_other'}
                      onChange={() => setVerificationType('help_other')}
                    />
                    <span>Reporting for someone else inside Disaster Zone (Valid)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="verificationType" 
                      value="fake" 
                      checked={verificationType === 'fake'}
                      onChange={() => setVerificationType('fake')}
                    />
                    <span style={{ color: '#ef4444' }}>Fake Alarm / Incorrect Alert</span>
                  </label>
                </div>
              </div>

              {verificationType === 'help_other' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '20px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#2563eb' }}>Provide Stuck Person's Details (Verification Proof)</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '12px' }}>Stuck Person Lat</label>
                      <input 
                        type="number" 
                        step="any" 
                        required 
                        className="form-control" 
                        placeholder="e.g. 12.5218"
                        value={proofLat} 
                        onChange={(e) => setProofLat(e.target.value)}
                        style={{ height: '40px' }}
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label style={{ fontSize: '12px' }}>Stuck Person Lng</label>
                      <input 
                        type="number" 
                        step="any" 
                        required 
                        className="form-control" 
                        placeholder="e.g. 76.9251"
                        value={proofLng} 
                        onChange={(e) => setProofLng(e.target.value)}
                        style={{ height: '40px' }}
                      />
                    </div>
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label style={{ fontSize: '12px' }}>Stuck Person Address / Landmark</label>
                    <input 
                      type="text" 
                      required 
                      className="form-control" 
                      placeholder="e.g. Near Mandya Bus Stand, Mandya"
                      value={proofAddress} 
                      onChange={(e) => setProofAddress(e.target.value)}
                      style={{ height: '40px' }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '5px' }}>
                    <button 
                      type="button" 
                      className="btn btn-secondary btn-small"
                      onClick={() => {
                        setProofLat(disasterCenter.lat.toString());
                        setProofLng(disasterCenter.lng.toString());
                        setProofAddress("Sector C, Mandya (Disaster Zone Center)");
                        showToast("Quick filled with active disaster center coordinates.", "info");
                      }}
                      style={{ fontSize: '11px', padding: '6px 10px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      Use disaster Center Coords
                    </button>
                  </div>
                </div>
              )}

              {verificationType === 'fake' && (
                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', marginBottom: '20px', fontSize: '13px', lineHeight: '1.4' }}>
                  <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px' }}></i> This request will be marked as fake and resolved. It will be removed from both active and pending tables.
                </div>
              )}

              <div className="modal-footer" style={{ borderTop: '1px solid var(--color-border)', paddingTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowVerificationModal(false); setVerificationRequest(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ background: verificationType === 'fake' ? '#ef4444' : '#2563eb', borderColor: verificationType === 'fake' ? '#ef4444' : '#2563eb' }}>
                  {verificationType === 'fake' ? 'Archive as Fake' : 'Verify & Relocate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Supplies Modal */}
      {showAllocateModal && allocateRequest && (
        <div id="allocateModal" className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{t.allocate_resources}</h2>
              <button className="btn-close" onClick={() => { setShowAllocateModal(false); setAllocateRequest(null); }}>&times;</button>
            </div>
            <div style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Request Details
              </h3>
              <div className="info-item"><span className="info-label">Request ID:</span><span className="info-value">{allocateRequest.requestId}</span></div>
              <div className="info-item"><span className="info-label">Resource Type:</span><span className="info-value">{allocateRequest.resourceType}</span></div>
              <div className="info-item"><span className="info-label">Quantity Requested:</span><span className="info-value">{allocateRequest.quantityRequested}</span></div>
              <div className="info-item"><span className="info-label">Contact Person:</span><span className="info-value">{allocateRequest.contactPerson}</span></div>
              <div className="info-item"><span className="info-label">Contact Phone:</span><span className="info-value" style={{ color: '#2563eb' }}>{allocateRequest.contactPhone}</span></div>
              <div className="info-item"><span className="info-label">Location:</span><span className="info-value">{`Lat: ${allocateRequest.lat.toFixed(5)}, Lng: ${allocateRequest.lng.toFixed(5)}`}</span></div>
              <div className="info-item"><span className="info-label">Individuals Affected:</span><span className="info-value">{allocateRequest.individualsAffected}</span></div>
              <div className="info-item"><span className="info-label">Severity:</span><span className="info-value">{allocateRequest.severity}</span></div>
              <div className="info-item"><span className="info-label">Priority:</span><span className="info-value">{allocateRequest.mlPriorityClass.toUpperCase()}</span></div>
              <div className="info-item" style={{ borderBottom: 'none' }}><span className="info-label">Description:</span></div>
              <p className="description-text" style={{ marginTop: '8px' }}>{allocateRequest.description || 'N/A'}</p>
            </div>
            <form onSubmit={handleAllocateSubmit}>
              <div className="form-group">
                <label>{t.qty_to_allocate}</label>
                <input
                  type="number"
                  className="form-control"
                  required
                  min="1"
                  max={allocateRequest.quantityPending}
                  value={allocateQtyVal}
                  onChange={(e) => setAllocateQtyVal(e.target.value)}
                />
              </div>
              <div className="btn-group">
                <button type="submit" className="btn btn-primary">Allocate</button>
                <button type="button" className="btn btn-secondary" onClick={() => { setShowAllocateModal(false); setAllocateRequest(null); }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OSRM Route Info Modal */}
      {showRouteModal && routeData && (
        <div id="routeModal" className="modal" style={{ display: 'flex' }}>
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>Route Information</h2>
              <button className="btn-close" onClick={() => setShowRouteModal(false)}>&times;</button>
            </div>
            <div className="route-info-grid">
              <div className="info-section">
                <h3>Route Details</h3>
                <div className="info-item"><span className="info-label">Distance:</span><span className="info-value">{routeData.distance} km</span></div>
                <div className="info-item"><span className="info-label">Estimated Time:</span><span className="info-value">{routeData.duration} minutes</span></div>
              </div>
              <div className="info-section">
                <h3>Emergency Details</h3>
                <div className="info-item"><span className="info-label">Location:</span><span className="info-value">{routeData.location}</span></div>
                <div className="info-item"><span className="info-label">Contact Person:</span><span className="info-value">{routeData.contactPerson}</span></div>
                <div className="info-item"><span className="info-label">Contact Phone:</span><span className="info-value" style={{ color: '#2563eb' }}>{routeData.contactPhone}</span></div>
                <div className="info-item"><span className="info-label">Individuals Affected:</span><span className="info-value">{routeData.individualsAffected}</span></div>
                <div className="info-item"><span className="info-label">Severity Level:</span><span className="info-value">{routeData.severity}</span></div>
              </div>
              <div className="info-section full-width">
                <h3>Description</h3>
                <p className="description-text">{routeData.description || 'N/A'}</p>
              </div>
            </div>
            <div className="btn-group" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, height: '50px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onClick={() => {
                  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${currentBaseLocation.lat},${currentBaseLocation.lng}&destination=${routeData.lat},${routeData.lng}`;
                  window.open(googleMapsUrl, '_blank');
                }}
              >
                <i className="fas fa-external-link-alt"></i> Open Google Maps
              </button>
              <button className="btn btn-secondary" style={{ flex: 1, height: '50px', fontSize: '16px', fontWeight: 'bold' }} onClick={() => setShowRouteModal(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Resource Modal */}
      {showResourceModal && (
        <div id="resourceModal" className="modal" style={{ display: 'flex' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{resourceModalData.id ? t.edit_resource : t.add_resource}</h2>
              <button className="btn-close" onClick={() => setShowResourceModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleResourceSave}>
              <div className="form-group">
                <label htmlFor="resourceName">Resource Name</label>
                <input
                  type="text"
                  id="resourceName"
                  className="form-control"
                  required
                  value={resourceModalData.name}
                  onChange={(e) => setResourceModalData({ ...resourceModalData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="resourceTypeSelect">Resource Type</label>
                <select
                  id="resourceTypeSelect"
                  className="form-control"
                  required
                  value={resourceModalData.type}
                  onChange={(e) => setResourceModalData({ ...resourceModalData, type: e.target.value })}
                >
                  <option value="" disabled>Select Resource</option>
                  <option value="Medical Supplies">Medical Supplies</option>
                  <option value="Food & Water">Food &amp; Water</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Rescue Team">Rescue Team</option>
                  <option value="Ambulance">Ambulance</option>
                  <option value="Bedding">Bedding</option>
                  <option value="Rescue Boats">Rescue Boats</option>
                  <option value="Heavy Machinery">Heavy Machinery</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="resourceTotal">Total Quantity</label>
                <input
                  type="number"
                  id="resourceTotal"
                  className="form-control"
                  required
                  min="1"
                  value={resourceModalData.totalQuantity}
                  onChange={(e) => setResourceModalData({ ...resourceModalData, totalQuantity: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="resourceAvailable">Available Quantity</label>
                <input
                  type="number"
                  id="resourceAvailable"
                  className="form-control"
                  required
                  min="0"
                  value={resourceModalData.availableQuantity}
                  onChange={(e) => setResourceModalData({ ...resourceModalData, availableQuantity: e.target.value })}
                />
              </div>
              <div className="btn-group">
                <button type="submit" className="btn btn-primary">Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowResourceModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispatch Volunteer Modal */}
      {dispatchingVolId !== null && (() => {
        const vol = volunteers.find(v => v.id === dispatchingVolId);
        const activeRequests = requests.filter(r => r.status !== 'resolved');
        return (
          <div id="dispatchModal" className="modal" style={{ display: 'flex' }}>
            <div className="modal-content" style={{ maxWidth: '850px', width: '90%' }}>
              <div className="modal-header">
                <h2>{t.dispatch_title || "Dispatch Volunteer"}: {vol ? vol.name : ""}</h2>
                <button className="btn-close" onClick={() => setDispatchingVolId(null)}>&times;</button>
              </div>
              <div style={{ marginBottom: '15px', fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                {t.dispatch_desc || "Select a request from the active list below to dispatch the volunteer to that specific location."}
              </div>
              
              {activeRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--color-text-secondary)' }}>
                  {t.no_pending_requests || "No active requests available to dispatch volunteers to."}
                </div>
              ) : (
                <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>{t.id || "ID"}</th>
                        <th>{t.what || "What"}</th>
                        <th>{t.where || "Where"}</th>
                        <th>{t.priority || "Priority"}</th>
                        <th>{t.actions || "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeRequests.map(req => (
                        <tr key={req.id}>
                          <td><strong>{req.requestId}</strong></td>
                          <td>
                            <div style={{ fontWeight: 'bold' }}>{req.resourceType}</div>
                            <div style={{ fontSize: '11px', color: '#666', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.description}>
                              {req.description}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontSize: '13px' }}>{req.address || "Mandya Region"}</div>
                            <div style={{ fontSize: '11px', color: '#888' }}>Lat: {req.lat.toFixed(4)}, Lng: {req.lng.toFixed(4)}</div>
                          </td>
                          <td>
                            <span className={`status-badge status-${req.mlPriorityClass || 'low'}`}>
                              {(req.mlPriorityClass || 'low').toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-primary btn-small"
                              onClick={() => handleDispatchVolunteer(dispatchingVolId, req.id)}
                            >
                              {t.dispatch || "Dispatch"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setDispatchingVolId(null)}>
                  {t.cancel || "Cancel"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {toast.visible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'success' ? '#22c55e' : (toast.type === 'error' ? '#ef4444' : (toast.type === 'warning' ? '#f59e0b' : '#3b82f6')),
          color: '#fff',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '600',
          transition: 'all 0.3s ease',
          fontSize: '14px',
          border: '1px solid rgba(255,255,255,0.2)'
        }}>
          <i className={toast.type === 'success' ? 'fas fa-check-circle' : (toast.type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-exclamation-triangle')}></i>
          <span>{toast.message}</span>
          <button onClick={() => setToast(prev => ({ ...prev, visible: false }))} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', marginLeft: '10px', fontSize: '18px', fontWeight: 'bold', lineHeight: '1' }}>×</button>
        </div>
      )}



    </div>
  );
}
