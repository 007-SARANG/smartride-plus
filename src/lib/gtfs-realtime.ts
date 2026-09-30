// GTFS Real-Time Integration for Indian Transit Systems
// This connects to actual GPS-tracked buses from Indian transit authorities
// Using MobilityData API for global transit feed access

interface GTFSBusPosition {
  id: string;
  routeNumber: string;
  location: {
    latitude: number;
    longitude: number;
  };
  heading: number;
  speed: number;
  timestamp: number;
  vehicleId: string;
  city?: string;
  agencyName?: string;
}

// MobilityData API Configuration
const MOBILITY_DATA_API = {
  baseUrl: "https://api.mobilitydata.org/v1",
  apiKey: process.env.MOBILITY_DATA_API_KEY || "",
  enabled: false, // Disabled due to network issues - focusing on Delhi OTD
};

// Configuration for Indian city transit APIs
const TRANSIT_APIS = {
  delhi: {
    name: "Delhi Transport Corporation",
    baseUrl: "https://otd.delhi.gov.in/api/realtime/VehiclePositions",
    apiKey: process.env.DELHI_OTD_API_KEY || "",
    enabled: false, // ⚠️ TEMPORARILY DISABLED - API endpoint returning 404
    format: "pb", // Protocol Buffer format
  },
  bangalore: {
    name: "BMTC Bangalore",
    baseUrl: "https://api.mybmtc.com/v1/vehicles",
    apiKey: process.env.BMTC_API_KEY || "",
    enabled: false,
  },
  // Add more cities as you get API access
};

/**
 * Fetch available GTFS feeds from MobilityData
 * Returns list of transit agencies with real-time data
 */
export async function fetchMobilityDataFeeds(country: string = "IN") {
  if (!MOBILITY_DATA_API.enabled || !MOBILITY_DATA_API.apiKey) {
    return [];
  }

  try {
    const response = await fetch(
      `${MOBILITY_DATA_API.baseUrl}/feeds?country_code=${country}&status=active`,
      {
        headers: {
          'Authorization': `Bearer ${MOBILITY_DATA_API.apiKey}`,
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      console.error(`MobilityData API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.feeds || [];
  } catch (error) {
    console.error("Error fetching MobilityData feeds:", error);
    return [];
  }
}

/**
 * Fetch real-time bus positions from a specific GTFS feed via MobilityData
 */
export async function fetchGTFSRealtimeData(feedUrl: string): Promise<GTFSBusPosition[]> {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'Accept': 'application/x-protobuf, application/json',
      },
      next: { revalidate: 10 }, // Cache for 10 seconds
    });

    if (!response.ok) {
      throw new Error(`GTFS feed error: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    
    // Try JSON format first (easier to parse)
    if (contentType?.includes('json')) {
      const data = await response.json();
      return parseGTFSJSON(data);
    }
    
    // Parse Protobuf format using gtfs-realtime-bindings
    try {
      const GtfsRealtimeBindings = require('gtfs-realtime-bindings');
      const buffer = await response.arrayBuffer();
      const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(
        new Uint8Array(buffer)
      );
      
      return parseGTFSProtobuf(feed);
    } catch (protobufError) {
      console.warn("Could not parse protobuf format:", protobufError);
      return [];
    }
  } catch (error) {
    console.error("Error fetching GTFS realtime data:", error);
    return [];
  }
}

/**
 * Parse GTFS Protobuf format to our bus position format
 */
function parseGTFSProtobuf(feed: any): GTFSBusPosition[] {
  if (!feed.entity) return [];

  return feed.entity
    .filter((entity: any) => entity.vehicle?.position)
    .map((entity: any) => {
      const vehicle = entity.vehicle;
      const position = vehicle.position;
      
      return {
        id: entity.id || vehicle.vehicle?.id || `bus-${Date.now()}-${Math.random()}`,
        routeNumber: vehicle.trip?.routeId || vehicle.trip?.route_id || "Unknown",
        location: {
          latitude: position.latitude,
          longitude: position.longitude,
        },
        heading: position.bearing || 0,
        speed: (position.speed || 0) * 3.6, // m/s to km/h
        timestamp: (vehicle.timestamp || Date.now() / 1000) * 1000,
        vehicleId: vehicle.vehicle?.id || entity.id,
        agencyName: vehicle.trip?.agencyId,
      };
    });
}

/**
 * Parse GTFS JSON format to our bus position format
 */
function parseGTFSJSON(data: any): GTFSBusPosition[] {
  if (!data.entity) return [];

  return data.entity
    .filter((entity: any) => entity.vehicle?.position)
    .map((entity: any) => ({
      id: entity.id || entity.vehicle?.vehicle?.id || `bus-${Date.now()}`,
      routeNumber: entity.vehicle?.trip?.route_id || "Unknown",
      location: {
        latitude: entity.vehicle.position.latitude,
        longitude: entity.vehicle.position.longitude,
      },
      heading: entity.vehicle.position.bearing || 0,
      speed: (entity.vehicle.position.speed || 0) * 3.6, // m/s to km/h
      timestamp: (entity.vehicle.timestamp || Date.now() / 1000) * 1000,
      vehicleId: entity.vehicle?.vehicle?.id || entity.id,
      agencyName: entity.vehicle?.trip?.agency_id,
    }));
}

/**
 * Fetch buses from Indian transit agencies via MobilityData
 */
export async function fetchIndianBusesFromMobilityData(): Promise<GTFSBusPosition[]> {
  if (!MOBILITY_DATA_API.enabled || !MOBILITY_DATA_API.apiKey) {
    console.warn("MobilityData API not configured.");
    return [];
  }

  try {
    console.log("🌐 Fetching Indian transit feeds from MobilityData...");
    
    // Get list of Indian transit agencies
    const feeds = await fetchMobilityDataFeeds("IN");
    
    if (feeds.length === 0) {
      console.log("No Indian feeds found in MobilityData. Trying global feeds...");
      // Try some known Indian feeds or global database
      return [];
    }

    console.log(`Found ${feeds.length} Indian transit feeds`);

    // Fetch real-time data from the first few feeds
    const allBuses: GTFSBusPosition[] = [];
    const feedsToTry = feeds.slice(0, 5); // Try first 5 feeds

    for (const feed of feedsToTry) {
      if (feed.realtime_vehicle_positions_url) {
        const buses = await fetchGTFSRealtimeData(feed.realtime_vehicle_positions_url);
        
        // Add city/agency info to each bus
        const busesWithCity = buses.map(bus => ({
          ...bus,
          city: feed.location?.city_name || feed.provider || "India",
          agencyName: feed.provider || "Transit Agency",
        }));
        
        allBuses.push(...busesWithCity);
        console.log(`✅ Loaded ${buses.length} buses from ${feed.provider || 'agency'}`);
      }
    }

    return allBuses;
  } catch (error) {
    console.error("Error fetching Indian buses from MobilityData:", error);
    return [];
  }
}

/**
 * Fetch real-time bus positions from Delhi OTD (Open Transit Data)
 * Requires API key from https://otd.delhi.gov.in/
 */
export async function fetchDelhiBuses(): Promise<GTFSBusPosition[]> {
  const config = TRANSIT_APIS.delhi;
  
  if (!config.enabled || !config.apiKey) {
    console.warn("Delhi OTD API not configured. Using simulation.");
    return [];
  }

  console.log(`🚌 Attempting Delhi OTD API with key: ${config.apiKey.substring(0, 10)}...`);

  try {
    // Try multiple possible endpoint formats
    const endpoints = [
      `${config.baseUrl}?api_key=${config.apiKey}`,
      `${config.baseUrl}.pb?api_key=${config.apiKey}`,
      `${config.baseUrl}.json?api_key=${config.apiKey}`,
      `https://otd.delhi.gov.in/data/realtime/VehiclePositions.pb?key=${config.apiKey}`,
    ];

    let data = null;
    let lastError = null;

    for (const url of endpoints) {
      try {
        console.log(`🔍 Trying: ${url.split('?')[0]}...`);
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/x-protobuf, application/json, */*',
            'User-Agent': 'SmartRide-App/1.0',
          },
          next: { revalidate: 5 },
        });

        if (response.ok) {
          const contentType = response.headers.get('content-type') || '';
          
          if (contentType.includes('json')) {
            data = await response.json();
            console.log('✅ Got JSON response from Delhi OTD');
            break;
          } else {
            // Try to parse as protobuf
            const buffer = await response.arrayBuffer();
            console.log(`📦 Got ${buffer.byteLength} bytes from Delhi OTD`);
            // For now, we'll skip protobuf parsing since it requires gtfs-realtime-bindings
            // and focus on getting JSON working first
          }
        } else {
          lastError = `HTTP ${response.status}`;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (!data) {
      throw new Error(`All Delhi OTD endpoints failed. Last error: ${lastError}`);
    }
    
    // Transform GTFS format to our format
    return data.entity?.map((entity: any) => ({
      id: entity.id,
      routeNumber: entity.vehicle?.trip?.route_id || "Unknown",
      location: {
        latitude: entity.vehicle?.position?.latitude,
        longitude: entity.vehicle?.position?.longitude,
      },
      heading: entity.vehicle?.position?.bearing || 0,
      speed: (entity.vehicle?.position?.speed || 0) * 3.6, // m/s to km/h
      timestamp: entity.vehicle?.timestamp || Date.now(),
      vehicleId: entity.vehicle?.vehicle?.id || entity.id,
    })) || [];
  } catch (error) {
    console.error("Error fetching Delhi buses:", error);
    return [];
  }
}

/**
 * Fetch real-time bus positions from BMTC Bangalore
 * Requires API key from https://www.mybmtc.com/
 */
export async function fetchBangaloreBuses(): Promise<GTFSBusPosition[]> {
  const config = TRANSIT_APIS.bangalore;
  
  if (!config.enabled || !config.apiKey) {
    console.warn("BMTC API not configured. Using simulation.");
    return [];
  }

  try {
    const response = await fetch(`${config.baseUrl}/live`, {
      headers: {
        'X-API-Key': config.apiKey,
        'Accept': 'application/json',
      },
      next: { revalidate: 5 },
    });

    if (!response.ok) {
      throw new Error(`BMTC API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.vehicles?.map((vehicle: any) => ({
      id: vehicle.vehicle_id,
      routeNumber: vehicle.route_number,
      location: {
        latitude: vehicle.latitude,
        longitude: vehicle.longitude,
      },
      heading: vehicle.bearing || 0,
      speed: vehicle.speed || 0,
      timestamp: vehicle.updated_at || Date.now(),
      vehicleId: vehicle.vehicle_id,
    })) || [];
  } catch (error) {
    console.error("Error fetching Bangalore buses:", error);
    return [];
  }
}

/**
 * Fetch buses from Google Maps Transit API
 * Requires Google Cloud API key with Transit enabled
 */
export async function fetchGoogleTransitBuses(
  city: string,
  center: { lat: number; lng: number },
  radius: number = 10000 // 10km radius
): Promise<GTFSBusPosition[]> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    console.warn("Google Maps API key not found. Using simulation.");
    return [];
  }

  try {
    // Google Maps doesn't have direct bus position API
    // But you can use Places API to find transit stations
    // Or use Directions API with transit mode for routes
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${center.lat},${center.lng}` +
      `&radius=${radius}` +
      `&type=transit_station` +
      `&key=${apiKey}`
    );

    const data = await response.json();
    
    // Note: This returns transit stations, not live buses
    // For live buses, you need GTFS-Realtime feeds
    return [];
  } catch (error) {
    console.error("Error fetching Google Transit data:", error);
    return [];
  }
}

/**
 * Unified function to fetch real-time buses from all available sources
 */
export async function fetchAllRealTimeBuses(): Promise<GTFSBusPosition[]> {
  const allBuses: GTFSBusPosition[] = [];

  // Priority 1: Try MobilityData API (has your API key!)
  if (MOBILITY_DATA_API.enabled) {
    console.log("🌐 Attempting to fetch from MobilityData API...");
    const mobilityDataBuses = await fetchIndianBusesFromMobilityData();
    if (mobilityDataBuses.length > 0) {
      console.log(`✅ Got ${mobilityDataBuses.length} real GPS buses from MobilityData!`);
      allBuses.push(...mobilityDataBuses);
      return allBuses; // Return early if we got data
    }
  }

  // Priority 2: Try direct transit APIs
  const [delhiBuses, bangaloreBuses] = await Promise.allSettled([
    fetchDelhiBuses(),
    fetchBangaloreBuses(),
  ]);

  if (delhiBuses.status === 'fulfilled') {
    allBuses.push(...delhiBuses.value);
  }

  if (bangaloreBuses.status === 'fulfilled') {
    allBuses.push(...bangaloreBuses.value);
  }

  return allBuses;
}

/**
 * Check if real-time tracking is available
 */
export function isRealTimeAvailable(): boolean {
  return MOBILITY_DATA_API.enabled || Object.values(TRANSIT_APIS).some(api => api.enabled);
}

/**
 * Get list of cities with real-time tracking
 */
export function getAvailableCities(): string[] {
  return Object.entries(TRANSIT_APIS)
    .filter(([_, config]) => config.enabled)
    .map(([city, config]) => config.name);
}
