import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, limit } from "firebase/firestore";
import { fetchAllRealTimeBuses, isRealTimeAvailable } from "@/lib/gtfs-realtime";
import { loadGTFSStops, loadGTFSRoutes, getRandomStops, getRandomRoutes, getGTFSStats } from "@/lib/gtfs-parser";

// Simulated Indian bus data with realistic movement
// This simulates real-time bus movement across major Indian cities

interface Bus {
  id: string;
  routeNumber: string;
  location: { latitude: number; longitude: number };
  heading: number;
  speed: number;
  crowdLevel: number;
  capacity: number;
  occupancy: number;
  nextStop: string;
  eta: number;
  lastUpdated: number;
  city: string;
}

// Initialize Delhi buses with REAL GTFS data
function initializeDelhiBusesFromGTFS(): Bus[] {
  try {
    const stops = getRandomStops(30);
    const routes = getRandomRoutes(20);
    
    if (stops.length === 0 || routes.length === 0) {
      console.log('⚠️ GTFS data not loaded, using default simulation');
      return [];
    }
    
    console.log(`🚍 Initializing Delhi buses with REAL GTFS data: ${stops.length} stops, ${routes.length} routes`);
    
    const buses: Bus[] = [];
    
    // Create 20 buses with real GTFS data
    for (let i = 0; i < 20; i++) {
      const stop = stops[i % stops.length];
      const route = routes[i % routes.length];
      const nextStop = stops[(i + 1) % stops.length];
      
      buses.push({
        id: `DL-REAL-${String(i + 1).padStart(3, '0')}`,
        routeNumber: route.route_short_name || route.route_long_name.substring(0, 10),
        location: {
          latitude: stop.stop_lat + (Math.random() - 0.5) * 0.01, // Slight offset
          longitude: stop.stop_lon + (Math.random() - 0.5) * 0.01,
        },
        heading: Math.floor(Math.random() * 360),
        speed: 15 + Math.floor(Math.random() * 30), // 15-45 km/h
        crowdLevel: 30 + Math.floor(Math.random() * 60), // 30-90%
        capacity: 50,
        occupancy: 15 + Math.floor(Math.random() * 35), // 15-50 people
        nextStop: nextStop.stop_name,
        eta: 60 + Math.floor(Math.random() * 600), // 1-11 minutes
        lastUpdated: Date.now(),
        city: "Delhi",
      });
    }
    
    console.log(`✅ Created ${buses.length} Delhi buses with real GTFS routes and stops!`);
    return buses;
  } catch (error) {
    console.error('❌ Error initializing GTFS buses:', error);
    return [];
  }
}

// Store bus states in memory for simulation (in production, use database)
let busStates: Bus[] = [
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

// Function to simulate realistic bus movement
function simulateBusMovement(bus: Bus): Bus {
  const now = Date.now();
  const timeDiff = (now - bus.lastUpdated) / 1000; // seconds

  // Calculate movement based on speed (km/h to degrees per second, very rough approximation)
  // 1 km ≈ 0.009 degrees at equator, adjusting for Indian latitudes
  const distancePerSecond = (bus.speed / 3600) * 0.009;
  
  // Convert heading to radians
  const headingRad = (bus.heading * Math.PI) / 180;
  
  // Calculate new position
  const latChange = Math.cos(headingRad) * distancePerSecond * timeDiff;
  const lngChange = Math.sin(headingRad) * distancePerSecond * timeDiff;
  
  // Add some randomness for realistic city traffic
  const randomFactor = 0.0001;
  
  return {
    ...bus,
    location: {
      latitude: bus.location.latitude + latChange + (Math.random() - 0.5) * randomFactor,
      longitude: bus.location.longitude + lngChange + (Math.random() - 0.5) * randomFactor,
    },
    heading: (bus.heading + (Math.random() - 0.5) * 10 + 360) % 360, // Slight heading changes
    speed: Math.max(5, Math.min(50, bus.speed + (Math.random() - 0.5) * 8)), // Speed varies 5-50 km/h
    crowdLevel: Math.max(20, Math.min(95, bus.crowdLevel + (Math.random() - 0.5) * 10)),
    occupancy: Math.max(5, Math.min(bus.capacity, Math.floor(bus.capacity * bus.crowdLevel / 100))),
    eta: Math.max(60, bus.eta - Math.floor(timeDiff * 2)), // ETA decreases
    lastUpdated: now,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const routeNumber = searchParams.get("route");
    const city = searchParams.get("city");
    const useRealTime = searchParams.get("realtime") !== "false"; // Default to true

    let buses: Bus[] = [];

    // Priority 1: Try to fetch real GPS data from transit APIs
    if (useRealTime && isRealTimeAvailable()) {
      console.log("📡 Fetching REAL-TIME GPS data from Indian transit authorities...");
      
      try {
        const realTimeBuses = await fetchAllRealTimeBuses();
        
        if (realTimeBuses.length > 0) {
          // Transform GTFS data to our Bus format
          buses = realTimeBuses.map((gtfsBus, index) => ({
            id: gtfsBus.id,
            routeNumber: gtfsBus.routeNumber,
            location: gtfsBus.location,
            heading: gtfsBus.heading,
            speed: gtfsBus.speed,
            crowdLevel: 50 + Math.floor(Math.random() * 40), // Estimate (would need occupancy sensors)
            capacity: 50,
            occupancy: Math.floor(25 + Math.random() * 25),
            nextStop: "Live tracking", // Would need route data
            eta: Math.floor(60 + Math.random() * 300),
            lastUpdated: gtfsBus.timestamp,
            city: "Live", // Would parse from route data
          }));
          
          console.log(`✅ Loaded ${buses.length} buses from REAL GPS tracking`);
        }
      } catch (error) {
        console.error("❌ Real-time API error, falling back to simulation:", error);
      }
    }

    // Priority 2: Try GTFS-based simulation with real stops and routes
    if (buses.length === 0) {
      // Initialize Delhi buses from GTFS if not done yet or if busStates is old format
      if (busStates.length === 0 || busStates[0].id === "DL-001") {
        const gtfsBuses = initializeDelhiBusesFromGTFS();
        
        if (gtfsBuses.length > 0) {
          busStates = [...gtfsBuses, ...busStates.filter(b => !b.city || b.city !== "Delhi")];
          console.log("🚍 Initialized Delhi buses with REAL GTFS data!");
        }
      }
      
      console.log("🚌 Using GTFS-enhanced simulation with real Delhi stops and routes");
      
      // Update all simulated bus positions with realistic movement
      busStates = busStates.map(simulateBusMovement);
      buses = [...busStates];
    }

    // Filter by route if specified
    if (routeNumber) {
      buses = buses.filter((bus: Bus) => bus.routeNumber === routeNumber);
    }
    
    // Filter by city if specified
    if (city) {
      buses = buses.filter((bus: Bus) => 
        bus.city && bus.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Broadcast via Socket.IO if available (fire and forget)
    try {
      const socketModule = await import('@/lib/socket');
      if (socketModule.emitBusUpdate) {
        socketModule.emitBusUpdate(buses);
      }
    } catch (error) {
      // Socket.IO not initialized yet, that's okay
    }

    // Determine data source
    const dataSource = buses.length > 0 && buses[0].city === "Live" 
      ? "real-time-gps" 
      : buses.length > 0 && buses[0].id?.startsWith("DL-REAL")
      ? "gtfs-enhanced"
      : "simulation";

    return NextResponse.json(buses, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Refresh-Interval": "5000", // Suggest refreshing every 5 seconds
        "X-Data-Source": dataSource,
      },
    });
  } catch (error) {
    console.error("Bus tracking error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bus positions" },
      { status: 500 }
    );
  }
}
