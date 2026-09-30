// ============================================================
// LANTERN DEMO DATA - REALISTIC LOCAL DATASETS
// NO real personal data, NO real APIs, NO real transactions.
// ============================================================

export const KERALA_LOCATIONS = [
  "Thiruvananthapuram",
  "Kollam",
  "Alappuzha",
  "Kottayam",
  "Ernakulam",
  "Kochi",
  "Thrissur",
  "Palakkad",
  "Malappuram",
  "Kozhikode",
  "Wayanad",
  "Kannur",
  "Kasaragod",
  "Bengaluru",
  "Chennai",
  "Coimbatore"
];

export const KSRTC_BUSES = [
  {
    id: "KSRTC-SWIFT-01",
    name: "KSRTC Swift Gajaraj AC Seater",
    type: "AC Seater (2+2)",
    departureTime: "06:30 AM",
    arrivalTime: "10:45 AM",
    duration: "4h 15m",
    availableSeats: 26,
    totalSeats: 40,
    fare: 380,
    rating: 4.6,
    features: ["AC", "Charging Port", "Water Bottle", "Emergency Button"],
    bookedSeats: ["A2", "A3", "B1", "C4", "D2", "E3", "F1", "G4", "H2", "J3"]
  },
  {
    id: "KSRTC-SWIFT-02",
    name: "KSRTC Swift Super Deluxe Air Bus",
    type: "Non-AC Push Back (2+2)",
    departureTime: "08:15 AM",
    arrivalTime: "12:45 PM",
    duration: "4h 30m",
    availableSeats: 31,
    totalSeats: 40,
    fare: 290,
    rating: 4.3,
    features: ["Push Back Seats", "Reading Lights", "Air Suspension"],
    bookedSeats: ["A1", "B4", "C2", "E1", "F3", "H4"]
  },
  {
    id: "KSRTC-EXP-03",
    name: "KSRTC Minnal Super Express",
    type: "Lightning Fast Limited Stop",
    departureTime: "11:00 AM",
    arrivalTime: "02:50 PM",
    duration: "3h 50m",
    availableSeats: 19,
    totalSeats: 40,
    fare: 340,
    rating: 4.5,
    features: ["Limited Stops", "Speed Corridor", "CCTV Security"],
    bookedSeats: ["A3", "B2", "B3", "C1", "C3", "D1", "D4", "E2", "F2", "G1", "G2"]
  },
  {
    id: "KSRTC-SF-04",
    name: "KSRTC Super Fast (Silverline)",
    type: "Semi Deluxe Express",
    departureTime: "02:30 PM",
    arrivalTime: "07:15 PM",
    duration: "4h 45m",
    availableSeats: 34,
    totalSeats: 40,
    fare: 220,
    rating: 4.1,
    features: ["Luggage Space", "Digital Board", "First Aid"],
    bookedSeats: ["A4", "B1", "C4", "D2", "E4"]
  },
  {
    id: "KSRTC-SCANIA-05",
    name: "KSRTC Garuda Maharaja Multi-Axle",
    type: "Multi-Axle Premium AC Sleeper",
    departureTime: "08:00 PM",
    arrivalTime: "11:45 PM",
    duration: "3h 45m",
    availableSeats: 14,
    totalSeats: 40,
    fare: 620,
    rating: 4.8,
    features: ["Luxury Sleeper", "Blanket Provided", "WiFi", "GPS Tracking"],
    bookedSeats: ["A1", "A2", "B3", "B4", "C1", "C2", "D3", "E1", "E2", "F4", "G3", "H1", "H2", "J1"]
  }
];

export const IRCTC_STATIONS = [
  { code: "ERS", name: "Ernakulam Junction", city: "Kochi" },
  { code: "TCR", name: "Thrissur", city: "Thrissur" },
  { code: "CLT", name: "Kozhikode", city: "Calicut" },
  { code: "CAN", name: "Kannur", city: "Kannur" },
  { code: "TVC", name: "Thiruvananthapuram Central", city: "Trivandrum" },
  { code: "MAS", name: "Chennai Central", city: "Chennai" },
  { code: "SBC", name: "KSR Bengaluru", city: "Bengaluru" },
  { code: "CSMT", name: "Mumbai CSMT", city: "Mumbai" },
  { code: "SRR", name: "Shoranur Junction", city: "Shoranur" },
  { code: "PGT", name: "Palakkad Junction", city: "Palakkad" }
];

export const IRCTC_CLASSES = [
  { code: "SL", name: "Sleeper (SL)", basePrice: 195 },
  { code: "3A", name: "AC 3 Tier (3A)", basePrice: 540 },
  { code: "2A", name: "AC 2 Tier (2A)", basePrice: 790 },
  { code: "1A", name: "AC First Class (1A)", basePrice: 1350 },
  { code: "CC", name: "AC Chair Car (CC)", basePrice: 320 }
];

export const IRCTC_TRAINS = [
  {
    trainNumber: "12076",
    trainName: "Jan Shatabdi Express",
    departure: "05:55 AM",
    arrival: "09:25 AM",
    duration: "3h 30m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: [
      { code: "CC", name: "AC Chair Car", fare: 320, availability: "AVL 48", status: "AVAILABLE" },
      { code: "2S", name: "Second Sitting", fare: 95, availability: "AVL 112", status: "AVAILABLE" }
    ]
  },
  {
    trainNumber: "20632",
    trainName: "Vande Bharat Express",
    departure: "07:00 AM",
    arrival: "10:15 AM",
    duration: "3h 15m",
    runsOn: ["Mon", "Tue", "Wed", "Fri", "Sat", "Sun"],
    classes: [
      { code: "CC", name: "AC Chair Car", fare: 680, availability: "AVL 24", status: "AVAILABLE" },
      { code: "EC", name: "Exec. Chair Car", fare: 1340, availability: "AVL 08", status: "AVAILABLE" }
    ]
  },
  {
    trainNumber: "12626",
    trainName: "Kerala Superfast Express",
    departure: "11:15 AM",
    arrival: "03:45 PM",
    duration: "4h 30m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: [
      { code: "SL", name: "Sleeper", fare: 195, availability: "AVL 32", status: "AVAILABLE" },
      { code: "3A", name: "AC 3 Tier", fare: 540, availability: "AVL 14", status: "AVAILABLE" },
      { code: "2A", name: "AC 2 Tier", fare: 790, availability: "RAC 04", status: "RAC" },
      { code: "1A", name: "AC First Class", fare: 1350, availability: "AVL 03", status: "AVAILABLE" }
    ]
  },
  {
    trainNumber: "16345",
    trainName: "Netravati Express",
    departure: "02:20 PM",
    arrival: "07:05 PM",
    duration: "4h 45m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: [
      { code: "SL", name: "Sleeper", fare: 180, availability: "AVL 64", status: "AVAILABLE" },
      { code: "3A", name: "AC 3 Tier", fare: 510, availability: "AVL 19", status: "AVAILABLE" },
      { code: "2A", name: "AC 2 Tier", fare: 760, availability: "WL 05", status: "WAITLIST" }
    ]
  },
  {
    trainNumber: "16604",
    trainName: "Maveli Express",
    departure: "07:25 PM",
    arrival: "11:55 PM",
    duration: "4h 30m",
    runsOn: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    classes: [
      { code: "SL", name: "Sleeper", fare: 195, availability: "AVL 86", status: "AVAILABLE" },
      { code: "3A", name: "AC 3 Tier", fare: 540, availability: "AVL 31", status: "AVAILABLE" },
      { code: "2A", name: "AC 2 Tier", fare: 790, availability: "AVL 12", status: "AVAILABLE" },
      { code: "1A", name: "AC First Class", fare: 1350, availability: "AVL 05", status: "AVAILABLE" }
    ]
  }
];

export const BHARATGAS_SAMPLE_CONSUMERS = {
  "1002345678": {
    consumerNumber: "1002345678",
    name: "Ananya Ramesh",
    mobile: "9847123456",
    distributor: "Malabar LPG Agencies (Dist Code: 2045)",
    district: "Kozhikode",
    cylinderType: "14.2 kg Domestic Subsidized",
    address: "Flat 4B, Emerald Heights, Wayanad Road, Civil Station P.O., Kozhikode - 673020",
    subsidyStatus: "Aadhaar Linked (Active)",
    lastRefillDate: "12-Aug-2026",
    svNumber: "SV/7788412"
  },
  "1009876543": {
    consumerNumber: "1009876543",
    name: "Suresh Kumar Nair",
    mobile: "9447654321",
    distributor: "Cochin Flames Agency (Dist Code: 1104)",
    district: "Ernakulam",
    cylinderType: "14.2 kg Domestic Non-Subsidized",
    address: "TC 14/204, Rose Lane, Panampilly Nagar, Kochi - 682036",
    subsidyStatus: "Opted Out",
    lastRefillDate: "05-Sep-2026",
    svNumber: "SV/4412908"
  },
  "1005544332": {
    consumerNumber: "1005544332",
    name: "Mariam Varghese",
    mobile: "9745112233",
    distributor: "Capital City Gas Distributors (Dist Code: 3012)",
    district: "Thiruvananthapuram",
    cylinderType: "14.2 kg Domestic Subsidized",
    address: "House No. 12, Blossom Villa, Jawahar Nagar, Kowdiar P.O., Thiruvananthapuram - 695003",
    subsidyStatus: "Aadhaar Linked (Active)",
    lastRefillDate: "28-Jul-2026",
    svNumber: "SV/9912034"
  }
};

export const BHARATGAS_CYLINDER_TYPES = [
  {
    type: "14.2 kg Domestic Subsidized",
    name: "14.2 kg Domestic Subsidized Refill",
    price: 860.50,
    deliveryFee: 0,
    description: "Standard domestic LPG cylinder with DBT subsidy transferred to linked bank account."
  },
  {
    type: "14.2 kg Domestic Non-Subsidized",
    name: "14.2 kg Domestic Non-Subsidized Refill",
    price: 910.00,
    deliveryFee: 0,
    description: "Standard domestic refill without state subsidy."
  },
  {
    type: "5 kg Chhotu Cylinder",
    name: "5 kg Chhotu FTL Cylinder",
    price: 345.00,
    deliveryFee: 25.00,
    description: "Compact 5kg cylinder, perfect for students, small families and portable needs."
  },
  {
    type: "19 kg Commercial Cylinder",
    name: "19 kg Commercial Blue Cylinder",
    price: 1780.00,
    deliveryFee: 50.00,
    description: "Commercial grade LPG cylinder designed for hotels, restaurants and enterprises."
  }
];

export const KSEB_SAMPLE_CONSUMERS = {
  "1155023004561": {
    consumerNumber: "1155023004561",
    name: "Radhakrishnan P.",
    sectionOffice: "Kaloor Electrical Section (1155)",
    tariff: "LT 1A Domestic",
    meterNumber: "EM-992140",
    billNumber: "KSEB/2026/09/8821",
    billDate: "05-Sep-2026",
    dueDate: "25-Sep-2026",
    disconnectionDate: "10-Oct-2026",
    billingPeriod: "01-Aug-2026 to 01-Sep-2026 (Monthly)",
    previousReading: 4210,
    currentReading: 4485,
    units: 275,
    energyCharge: 1580.00,
    fixedCharge: 140.00,
    fuelSurcharge: 55.00,
    electricityDuty: 158.00,
    meterRent: 20.00,
    totalAmount: 1953.00,
    address: "Kaloor - Kadavanthra Road, Near Metro Pillar 512, Kochi, Kerala - 682017"
  },
  "1155078009812": {
    consumerNumber: "1155078009812",
    name: "Deepa Menon",
    sectionOffice: "Thrissur West Electrical Section (1158)",
    tariff: "LT 1A Domestic",
    meterNumber: "EM-331089",
    billNumber: "KSEB/2026/09/5412",
    billDate: "10-Sep-2026",
    dueDate: "30-Sep-2026",
    disconnectionDate: "15-Oct-2026",
    billingPeriod: "10-Aug-2026 to 10-Sep-2026 (Monthly)",
    previousReading: 6100,
    currentReading: 6280,
    units: 180,
    energyCharge: 954.00,
    fixedCharge: 110.00,
    fuelSurcharge: 36.00,
    electricityDuty: 95.40,
    meterRent: 20.00,
    totalAmount: 1215.40,
    address: "Ayyanthole P.O., Civil Station Road, Thrissur, Kerala - 680003"
  },
  "1155099003344": {
    consumerNumber: "1155099003344",
    name: "Abdul Rasheed",
    sectionOffice: "Palayam Electrical Section, Trivandrum (1142)",
    tariff: "LT 1A Domestic",
    meterNumber: "EM-784512",
    billNumber: "KSEB/2026/09/9102",
    billDate: "02-Sep-2026",
    dueDate: "22-Sep-2026",
    disconnectionDate: "07-Oct-2026",
    billingPeriod: "01-Aug-2026 to 01-Sep-2026 (Monthly)",
    previousReading: 3450,
    currentReading: 3810,
    units: 360,
    energyCharge: 2280.00,
    fixedCharge: 160.00,
    fuelSurcharge: 72.00,
    electricityDuty: 228.00,
    meterRent: 20.00,
    totalAmount: 2760.00,
    address: "TC 28/119, Statue Junction, Palayam, Thiruvananthapuram, Kerala - 695001"
  }
};

export const DEMO_PAYMENT_BANKS = [
  "State Bank of India (SBI)",
  "Federal Bank",
  "HDFC Bank",
  "ICICI Bank",
  "Kerala Gramin Bank",
  "Canara Bank",
  "South Indian Bank",
  "Punjab National Bank",
  "Bank of Baroda"
];
