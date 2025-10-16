import { NextRequest, NextResponse } from "next/server";
import { optimizeRoute, DijkstraGraph } from "@/lib/algorithms/dijkstra";

// Mock bus stops data (in production, this would come from a database)
const mockStops = [
  { id: "1", name: "Central Station", location: { latitude: 37.7749, longitude: -122.4194 } },
  { id: "2", name: "Market Street", location: { latitude: 37.7849, longitude: -122.4094 } },
  { id: "3", name: "Union Square", location: { latitude: 37.7879, longitude: -122.4074 } },
  { id: "4", name: "Financial District", location: { latitude: 37.7946, longitude: -122.3999 } },
  { id: "5", name: "Ferry Building", location: { latitude: 37.7956, longitude: -122.3933 } },
];

const mockRoutes = [
  {
    id: "R1",
    routeNumber: "38",
    origin: "Central Station",
    destination: "Ferry Building",
    stops: mockStops,
    distance: 3.5,
    duration: 900,
    crowdScore: 45,
    color: "#3b82f6",
  },
  {
    id: "R2",
    routeNumber: "14",
    origin: "Central Station",
    destination: "Ferry Building",
    stops: mockStops.slice(0, 3),
    distance: 2.8,
    duration: 720,
    crowdScore: 65,
    color: "#ef4444",
  },
];

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper function to generate intermediate points for a smooth route
function generateRoutePoints(
  startLat: number,
  startLon: number,
  endLat: number,
  endLon: number,
  numPoints: number = 5
): [number, number][] {
  const points: [number, number][] = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = startLat + (endLat - startLat) * t;
    const lon = startLon + (endLon - startLon) * t;
    points.push([lon, lat]);
  }
  
  return points;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, destination } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: "Origin and destination are required" },
        { status: 400 }
      );
    }

    // Helper to parse coordinates from various input formats
    const parseCoords = (input: any): { lat: number, lon: number, name?: string } => {
      // If it's already an object with lat/lon
      if (typeof input === 'object' && (input.lat || input.latitude)) {
        return {
          lat: parseFloat(input.lat || input.latitude),
          lon: parseFloat(input.lon || input.longitude),
          name: input.name
        };
      }
      
      // If it's a string like "lat, lon"
      if (typeof input === 'string') {
        const parts = input.split(',').map(p => p.trim());
        if (parts.length === 2 && !isNaN(parseFloat(parts[0])) && !isNaN(parseFloat(parts[1]))) {
          return {
            lat: parseFloat(parts[0]),
            lon: parseFloat(parts[1]),
            name: input
          };
        }
        
        // If it's a place name, generate coordinates based on hash
        // This creates consistent but varied coordinates for any place name
        const hash = input.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        // Generate coordinates that vary across the globe based on the input text
        const latBase = (hash % 160) - 80; // Range: -80 to 80 (covers most inhabited areas)
        const lonBase = (hash % 360) - 180; // Range: -180 to 180 (full longitude range)
        
        return {
          lat: latBase + (hash % 100) / 1000,
          lon: lonBase + (hash % 100) / 1000,
          name: input
        };
      }
      
      // Default fallback (center of India)
      return { lat: 20.5937, lon: 78.9629, name: 'Unknown' };
    };

    const originCoords = parseCoords(origin);
    const destCoords = parseCoords(destination);

    // Get Mapbox token from environment
    const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    let coordinates: [number, number][] = [];
    let distance = 0;
    let duration = 0;
    let alternativeCoords: [number, number][] = [];
    let alternativeDistance = 0;
    let alternativeDuration = 0;

    if (MAPBOX_TOKEN) {
      try {
        // Call Mapbox Directions API for actual road routing
        const directionsUrl = `https://api.mapbox.com/directions/v5/mapbox/driving/${originCoords.lon},${originCoords.lat};${destCoords.lon},${destCoords.lat}?alternatives=true&geometries=geojson&steps=true&access_token=${MAPBOX_TOKEN}`;
        
        const directionsResponse = await fetch(directionsUrl);
        const directionsData = await directionsResponse.json();

        if (directionsData.routes && directionsData.routes.length > 0) {
          // Primary route
          const primaryRoute = directionsData.routes[0];
          coordinates = primaryRoute.geometry.coordinates;
          distance = primaryRoute.distance / 1000; // Convert meters to km
          duration = Math.round(primaryRoute.duration); // seconds

          // Alternative route (if available)
          if (directionsData.routes.length > 1) {
            const altRoute = directionsData.routes[1];
            alternativeCoords = altRoute.geometry.coordinates;
            alternativeDistance = altRoute.distance / 1000;
            alternativeDuration = Math.round(altRoute.duration);
          } else {
            // If no alternative, use primary with slight variation
            alternativeCoords = coordinates;
            alternativeDistance = distance * 1.1;
            alternativeDuration = Math.round(duration * 1.15);
          }
        } else {
          throw new Error("No routes found");
        }
      } catch (error) {
        console.error("Mapbox Directions API error:", error);
        // Fallback to straight line if API fails
        distance = calculateDistance(
          originCoords.lat,
          originCoords.lon,
          destCoords.lat,
          destCoords.lon
        );
        duration = Math.round(distance * 300);
        coordinates = generateRoutePoints(
          originCoords.lat,
          originCoords.lon,
          destCoords.lat,
          destCoords.lon,
          8
        );
        alternativeCoords = coordinates;
        alternativeDistance = distance * 1.15;
        alternativeDuration = Math.round(duration * 1.2);
      }
    } else {
      // No Mapbox token - use straight line fallback
      distance = calculateDistance(
        originCoords.lat,
        originCoords.lon,
        destCoords.lat,
        destCoords.lon
      );
      duration = Math.round(distance * 300);
      coordinates = generateRoutePoints(
        originCoords.lat,
        originCoords.lon,
        destCoords.lat,
        destCoords.lon,
        8
      );
      alternativeCoords = coordinates;
      alternativeDistance = distance * 1.15;
      alternativeDuration = Math.round(duration * 1.2);
    }

    const crowdScore = Math.floor(Math.random() * 50) + 30; // Random 30-80

    // Generate mock stops along the route (every ~10th point)
    const stopInterval = Math.max(1, Math.floor(coordinates.length / 6));
    const stops = coordinates
      .filter((_, i) => i % stopInterval === 0 || i === 0 || i === coordinates.length - 1)
      .map((coord, i) => ({
        id: `stop-${i}`,
        name: i === 0 ? (originCoords.name || "Origin") : 
              coord === coordinates[coordinates.length - 1] ? (destCoords.name || "Destination") :
              `Stop ${i}`,
        location: { latitude: coord[1], longitude: coord[0] }
      }));

    // Create dynamic route data
    const optimizedRoute = {
      route: {
        id: "R1",
        routeNumber: Math.floor(Math.random() * 90 + 10).toString(),
        origin: originCoords.name || "Origin",
        destination: destCoords.name || "Destination",
        stops: stops,
        distance: parseFloat(distance.toFixed(2)),
        duration: duration,
        crowdScore: crowdScore,
        color: crowdScore > 60 ? "#ef4444" : crowdScore > 40 ? "#f59e0b" : "#10b981",
      },
      alternatives: [
        {
          id: "R2",
          routeNumber: Math.floor(Math.random() * 90 + 10).toString(),
          origin: originCoords.name || "Origin",
          destination: destCoords.name || "Destination",
          stops: stops.slice(0, Math.max(2, Math.floor(stops.length * 0.7))),
          distance: parseFloat(alternativeDistance.toFixed(2)),
          duration: alternativeDuration,
          crowdScore: Math.max(20, crowdScore - 25),
          color: "#3b82f6",
        }
      ],
      totalDistance: distance,
      totalDuration: duration,
      crowdAvoidance: 100 - crowdScore,
      coordinates,
      alternativeCoordinates: alternativeCoords,
      path: coordinates.map((_, i) => i.toString()),
    };

    // Cache for offline mode
    return NextResponse.json(optimizedRoute, {
      headers: {
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    console.error("Route optimization error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { 
        error: "Failed to optimize route",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
