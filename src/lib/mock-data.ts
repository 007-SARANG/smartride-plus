// Mock data for Indian cities - Realistic bus simulation
// Covers major cities: Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad

// Base coordinates for major Indian cities
const indianCities = {
  delhi: { lat: 28.6139, lng: 77.2090, name: "Delhi" },
  mumbai: { lat: 19.0760, lng: 72.8777, name: "Mumbai" },
  bangalore: { lat: 12.9716, lng: 77.5946, name: "Bangalore" },
  chennai: { lat: 13.0827, lng: 80.2707, name: "Chennai" },
  kolkata: { lat: 22.5726, lng: 88.3639, name: "Kolkata" },
  hyderabad: { lat: 17.3850, lng: 78.4867, name: "Hyderabad" },
  pune: { lat: 18.5204, lng: 73.8567, name: "Pune" },
  ahmedabad: { lat: 23.0225, lng: 72.5714, name: "Ahmedabad" },
  jaipur: { lat: 26.9124, lng: 75.7873, name: "Jaipur" },
  chandigarh: { lat: 30.7333, lng: 76.7794, name: "Chandigarh" },
};

// Famous stops in each city
const cityStops = {
  delhi: ["Connaught Place", "Red Fort", "India Gate", "Karol Bagh", "Nehru Place", "Dwarka", "Rohini"],
  mumbai: ["Churchgate", "CST", "Bandra", "Andheri", "Dadar", "Borivali", "Thane"],
  bangalore: ["MG Road", "Koramangala", "Indiranagar", "Whitefield", "Electronic City", "Jayanagar", "BTM Layout"],
  chennai: ["T Nagar", "Anna Nagar", "Velachery", "Adyar", "Mylapore", "Guindy", "Tambaram"],
  kolkata: ["Park Street", "Howrah", "Salt Lake", "Esplanade", "Gariahat", "Ballygunge", "Dum Dum"],
  hyderabad: ["Charminar", "Secunderabad", "Hitech City", "Gachibowli", "Kukatpally", "Ameerpet", "LB Nagar"],
  pune: ["Shivaji Nagar", "Koregaon Park", "Hinjewadi", "Kothrud", "Hadapsar", "Wakad", "Viman Nagar"],
  ahmedabad: ["Navrangpura", "Satellite", "Vastrapur", "CG Road", "Maninagar", "Chandkheda", "Gota"],
  jaipur: ["Pink City", "C-Scheme", "Mansarovar", "Malviya Nagar", "Vaishali Nagar", "Jagatpura"],
  chandigarh: ["Sector 17", "Sector 35", "Elante Mall", "Rock Garden", "IT Park", "Sector 22"],
};

// Generate initial bus positions across India
export const mockBusData = [
  // Delhi Buses (DTC)
  {
    id: "DL-001",
    routeNumber: "764",
    location: { latitude: 28.6139, longitude: 77.2090 },
    heading: 45,
    speed: 28,
    crowdLevel: 60,
    capacity: 50,
    occupancy: 30,
    nextStop: "Connaught Place",
    eta: 180,
    lastUpdated: Date.now(),
    city: "Delhi",
  },
  {
    id: "DL-002",
    routeNumber: "534",
    location: { latitude: 28.6562, longitude: 77.2410 },
    heading: 180,
    speed: 25,
    crowdLevel: 75,
    capacity: 50,
    occupancy: 38,
    nextStop: "Red Fort",
    eta: 240,
    lastUpdated: Date.now(),
    city: "Delhi",
  },
  {
    id: "DL-003",
    routeNumber: "413",
    location: { latitude: 28.5244, longitude: 77.2066 },
    heading: 270,
    speed: 30,
    crowdLevel: 45,
    capacity: 50,
    occupancy: 23,
    nextStop: "Nehru Place",
    eta: 300,
    lastUpdated: Date.now(),
    city: "Delhi",
  },
  
  // Mumbai Buses (BEST)
  {
    id: "MH-001",
    routeNumber: "AS-1",
    location: { latitude: 19.0760, longitude: 72.8777 },
    heading: 90,
    speed: 22,
    crowdLevel: 85,
    capacity: 45,
    occupancy: 38,
    nextStop: "Churchgate",
    eta: 210,
    lastUpdated: Date.now(),
    city: "Mumbai",
  },
  {
    id: "MH-002",
    routeNumber: "C-2",
    location: { latitude: 19.0596, longitude: 72.8295 },
    heading: 135,
    speed: 20,
    crowdLevel: 90,
    capacity: 45,
    occupancy: 40,
    nextStop: "Bandra Station",
    eta: 270,
    lastUpdated: Date.now(),
    city: "Mumbai",
  },
  {
    id: "MH-003",
    routeNumber: "AS-9",
    location: { latitude: 19.1136, longitude: 72.8697 },
    heading: 225,
    speed: 26,
    crowdLevel: 55,
    capacity: 50,
    occupancy: 28,
    nextStop: "Andheri",
    eta: 330,
    lastUpdated: Date.now(),
    city: "Mumbai",
  },
  
  // Bangalore Buses (BMTC)
  {
    id: "KA-001",
    routeNumber: "335E",
    location: { latitude: 12.9716, longitude: 77.5946 },
    heading: 315,
    speed: 32,
    crowdLevel: 50,
    capacity: 50,
    occupancy: 25,
    nextStop: "MG Road",
    eta: 180,
    lastUpdated: Date.now(),
    city: "Bangalore",
  },
  {
    id: "KA-002",
    routeNumber: "500K",
    location: { latitude: 12.9352, longitude: 77.6245 },
    heading: 90,
    speed: 28,
    crowdLevel: 65,
    capacity: 50,
    occupancy: 33,
    nextStop: "Koramangala",
    eta: 240,
    lastUpdated: Date.now(),
    city: "Bangalore",
  },
  {
    id: "KA-003",
    routeNumber: "201",
    location: { latitude: 12.9698, longitude: 77.7499 },
    heading: 180,
    speed: 35,
    crowdLevel: 40,
    capacity: 50,
    occupancy: 20,
    nextStop: "Whitefield",
    eta: 360,
    lastUpdated: Date.now(),
    city: "Bangalore",
  },
  
  // Chennai Buses (MTC)
  {
    id: "TN-001",
    routeNumber: "23C",
    location: { latitude: 13.0827, longitude: 80.2707 },
    heading: 45,
    speed: 24,
    crowdLevel: 70,
    capacity: 45,
    occupancy: 32,
    nextStop: "T Nagar",
    eta: 200,
    lastUpdated: Date.now(),
    city: "Chennai",
  },
  {
    id: "TN-002",
    routeNumber: "27B",
    location: { latitude: 13.1067, longitude: 80.0982 },
    heading: 270,
    speed: 26,
    crowdLevel: 60,
    capacity: 45,
    occupancy: 27,
    nextStop: "Anna Nagar",
    eta: 280,
    lastUpdated: Date.now(),
    city: "Chennai",
  },
  
  // Kolkata Buses (WBTC)
  {
    id: "WB-001",
    routeNumber: "S-34",
    location: { latitude: 22.5726, longitude: 88.3639 },
    heading: 135,
    speed: 20,
    crowdLevel: 80,
    capacity: 50,
    occupancy: 40,
    nextStop: "Park Street",
    eta: 220,
    lastUpdated: Date.now(),
    city: "Kolkata",
  },
  {
    id: "WB-002",
    routeNumber: "AC-42",
    location: { latitude: 22.5958, longitude: 88.4636 },
    heading: 315,
    speed: 22,
    crowdLevel: 55,
    capacity: 45,
    occupancy: 25,
    nextStop: "Salt Lake",
    eta: 300,
    lastUpdated: Date.now(),
    city: "Kolkata",
  },
  
  // Hyderabad Buses (TSRTC)
  {
    id: "TS-001",
    routeNumber: "49M",
    location: { latitude: 17.3850, longitude: 78.4867 },
    heading: 90,
    speed: 30,
    crowdLevel: 50,
    capacity: 50,
    occupancy: 25,
    nextStop: "Charminar",
    eta: 190,
    lastUpdated: Date.now(),
    city: "Hyderabad",
  },
  {
    id: "TS-002",
    routeNumber: "300",
    location: { latitude: 17.4435, longitude: 78.3489 },
    heading: 180,
    speed: 32,
    crowdLevel: 45,
    capacity: 50,
    occupancy: 23,
    nextStop: "Hitech City",
    eta: 260,
    lastUpdated: Date.now(),
    city: "Hyderabad",
  },
  
  // Pune Buses (PMPML)
  {
    id: "MH-PU-001",
    routeNumber: "1",
    location: { latitude: 18.5204, longitude: 73.8567 },
    heading: 225,
    speed: 27,
    crowdLevel: 65,
    capacity: 50,
    occupancy: 33,
    nextStop: "Shivaji Nagar",
    eta: 210,
    lastUpdated: Date.now(),
    city: "Pune",
  },
  {
    id: "MH-PU-002",
    routeNumber: "4",
    location: { latitude: 18.5314, longitude: 73.9277 },
    heading: 315,
    speed: 29,
    crowdLevel: 55,
    capacity: 50,
    occupancy: 28,
    nextStop: "Koregaon Park",
    eta: 270,
    lastUpdated: Date.now(),
    city: "Pune",
  },
  
  // Ahmedabad Buses (AMTS)
  {
    id: "GJ-001",
    routeNumber: "132",
    location: { latitude: 23.0225, longitude: 72.5714 },
    heading: 45,
    speed: 28,
    crowdLevel: 60,
    capacity: 50,
    occupancy: 30,
    nextStop: "Navrangpura",
    eta: 200,
    lastUpdated: Date.now(),
    city: "Ahmedabad",
  },
  {
    id: "GJ-002",
    routeNumber: "106",
    location: { latitude: 23.0359, longitude: 72.5661 },
    heading: 180,
    speed: 25,
    crowdLevel: 50,
    capacity: 50,
    occupancy: 25,
    nextStop: "Satellite",
    eta: 250,
    lastUpdated: Date.now(),
    city: "Ahmedabad",
  },
  
  // Jaipur Buses (JCTSL)
  {
    id: "RJ-001",
    routeNumber: "5A",
    location: { latitude: 26.9124, longitude: 75.7873 },
    heading: 90,
    speed: 26,
    crowdLevel: 55,
    capacity: 45,
    occupancy: 25,
    nextStop: "Pink City",
    eta: 230,
    lastUpdated: Date.now(),
    city: "Jaipur",
  },
  
  // Chandigarh Buses (CTU)
  {
    id: "CH-001",
    routeNumber: "42",
    location: { latitude: 30.7333, longitude: 76.7794 },
    heading: 135,
    speed: 30,
    crowdLevel: 45,
    capacity: 50,
    occupancy: 23,
    nextStop: "Sector 17",
    eta: 180,
    lastUpdated: Date.now(),
    city: "Chandigarh",
  },
];

export const mockStops = [
  // Delhi Stops
  { id: "DL-1", name: "Connaught Place", location: { latitude: 28.6315, longitude: 77.2167 }, city: "Delhi" },
  { id: "DL-2", name: "Red Fort", location: { latitude: 28.6562, longitude: 77.2410 }, city: "Delhi" },
  { id: "DL-3", name: "India Gate", location: { latitude: 28.6129, longitude: 77.2295 }, city: "Delhi" },
  { id: "DL-4", name: "Nehru Place", location: { latitude: 28.5494, longitude: 77.2501 }, city: "Delhi" },
  { id: "DL-5", name: "Karol Bagh", location: { latitude: 28.6514, longitude: 77.1907 }, city: "Delhi" },
  
  // Mumbai Stops
  { id: "MH-1", name: "Churchgate", location: { latitude: 18.9322, longitude: 72.8264 }, city: "Mumbai" },
  { id: "MH-2", name: "CST", location: { latitude: 18.9398, longitude: 72.8355 }, city: "Mumbai" },
  { id: "MH-3", name: "Bandra Station", location: { latitude: 19.0544, longitude: 72.8406 }, city: "Mumbai" },
  { id: "MH-4", name: "Andheri", location: { latitude: 19.1136, longitude: 72.8697 }, city: "Mumbai" },
  
  // Bangalore Stops
  { id: "KA-1", name: "MG Road", location: { latitude: 12.9759, longitude: 77.6069 }, city: "Bangalore" },
  { id: "KA-2", name: "Koramangala", location: { latitude: 12.9352, longitude: 77.6245 }, city: "Bangalore" },
  { id: "KA-3", name: "Whitefield", location: { latitude: 12.9698, longitude: 77.7499 }, city: "Bangalore" },
  { id: "KA-4", name: "Electronic City", location: { latitude: 12.8456, longitude: 77.6603 }, city: "Bangalore" },
  
  // Chennai Stops
  { id: "TN-1", name: "T Nagar", location: { latitude: 13.0418, longitude: 80.2341 }, city: "Chennai" },
  { id: "TN-2", name: "Anna Nagar", location: { latitude: 13.0850, longitude: 80.2101 }, city: "Chennai" },
  { id: "TN-3", name: "Adyar", location: { latitude: 13.0067, longitude: 80.2572 }, city: "Chennai" },
];

export const mockRoutes = [
  {
    id: "R1",
    routeNumber: "764",
    origin: "Connaught Place",
    destination: "India Gate",
    stops: [mockStops[0], mockStops[1], mockStops[2]],
    distance: 5.2,
    duration: 900,
    crowdScore: 60,
    color: "#3b82f6",
    city: "Delhi",
  },
  {
    id: "R2",
    routeNumber: "AS-1",
    origin: "Churchgate",
    destination: "Bandra Station",
    stops: [mockStops[5], mockStops[6], mockStops[7]],
    distance: 6.8,
    duration: 1200,
    crowdScore: 85,
    color: "#ef4444",
    city: "Mumbai",
  },
  {
    id: "R3",
    routeNumber: "335E",
    origin: "MG Road",
    destination: "Electronic City",
    stops: [mockStops[9], mockStops[10], mockStops[12]],
    distance: 18.5,
    duration: 2400,
    crowdScore: 50,
    color: "#10b981",
    city: "Bangalore",
  },
];

export const mockEmergencyServices = [
  {
    id: "1",
    name: "City Police Station",
    type: "police" as const,
    location: { latitude: 37.7849, longitude: -122.4094 },
    phone: "911",
    distance: 0.5,
  },
  {
    id: "2",
    name: "San Francisco General Hospital",
    type: "hospital" as const,
    location: { latitude: 37.7756, longitude: -122.4143 },
    phone: "911",
    distance: 0.8,
  },
  {
    id: "3",
    name: "Fire Station 1",
    type: "fire" as const,
    location: { latitude: 37.7799, longitude: -122.4134 },
    phone: "911",
    distance: 1.2,
  },
  {
    id: "4",
    name: "St. Mary's Medical Center",
    type: "hospital" as const,
    location: { latitude: 37.7886, longitude: -122.4324 },
    phone: "(415) 555-0123",
    distance: 1.5,
  },
  {
    id: "5",
    name: "Police Substation North",
    type: "police" as const,
    location: { latitude: 37.7989, longitude: -122.4012 },
    phone: "911",
    distance: 2.0,
  },
];

export const mockCrowdReports = [
  {
    id: "cr-001",
    busId: "bus-001",
    userId: "user-123",
    crowdLevel: 45,
    timestamp: Date.now() - 300000, // 5 minutes ago
    location: { latitude: 37.7749, longitude: -122.4194 },
  },
  {
    id: "cr-002",
    busId: "bus-002",
    userId: "user-456",
    crowdLevel: 70,
    timestamp: Date.now() - 600000, // 10 minutes ago
    location: { latitude: 37.7849, longitude: -122.4094 },
  },
  {
    id: "cr-003",
    busId: "bus-003",
    userId: "user-789",
    crowdLevel: 85,
    timestamp: Date.now() - 180000, // 3 minutes ago
    location: { latitude: 37.7879, longitude: -122.4074 },
  },
];

// Helper function to simulate real-time bus updates
export function updateBusPositions(buses: typeof mockBusData) {
  return buses.map((bus) => ({
    ...bus,
    location: {
      latitude: bus.location.latitude + (Math.random() - 0.5) * 0.001,
      longitude: bus.location.longitude + (Math.random() - 0.5) * 0.001,
    },
    speed: Math.max(0, Math.min(60, bus.speed + (Math.random() - 0.5) * 5)),
    eta: Math.max(0, bus.eta - 5),
    crowdLevel: Math.max(
      0,
      Math.min(100, bus.crowdLevel + (Math.random() - 0.5) * 10)
    ),
    lastUpdated: Date.now(),
  }));
}

// Helper to generate random crowd level
export function generateRandomCrowdLevel(): number {
  // Weighted random: more likely to be in 30-70 range
  const base = Math.random();
  if (base < 0.7) {
    return 30 + Math.random() * 40; // 30-70
  } else if (base < 0.9) {
    return 10 + Math.random() * 20; // 10-30
  } else {
    return 70 + Math.random() * 30; // 70-100
  }
}

// Sample route coordinates for map visualization
export const mockRouteCoordinates: [number, number][] = [
  [-122.4194, 37.7749], // Central Station
  [-122.4150, 37.7800],
  [-122.4094, 37.7849], // Market Street
  [-122.4080, 37.7870],
  [-122.4074, 37.7879], // Union Square
  [-122.4050, 37.7900],
  [-122.3999, 37.7946], // Financial District
  [-122.3960, 37.7950],
  [-122.3933, 37.7956], // Ferry Building
];

// Time-based crowd patterns (peak hours have higher crowds)
export function getTimeBasedCrowdMultiplier(): number {
  const hour = new Date().getHours();
  
  // Rush hour (7-9 AM, 5-7 PM)
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    return 1.5;
  }
  
  // Midday (11 AM - 2 PM)
  if (hour >= 11 && hour <= 14) {
    return 1.2;
  }
  
  // Late night/early morning (11 PM - 6 AM)
  if (hour >= 23 || hour <= 6) {
    return 0.5;
  }
  
  // Normal hours
  return 1.0;
}

// Demo scenarios for testing
export const demoScenarios = {
  lowCrowd: {
    buses: mockBusData.map((bus) => ({ ...bus, crowdLevel: 20 })),
    description: "All buses have low crowd levels",
  },
  
  highCrowd: {
    buses: mockBusData.map((bus) => ({ ...bus, crowdLevel: 85 })),
    description: "All buses are crowded - shows route optimization value",
  },
  
  mixedCrowd: {
    buses: mockBusData, // Original mixed data
    description: "Realistic mix of crowd levels",
  },
  
  rushHour: {
    buses: mockBusData.map((bus) => ({
      ...bus,
      crowdLevel: 75,
      speed: bus.speed * 0.7,
      eta: bus.eta * 1.5,
    })),
    description: "Rush hour conditions with delays",
  },
};

export default {
  mockBusData,
  mockStops,
  mockRoutes,
  mockEmergencyServices,
  mockCrowdReports,
  mockRouteCoordinates,
  demoScenarios,
  updateBusPositions,
  generateRandomCrowdLevel,
  getTimeBasedCrowdMultiplier,
};
